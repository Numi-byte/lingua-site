export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { extractPriceId } from '@/lib/priceUtils'

type CohortInsert = {
  label?: string
  language: 'Italian' | 'German'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  start_date: string
  days: string[]
  start_time: string
  timezone?: string
  duration_min?: number
  capacity?: number
  status?: 'open' | 'closed' | 'finished'
  price_id?: string | null
}

export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db.from('cohorts').select('*').order('start_date', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  let body: CohortInsert
  try { body = (await req.json()) as CohortInsert } 
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // sanitize price_id
  const cleanPrice = extractPriceId(body.price_id ?? undefined)

  const update = {
    ...body,
    price_id: cleanPrice, // may be null if invalid or not provided
  }

  // Build label/schedule if not provided
  const days = Array.isArray(body.days) ? body.days : []
  const tz = body.timezone || 'Europe/Rome'
  const label = body.label || `${body.level} ${fmtMonthDay(body.start_date)} · ${joinDays(days)} ${body.start_time}`
  const schedule = `${joinDays(days)} · ${body.start_time} (${tz}) · Online`

  const row = {
    ...update,
    label,
    schedule,
    status: body.status ?? 'open',
    duration_min: body.duration_min ?? 60,
    capacity: body.capacity ?? 12,
  }

  const db = supabaseAdmin()
  const { error } = await db.from('cohorts').insert(row as any)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

/* helpers */
function fmtMonthDay(iso: string) {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
  } catch { return iso }
}
function joinDays(days: string[]) {
  if (days.length === 1) return days[0]
  if (days.length === 2) return `${days[0]} & ${days[1]}`
  return `${days.slice(0, -1).join(', ')} & ${days[days.length - 1]}`
}
