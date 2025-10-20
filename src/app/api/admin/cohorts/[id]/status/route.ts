import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json() // { status: 'open'|'closed'|'finished' }
  const db = supabaseAdmin()
  const { error } = await db.from('cohorts').update({ status: body.status }).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
