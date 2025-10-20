// Server-only Supabase client with Service Role (bypasses RLS).
// DO NOT import this in any 'use client' file.
export const runtime = 'nodejs'


import { createClient } from '@supabase/supabase-js'

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server only
    { auth: { persistSession: false } }
  )
}
