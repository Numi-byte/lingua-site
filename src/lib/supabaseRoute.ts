import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { parse as parseCookieHeader } from 'cookie'

/**
 * Server route helper: anon Supabase client (no cookie bridging).
 * Use this when you don't need to mutate auth cookies.
 */
export function supabaseRoute() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createServerClient(url, anon, {
    auth: { persistSession: false },
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  })
}

/**
 * Server route helper with cookie bridging (for auth flows: sign-in/callback/sign-out).
 * Works with `Request` and a mutable `NextResponse` so Supabase can set/clear cookies.
 */
export function supabaseFromRoute(req: Request, res: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const header = req.headers.get('cookie') ?? ''
  const parsed = parseCookieHeader(header) // { name: value }

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return Object.entries(parsed).map(([name, value]) => ({ name, value: value ?? '' }))
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          res.cookies.set({ name, value, ...options })
        })
      },
    },
  })
}

/** Typed JSON parser (avoids `any`). */
export async function parseJson<T>(req: Request): Promise<T> {
  return (await req.json()) as T
}
