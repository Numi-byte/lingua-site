'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

// Create a stable client outside the hook so we don't need it in deps
const sb = supabaseBrowser()

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    sb.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user ?? null)
        setLoading(false)
      }
    })

    const { data: subscription } = sb.auth.onAuthStateChange((_evt, session) => {
      if (mounted) setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, []) // no missing deps warning now

  return { user, loading }
}
