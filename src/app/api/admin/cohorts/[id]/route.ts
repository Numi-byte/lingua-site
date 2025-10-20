export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { extractPriceId } from '@/lib/priceUtils'

/** GET one */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const db = supabaseAdmin()
  const { data, error } = await db.from('cohorts').select('*').eq('id', id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data })
}

/** PUT update (sanitizes price_id; recomputes label/schedule if timing fields change) */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const body = (await req.json()) as Partial<{
    label: string
    language: 'Italian' | 'German'
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
    start_date: string
    days: string[]
    start_time: string
    timezone: string
    duration_min: number
    capacity: number
    status: 'open' | 'closed' | 'finished'
    price_id: string | null
  }>

  const db = supabaseAdmin()
  const { data: current, error: curErr } = await db.from('cohorts').select('*').eq('id', id).maybeSingle()
  if (curErr) return NextResponse.json({ error: curErr.message }, { status: 400 })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // sanitize price_id if present
  const cleanPrice = Object.prototype.hasOwnProperty.call(body, 'price_id')
    ? extractPriceId(body.price_id as any)
    : undefined

  const next = { ...current, ...body, ...(cleanPrice !== undefined ? { price_id: cleanPrice } : {}) }

  // recompute label/schedule if key fields change and label not explicitly provided
  const recompute = ['level', 'start_date', 'days', 'start_time', 'timezone'].some(k => k in body) && !('label' in body)
  const update: Record<string, unknown> = {
    ...body,
    ...(cleanPrice !== undefined ? { price_id: cleanPrice } : {}),
  }

  if (recompute) {
    const level = next.level
    const start_date = next.start_date
    const start_time = next.start_time
    const days = Array.isArray(next.days) ? next.days : []
    const tz = next.timezone || 'Europe/Rome'

    if (!start_date || !start_time || days.length === 0) {
      return NextResponse.json({ error: 'start_date, start_time and days are required to recompute schedule' }, { status: 400 })
    }

    update['label'] = `${level} ${fmtMonthDay(start_date)} · ${joinDays(days)} ${start_time}`
    update['schedule'] = `${joinDays(days)} · ${start_time} (${tz}) · Online`
  }

  if (typeof body.capacity === 'number') update['capacity'] = Math.max(0, body.capacity)

  const { error: upErr } = await db.from('cohorts').update(update).eq('id', id)
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

/** DELETE */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const db = supabaseAdmin()
  const { error } = await db.from('cohorts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

/* helpers */
function fmtMonthDay(iso: string) {
  try { return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: '2-digit' }) }
  catch { return iso }
}
function joinDays(days: string[]) {
  if (days.length === 1) return days[0]
  if (days.length === 2) return `${days[0]} & ${days[1]}`
  return `${days.slice(0, -1).join(', ')} & ${days[days.length - 1]}`
}
