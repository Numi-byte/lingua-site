export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const body = (await req.json()) as { status: 'open' | 'closed' | 'finished' }

  const db = supabaseAdmin()
  const { error } = await db.from('cohorts').update({ status: body.status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
