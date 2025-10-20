import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll().map(cookie => ({ name: cookie.name, value: cookie.value })),
        setAll: (cookies) => cookies.forEach(cookie => res.cookies.set({ name: cookie.name, value: cookie.value, ...cookie.options })),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return NextResponse.json({ authenticated: !!user, email: user?.email ?? null })
}
