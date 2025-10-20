export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseFromRoute } from '@/lib/supabaseRoute'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/dashboard'

  // Redirect response that Supabase can mutate (set cookies)
  const res = NextResponse.redirect(new URL(next, url.origin))

  if (!code) {
    // no code — send back to /auth
    res.headers.set('Location', new URL('/auth', url.origin).toString())
    return res
  }

  const supabase = supabaseFromRoute(req, res)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    res.headers.set('Location', new URL('/auth?error=1', url.origin).toString())
  }

  return res
}
