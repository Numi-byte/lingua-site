import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin()
  const { data, error } = await db.from('enrollments').select('email').eq('cohort_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const emails = (data ?? []).map(r => r.email).filter(Boolean)
  return NextResponse.json({ emails })
}
