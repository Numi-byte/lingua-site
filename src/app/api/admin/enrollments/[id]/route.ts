export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Params = Promise<{ id: string }>

/**
 * GET /api/admin/enrollments/[id]
 * Returns the raw enrollment row plus a few cohort fields.
 */
export async function GET(_req: Request, ctx: { params: Params }) {
  const { id } = await ctx.params
  const db = supabaseAdmin()

  // You can switch this to select from enrollments_view if you prefer.
  const { data, error } = await db
    .from('enrollments')
    .select('id,email,cohort_id,status,created_at,source, cohorts(label,language,level,start_date)')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data })
}

/**
 * PUT /api/admin/enrollments/[id]
 * Accepts partial update:
 *  - status: 'pending' | 'confirmed' | 'moved' | 'cancelled'
 *  - cohort_id: uuid  (to move the learner)
 */
export async function PUT(req: Request, ctx: { params: Params }) {
  const { id } = await ctx.params
  const db = supabaseAdmin()

  const body = (await req.json()) as Partial<{
    status: 'pending' | 'confirmed' | 'moved' | 'cancelled'
    cohort_id: string
  }>

  const update: Record<string, unknown> = {}
  if (body.status) update.status = body.status
  if (body.cohort_id) update.cohort_id = body.cohort_id

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await db.from('enrollments').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/admin/enrollments/[id]
 * Removes the enrollment row.
 */
export async function DELETE(_req: Request, ctx: { params: Params }) {
  const { id } = await ctx.params
  const db = supabaseAdmin()

  const { error } = await db.from('enrollments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
