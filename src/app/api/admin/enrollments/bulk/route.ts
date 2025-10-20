import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const body = await req.json() as { action: 'move'|'delete', ids: string[], cohort_id?: string }
  const db = supabaseAdmin()

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
  }

  if (body.action === 'move') {
    if (!body.cohort_id) return NextResponse.json({ error: 'Missing cohort_id' }, { status: 400 })
    const { error } = await db.from('enrollments').update({ cohort_id: body.cohort_id, status: 'moved' }).in('id', body.ids)
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
