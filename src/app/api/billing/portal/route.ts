import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerRSC } from '@/lib/supabaseServerRSC'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' })

export async function POST(req: NextRequest) {
  const db = await supabaseServerRSC()
  const { data: { user } } = await db.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Strategy: find (or create) Stripe customer by email
  const list = await stripe.customers.list({ email: user.email, limit: 1 })
  const customer = list.data[0] ?? await stripe.customers.create({ email: user.email })

  const urlBase = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${urlBase}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
