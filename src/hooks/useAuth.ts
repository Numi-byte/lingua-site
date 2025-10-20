'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

export function useAuth() {
  const supabase = supabaseBrowser()
  const [status, setStatus] = useState<'loading'|'authed'|'guest'>('loading')
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      setEmail(user?.email ?? null)
      setStatus(user ? 'authed' : 'guest')
    })()
    return () => { mounted = false }
  }, [])

  return { status, email, supabase }
}
