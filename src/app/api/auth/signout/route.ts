import { NextRequest, NextResponse } from 'next/server'
import { supabaseFromRoute } from '@/lib/supabaseRoute'

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  const supabase = supabaseFromRoute(req, res)
  await supabase.auth.signOut()
  return res
}
