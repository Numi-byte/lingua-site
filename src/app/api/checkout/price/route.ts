import Stripe from 'stripe'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' })

export async function POST(req: Request) {
  const { price_id, lang } = await req.json() as { price_id: string, lang?: string }
  if (!price_id) return NextResponse.json({ error: 'Missing price_id' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    metadata: { priceId: price_id, lang: lang || 'unspecified' }
  })

  return NextResponse.json({ url: session.url })
}
