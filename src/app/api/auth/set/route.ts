import { NextRequest, NextResponse } from 'next/server'
import { supabaseFromRoute } from '@/lib/supabaseRoute'

export async function POST(req: NextRequest) {
  const { access_token, refresh_token } = await req.json().catch(() => ({}))
  const res = NextResponse.json({ ok: true })
  if (!access_token || !refresh_token) return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
  const supabase = supabaseFromRoute(req, res)
  const { error } = await supabase.auth.setSession({ access_token, refresh_token })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return res
}
