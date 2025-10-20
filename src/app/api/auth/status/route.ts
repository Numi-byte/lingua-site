export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: () => {}, // not needed here
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ authenticated: false, email: null, isAdmin: false })

  let isAdmin = false
  try {
    const adminDb = supabaseAdmin()
    const { data: rows } = await adminDb.from('admins').select('email').eq('email', user.email).limit(1)
    isAdmin = Boolean(rows?.length)
  } catch { /* ignore */ }

  return NextResponse.json({ authenticated: true, email: user.email, isAdmin })
}
