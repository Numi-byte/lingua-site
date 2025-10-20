import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { cohort_id, emails } = await req.json() as { cohort_id: string; emails: string[] }
  if (!cohort_id || !Array.isArray(emails)) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const valid = Array.from(new Set(emails)).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  const invalid = emails.filter(e => !valid.includes(e))

  const db = supabaseAdmin()

  // Fetch existing to prevent duplicates
  const { data: existing, error: selErr } = await db
    .from('enrollments')
    .select('email')
    .eq('cohort_id', cohort_id)
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 400 })

  const existingSet = new Set((existing ?? []).map(r => r.email))
  const toInsert = valid.filter(e => !existingSet.has(e)).map(email => ({
    email, cohort_id, status: 'confirmed', source: 'import',
  }))

  if (toInsert.length) {
    const { error: insErr } = await db.from('enrollments').insert(toInsert)
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
  }

  const skipped = valid.filter(e => existingSet.has(e))
  return NextResponse.json({ inserted: toInsert, skipped, invalid })
}
