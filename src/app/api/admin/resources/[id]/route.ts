export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Params = Promise<{ id: string }>

type ResourceUpdate = Partial<{
  title: string
  url: string
  language: 'Italian' | 'German'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  cohort_id: string | null
}>

/** PUT /api/admin/resources/[id] */
export async function PUT(req: Request, ctx: { params: Params }) {
  const { id } = await ctx.params

  let body: ResourceUpdate
  try {
    body = (await req.json()) as ResourceUpdate
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { error } = await db.from('resources').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/resources/[id] */
export async function DELETE(_req: Request, ctx: { params: Params }) {
  const { id } = await ctx.params
  const db = supabaseAdmin()

  const { error } = await db.from('resources').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
