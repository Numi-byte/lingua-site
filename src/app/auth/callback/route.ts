import { NextRequest, NextResponse } from 'next/server'
import { supabaseFromRoute } from '@/lib/supabaseRoute'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/auth/after'
  const res = NextResponse.redirect(new URL(next, url.origin))
  if (!code) return res
  try {
    const supabase = supabaseFromRoute(req, res)
    await supabase.auth.exchangeCodeForSession(code)
  } catch {}
  return res
}
