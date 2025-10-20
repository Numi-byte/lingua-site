export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Body = {
  action: 'move' | 'delete'
  ids: string[]
  cohort_id?: string
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const db = supabaseAdmin()

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
  }

  if (body.action === 'move') {
    if (!body.cohort_id) {
      return NextResponse.json({ error: 'Missing cohort_id' }, { status: 400 })
    }

    // (Optional) verify target cohort exists
    const { data: cohort, error: cErr } = await db
      .from('cohorts')
      .select('id')
      .eq('id', body.cohort_id)
      .maybeSingle()
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 400 })
    if (!cohort) return NextResponse.json({ error: 'Target cohort not found' }, { status: 404 })

    const { error } = await db
      .from('enrollments')
      .update({ cohort_id: body.cohort_id, status: 'moved' })
      .in('id', body.ids)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, moved: body.ids.length })
  }

  if (body.action === 'delete') {
    const { error } = await db.from('enrollments').delete().in('id', body.ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, removed: body.ids.length })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
