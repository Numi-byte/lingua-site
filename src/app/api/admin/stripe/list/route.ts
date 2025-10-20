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
  const limit = Math.min(Number(url.searchParams.get('limit') || 20), 100)
  const startingAfter = url.searchParams.get('starting_after') || undefined
  const expandParam = url.searchParams.get('expand') || ''
  const expand = expandParam ? expandParam.split(',') : undefined

  try {
    switch (resource) {
      case 'products': {
        const res = await stripe.products.list({ limit, starting_after: startingAfter, expand })
        return ok(withCursor(res))
      }
      case 'prices': {
        const res = await stripe.prices.list({ limit, starting_after: startingAfter, expand })
        return ok(withCursor(res))
      }
      case 'customers': {
        const res = await stripe.customers.list({ limit, starting_after: startingAfter, expand })
        return ok(withCursor(res))
      }
      case 'checkout_sessions': {
        // Tip: set expand=line_items to include line items inline
        const res = await stripe.checkout.sessions.list({ limit, starting_after: startingAfter, expand })
        return ok(withCursor(res))
      }
      case 'payment_intents': {
        const res = await stripe.paymentIntents.list({ limit, starting_after: startingAfter, expand })
        return ok(withCursor(res))
      }
      case 'events': {
        const res = await stripe.events.list({ limit, starting_after: startingAfter, expand })
        return ok(withCursor(res))
      }
      case 'coupons': {
        const res = await stripe.coupons.list({ limit, starting_after: startingAfter, expand })
        return ok(withCursor(res))
      }
      case 'promotion_codes': {
        const res = await stripe.promotionCodes.list({ limit, starting_after: startingAfter, expand })
        return ok(withCursor(res))
      }
      default:
        return bad('Unknown resource. Use one of: products, prices, customers, checkout_sessions, payment_intents, events, coupons, promotion_codes')
    }
  } catch (e: any) {
    console.error(e)
    return bad(e?.message || 'Stripe error', 500)
  }
}

function withCursor<T extends { data: Array<{ id: string }>, has_more: boolean }>(res: T) {
  const lastId = res.data.length ? res.data[res.data.length - 1].id : null
  return { ...res, next_starting_after: res.has_more ? lastId : null }
}
