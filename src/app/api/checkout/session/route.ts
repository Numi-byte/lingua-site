import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' })

/**
 * POST /api/checkout/session
 * body: { cohort_id: string, lang: 'Italian'|'German', email?: string }
 */
export async function POST(req: Request) {
  const { cohort_id, lang, email } = await req.json() as {
    cohort_id: string
    lang: 'Italian' | 'German'
    email?: string
  }

  if (!cohort_id || !lang) {
    return NextResponse.json({ error: 'Missing cohort_id or lang' }, { status: 400 })
  }

  const db = supabaseAdmin()

  // 1) Load cohort
  const { data: cohort, error: cErr } = await db
    .from('cohorts')
    .select('id,label,language,level,start_date,schedule,capacity,status,price_id')
    .eq('id', cohort_id)
    .maybeSingle()

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 400 })
  if (!cohort) return NextResponse.json({ error: 'Cohort not found' }, { status: 404 })
  if (cohort.status !== 'open') return NextResponse.json({ error: 'Cohort not open' }, { status: 409 })
  if (!cohort.price_id) return NextResponse.json({ error: 'Cohort has no Stripe price_id' }, { status: 409 })

  // 2) Seats left = capacity - enrollments - active holds
  const [{ data: enr }, { data: holds }] = await Promise.all([
    db.from('enrollments').select('id').eq('cohort_id', cohort_id),
    db.from('cohort_holds').select('expires_at').eq('cohort_id', cohort_id)
  ])
  const enrolled = (enr ?? []).length
  const activeHolds = (holds ?? []).filter(h => new Date(h.expires_at) > new Date()).length
  const cap = cohort.capacity ?? 0

  if (enrolled + activeHolds >= cap) {
    return NextResponse.json({ error: 'Cohort is full' }, { status: 409 })
  }

  // 3) Create a 15-minute hold (email may be null — DB allows it)
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  const { data: holdRow, error: hErr } = await db
    .from('cohort_holds')
    .insert({ cohort_id, email: email || null, expires_at })
    .select('id')
    .maybeSingle()

  if (hErr || !holdRow) {
    return NextResponse.json({ error: hErr?.message || 'Could not create seat hold' }, { status: 500 })
  }

  try {
    // 4) Create Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: cohort.price_id!, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: email, // optional
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
      metadata: {
        priceId: cohort.price_id!,
        lang,
        cohort_id,
        level: cohort.level || '',
        start_date: cohort.start_date || '',
        label: cohort.label || '',
      },
    })

    // Attach session_id to hold (webhook uses this to clear)
    await db.from('cohort_holds').update({ session_id: session.id }).eq('id', holdRow.id)

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    // Roll back the hold if Stripe fails
    await db.from('cohort_holds').delete().eq('id', holdRow.id)
    return NextResponse.json({ error: e?.message || 'Stripe error' }, { status: 500 })
  }
}
