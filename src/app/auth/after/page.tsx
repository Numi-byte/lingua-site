export const runtime = 'nodejs'

import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export default async function After() {
  const c = await cookies()

  // Read the user from server cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => c.getAll().map(({ name, value }) => ({ name, value })),
        setAll: () => {}, // not needed here
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    redirect('/auth')
  }

  // Admin check via service role (safe, Node runtime)
  const adminDb = supabaseAdmin()
  const { data: rows } = await adminDb.from('admins').select('email').eq('email', user.email).limit(1)

  if (rows?.length) {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}
