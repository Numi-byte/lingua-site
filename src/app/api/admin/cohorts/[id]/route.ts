import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin()
  const body = await req.json()
  const { error } = await db.from('cohorts').update(body).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin()
  const { error } = await db.from('cohorts').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
