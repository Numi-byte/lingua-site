import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function supabaseServerRSC() {
  const store = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (cookies) => {
          try {
            cookies.forEach(({ name, value, options }) => store.set(name, value, options))
          } catch {
            // read-only in RSC
          }
        },
      },
    }
  )
}
