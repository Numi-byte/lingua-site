import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // Prepare a mutable response so Supabase can set/refresh cookies if needed
  const res = NextResponse.json({ ok: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set({ name, value, ...options }),
          ),
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return NextResponse.json({ isAdmin: false }, { status: 200 })

  // Check admin table
  const { data: rows, error } = await supabase
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .limit(1)

  if (error) return NextResponse.json({ isAdmin: false }, { status: 200 })
  return NextResponse.json({ isAdmin: Boolean(rows?.length) })
}
