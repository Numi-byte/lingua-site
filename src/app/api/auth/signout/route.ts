export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { supabaseFromRoute } from '@/lib/supabaseRoute'

export async function POST(req: Request) {
  // Create a response we can mutate (cookies)
  const res = NextResponse.json({ ok: true })
  const supabase = supabaseFromRoute(req, res)

  // This will also clear the auth cookies via our cookie bridge
  await supabase.auth.signOut()

  return res
}
