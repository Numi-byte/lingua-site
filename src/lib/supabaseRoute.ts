import { createClient } from '@supabase/supabase-js'

/**
 * Server route helper: lightweight Supabase client with anon key.
 * Use supabaseAdmin() (Service Role) for admin API routes.
 */
export function supabaseRoute() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anon, { auth: { persistSession: false } })
}

/** Typed JSON parser for route handlers (no `any`). */
export async function parseJson<T>(req: Request): Promise<T> {
  const data = (await req.json()) as T
  return data
}
