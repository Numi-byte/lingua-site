export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * GET /api/admin/cohorts/[id]
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const db = supabaseAdmin()
  const { data, error } = await db.from('cohorts').select('*').eq('id', id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data })
}

/**
 * PUT /api/admin/cohorts/[id]
 * Accepts partial updates. If days/start_time/start_date/level change,
 * we recompute label & schedule on the server for consistency.
 */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const payload = (await req.json()) as Partial<{
    language: 'Italian' | 'German'
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
    start_date: string
    days: string[]                  // ['Mon','Wed',...]
    start_time: string              // 'HH:MM'
    duration_min: number
    timezone: string
    capacity: number
    status: 'open' | 'closed' | 'finished'
    price_id: string
  }>

  const db = supabaseAdmin()

  // Load current row (needed for recompute)
  const { data: current, error: curErr } = await db.from('cohorts').select('*').eq('id', id).maybeSingle()
  if (curErr) return NextResponse.json({ error: curErr.message }, { status: 400 })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Build next state to decide if label/schedule must be recomputed
  const next = { ...current, ...payload }

  // Validate days/time if provided
  const WD = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const
  type Wd = typeof WD[number]
  let daysValid: Wd[] | undefined
  if (Array.isArray(payload.days)) {
    daysValid = payload.days.filter((d): d is Wd => (WD as readonly string[]).includes(d))
    if (daysValid.length === 0) {
      return NextResponse.json({ error: 'days must include at least one weekday' }, { status: 400 })
    }
  }

  if (payload.start_time && !/^\d{2}:\d{2}$/.test(payload.start_time)) {
    return NextResponse.json({ error: 'start_time must be HH:MM' }, { status: 400 })
  }

  // Decide whether to recompute label & schedule (if any of these changed)
  const recompute =
    typeof payload.level !== 'undefined' ||
    typeof payload.start_date !== 'undefined' ||
    typeof payload.start_time !== 'undefined' ||
    typeof payload.days !== 'undefined' ||
    typeof payload.timezone !== 'undefined'

  const update: Record<string, unknown> = { ...payload }

  if (recompute) {
    const level = (next.level ?? current.level) as string
    const start_date = (next.start_date ?? current.start_date) as string | null
    const start_time = (next.start_time ?? current.start_time) as string | null
    const timezone = (next.timezone ?? current.timezone ?? 'Europe/Rome') as string
    const days: string[] = daysValid ?? (Array.isArray(next.days) ? next.days : (current.days ?? []))

    if (!start_date || !start_time || days.length === 0) {
      return NextResponse.json({ error: 'start_date, start_time and days are required to recompute schedule' }, { status: 400 })
    }

    update['label'] = makeLabel(level, start_date, days, start_time)
    update['schedule'] = `${joinDays(days)} · ${start_time} (${timezone}) · Online`
  }

  // Normalize capacity if provided
  if (typeof payload.capacity === 'number') {
    update['capacity'] = Math.max(0, payload.capacity)
  }

  const { error: upErr } = await db.from('cohorts').update(update).eq('id', id)
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/admin/cohorts/[id]
 */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const db = supabaseAdmin()
  const { error } = await db.from('cohorts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

/* ---------------- helpers ---------------- */

function makeLabel(level: string, isoDate: string, days: string[], time: string) {
  return `${level} ${fmtMonthDay(isoDate)} · ${joinDays(days)} ${time}`
}
function fmtMonthDay(iso: string) {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
    })
  } catch { return iso }
}
function joinDays(days: string[]) {
  if (days.length === 1) return days[0]
  if (days.length === 2) return `${days[0]} & ${days[1]}`
  return `${days.slice(0, -1).join(', ')} & ${days[days.length - 1]}`
}
