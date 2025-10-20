// src/app/api/stripe-webhook/route.ts
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

/** Build a price → credits map only for envs that exist (safe on missing vars). */
function buildPriceCredits() {
  const map: Record<string, number> = {}
  const add = (envKey: string | undefined, credits: number) => {
    if (envKey) map[envKey] = credits
  }
  // All your cohort/group products grant 0 credits (kept for future 1:1 SKUs)
  add(process.env.NEXT_PUBLIC_PRICE_A1, 0)
  add(process.env.NEXT_PUBLIC_PRICE_A2, 0)
  add(process.env.NEXT_PUBLIC_PRICE_B1, 0)
  add(process.env.NEXT_PUBLIC_PRICE_B2, 0)
  add(process.env.NEXT_PUBLIC_PRICE_WEEKEND_PRON, 0)
  add(process.env.NEXT_PUBLIC_PRICE_FREECLASS, 0)
  return map
}
const PRICE_TO_CREDITS = buildPriceCredits()

export async function POST(req: Request) {
  // Stripe signature verification (requires raw body)
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  const rawBody = Buffer.from(await req.arrayBuffer())

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('❌ Invalid Stripe webhook:', err?.message || err)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Supabase (Service Role – server-only, bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    switch (event.type) {
      /**
       * Success paths: immediate or async-confirmed payments
       */
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const s = event.data.object as Stripe.Checkout.Session

        // --- extract basics
        const email =
          s.customer_email ||
          (typeof s.customer_details?.email === 'string' ? s.customer_details.email : null) ||
          ''
        const amount = s.amount_total ?? 0
        const currency = s.currency ?? 'eur'
        const sessionId = s.id

        // --- metadata we set at checkout
        const priceId = (s.metadata?.priceId as string | undefined) ?? 'unknown'
        const lang = (s.metadata?.lang as string | undefined) ?? 'unspecified'
        const cohortId = (s.metadata?.cohort_id as string | undefined) ?? null
        const level = (s.metadata?.level as string | undefined) ?? null
        const startDate = (s.metadata?.start_date as string | undefined) ?? null
        const label = (s.metadata?.label as string | undefined) ?? null

        // --- 1) Log purchase (idempotent on session_id)
        {
          const { error } = await supabase.from('purchases').upsert(
            {
              session_id: sessionId,
              email,
              price_id: priceId,
              amount_total: amount,
              currency,
              status: 'completed',
              lang,
              metadata: { level, cohort_id: cohortId, start_date: startDate, label },
            },
            { onConflict: 'session_id' }
          )
          if (error) throw error
        }

        // --- 2) Optional credits (for 1:1 products if you add them later)
        const credits = PRICE_TO_CREDITS[priceId] ?? 0
        if (credits > 0 && email) {
          const { data: existing, error: selErr } = await supabase
            .from('credit_ledger')
            .select('id')
            .eq('source', `purchase:${sessionId}`)
            .limit(1)
          if (selErr) throw selErr
          if (!existing?.length) {
            const { error: insErr } = await supabase.from('credit_ledger').insert({
              email,
              delta_credits: credits,
              source: `purchase:${sessionId}`,
              notes: `Granted ${credits} credits for ${priceId}`,
            })
            if (insErr) throw insErr
          }
        }

        // --- 3) Create enrollment if metadata contained a cohort
        if (email && cohortId) {
          // idempotent: check existing first
          const { data: found, error: fErr } = await supabase
            .from('enrollments')
            .select('id')
            .eq('email', email)
            .eq('cohort_id', cohortId)
            .limit(1)
          if (fErr) throw fErr

          if (!found?.length) {
            const { error: eIns } = await supabase.from('enrollments').insert({
              email,
              cohort_id: cohortId,
              status: 'confirmed',
              source: 'stripe',
            })
            if (eIns) throw eIns
          }
        }

        // --- 4) ✅ Clear the seat hold tied to this checkout session
        // (We attached session_id to the hold when we created the checkout session)
        await supabase.from('cohort_holds').delete().eq('session_id', sessionId)

        break
      }

      /**
       * Failure / timeout paths: free the hold immediately
       */
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const s = event.data.object as Stripe.Checkout.Session
        await supabase.from('cohort_holds').delete().eq('session_id', s.id)
        break
      }

      default:
        // Not handled → OK 200 so Stripe stops retrying
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('❌ Webhook handler error:', err?.message || err)
    return NextResponse.json({ error: `Webhook Handler Error: ${err.message}` }, { status: 500 })
  }
}
