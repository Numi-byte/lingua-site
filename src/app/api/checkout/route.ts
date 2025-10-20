import Stripe from 'stripe'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' })

export async function POST(req: Request) {
  try {
    const { priceId, email, lang, level, cohort_id, start_date } = await req.json()

    if (!priceId || !lang) {
      return NextResponse.json({ error: 'Missing priceId or lang' }, { status: 400 })
    }

    const successBase = process.env.NEXT_PUBLIC_SITE_URL || 'http://linguaby.org'
    const isFreeClass = priceId === process.env.NEXT_PUBLIC_PRICE_FREECLASS
    const discounts =
      isFreeClass && process.env.STRIPE_COUPON_FREECLASS
        ? [{ coupon: process.env.STRIPE_COUPON_FREECLASS }]
        : undefined

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      metadata: {
        lang,                   // Italian | German
        level: level ?? '',     // A1 | A2 | B1 | B2 | WK | FREE
        cohort_id: cohort_id ?? '',
        start_date: start_date ?? '',
        priceId,
      },
      allow_promotion_codes: true,
      discounts,
      success_url: `${successBase}/book?paid=1`,
      cancel_url: `${successBase}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err?.message || 'Stripe error' }, { status: 500 })
  }
}
