import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export function supabaseFromRoute(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll().map(cookie => ({ name: cookie.name, value: cookie.value })),
        setAll: (cookies: Array<{ name: string; value: string; options?: any }>) => {
          cookies.forEach(cookie => res.cookies.set({ name: cookie.name, value: cookie.value, ...cookie.options }))
        },
      },
    }
  )
}
