export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const db = supabaseAdmin()
  const { data, error } = await db.from('cohorts').select('*').eq('id', id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const clone = {
    ...data,
    id: undefined,
    status: 'open' as const,
    label: `${data.label} (copy)`,
    created_at: undefined,
  }

  const { error: insErr } = await db.from('cohorts').insert(clone as any)
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
