export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseFromRoute } from '@/lib/supabaseRoute'

type SetBody = { access_token: string; refresh_token: string }

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true })
  const supabase = supabaseFromRoute(req, res)

  let body: SetBody
  try { body = (await req.json()) as SetBody } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.access_token || !body.refresh_token) return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })

  const { error } = await supabase.auth.setSession(body)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return res
}
