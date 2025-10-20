export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type EnrollBody = {
  email: string
  cohort_id: string
}

export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('enrollments_view')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  let body: EnrollBody
  try {
    body = (await req.json()) as EnrollBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.email || !body?.cohort_id) {
    return NextResponse.json({ error: 'Missing email or cohort_id' }, { status: 400 })
  }

  const db = supabaseAdmin()

  // (Optional) validate cohort exists
  const { data: cohort, error: cErr } = await db
    .from('cohorts')
    .select('id,status,capacity')
    .eq('id', body.cohort_id)
    .maybeSingle()
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 400 })
  if (!cohort) return NextResponse.json({ error: 'Cohort not found' }, { status: 404 })

  // prevent duplicates (email, cohort_id)
  const { data: found, error: fErr } = await db
    .from('enrollments')
    .select('id')
    .eq('email', body.email)
    .eq('cohort_id', body.cohort_id)
    .limit(1)

  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 400 })
  if (found?.length) return NextResponse.json({ ok: true, note: 'already enrolled' })

  const { error: insErr } = await db
    .from('enrollments')
    .insert({ email: body.email, cohort_id: body.cohort_id, status: 'confirmed', source: 'admin' })

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
