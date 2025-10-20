'use client'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function SignOutButton() {
  const supabase = supabaseBrowser()
  return (
    <button
      className="btn btn-ghost"
      onClick={async () => {
        // clear browser session
        await supabase.auth.signOut()
        // clear server cookies
        await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
        location.href = '/auth'
      }}
    >
      Sign out
    </button>
  )
}
