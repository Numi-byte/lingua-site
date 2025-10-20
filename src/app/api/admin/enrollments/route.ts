import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db.from('enrollments_view').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json() // { email, cohort_id }
  const db = supabaseAdmin()

  // prevent duplicates (email, cohort_id)
  const { data: found, error: fErr } = await db.from('enrollments').select('id').eq('email', body.email).eq('cohort_id', body.cohort_id).limit(1)
  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 400 })
  if (found?.length) return NextResponse.json({ ok: true, note: 'already enrolled' })

  const { error } = await db.from('enrollments').insert({ email: body.email, cohort_id: body.cohort_id, status: 'confirmed' })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
