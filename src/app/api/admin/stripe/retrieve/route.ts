import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { supabaseServerRSC } from '@/lib/supabaseServerRSC'

export const runtime = 'nodejs'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' })

function ok(data: any) { return NextResponse.json(data) }
function bad(msg: string, code = 400) { return NextResponse.json({ error: msg }, { status: code }) }

export async function GET(req: Request) {
  // ---- Admin check ----
  const supa = await supabaseServerRSC()
  const { data: { user } } = await supa.auth.getUser()
  if (!user?.email) return bad('Unauthorized', 401)
  const { data: allowed } = await supa.from('admins').select('email').eq('email', user.email).limit(1)
  if (!allowed?.length) return bad('Forbidden', 403)

  const url = new URL(req.url)
  const resource = url.searchParams.get('resource') || ''
  const id = url.searchParams.get('id') || ''
  const expandParam = url.searchParams.get('expand') || ''
  const expand = expandParam ? expandParam.split(',') : undefined
  if (!resource || !id) return bad('Missing resource or id')

  try {
    switch (resource) {
      case 'product': return ok(await stripe.products.retrieve(id, { expand }))
      case 'price': return ok(await stripe.prices.retrieve(id, { expand }))
      case 'customer': return ok(await stripe.customers.retrieve(id, { expand }))
      case 'checkout_session': return ok(await stripe.checkout.sessions.retrieve(id, { expand })) // e.g. expand=line_items
      case 'payment_intent': return ok(await stripe.paymentIntents.retrieve(id, { expand }))
      case 'event': return ok(await stripe.events.retrieve(id, { expand }))
      case 'coupon': return ok(await stripe.coupons.retrieve(id, { expand }))
      case 'promotion_code': return ok(await stripe.promotionCodes.retrieve(id, { expand }))
      default: return bad('Unknown resource. Use: product, price, customer, checkout_session, payment_intent, event, coupon, promotion_code')
    }
  } catch (e: any) {
    console.error(e)
    return bad(e?.message || 'Stripe error', 500)
  }
}
