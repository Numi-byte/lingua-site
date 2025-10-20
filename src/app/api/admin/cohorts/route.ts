import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const WD = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const
type Wd = typeof WD[number]

export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db.from('cohorts').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    // Basic validation
    const language: 'Italian'|'German' = body.language
    const level: 'A1'|'A2'|'B1'|'B2'|'C1' = body.level
    const start_date: string = body.start_date
    const days: Wd[] = (body.days || []).filter((d: any) => WD.includes(d))
    const start_time: string = body.start_time
    const duration_min: number = Number(body.duration_min || 60)
    const timezone: string = body.timezone || 'Europe/Rome'
    const capacity: number = Math.max(0, Number(body.capacity || 8))
    const status: 'open'|'closed'|'finished' = body.status || 'open'
    const price_id: string = body.price_id

    if (!language || !level || !start_date || !start_time || !price_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!Array.isArray(days) || days.length === 0 || days.length > 4) {
      return NextResponse.json({ error: 'Pick 1–4 weekdays' }, { status: 400 })
    }
    if (!/^\d{2}:\d{2}$/.test(start_time)) {
      return NextResponse.json({ error: 'start_time must be HH:MM' }, { status: 400 })
    }

    const label = makeLabel(level, start_date, days, start_time)
    const schedule = `${joinDays(days)} · ${start_time} (${timezone}) · Online`

    const db = supabaseAdmin()
    const { error } = await db.from('cohorts').insert({
      language, level, start_date, schedule, capacity, status, price_id,
      label,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, label, schedule })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Invalid payload' }, { status: 400 })
  }
}

function makeLabel(level: string, isoDate: string, days: string[], time: string) {
  return `${level} ${fmtMonthDay(isoDate)} · ${joinDays(days)} ${time}`
}
function fmtMonthDay(iso: string) {
  try { return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: '2-digit' }) } catch { return iso }
}
function joinDays(days: string[]) {
  if (days.length === 1) return days[0]
  if (days.length === 2) return `${days[0]} & ${days[1]}`
  return `${days.slice(0,-1).join(', ')} & ${days[days.length-1]}`
}
