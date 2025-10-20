export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  const db = supabaseAdmin()
  const { data, error } = await db.from('enrollments').select('email').eq('cohort_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const emails = (data ?? []).map((r) => r.email).filter(Boolean)
  return NextResponse.json({ emails })
}
