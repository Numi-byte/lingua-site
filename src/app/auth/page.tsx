'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function AuthPage() {
  const supabase = supabaseBrowser()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [serverAuth, setServerAuth] = useState<{ authenticated: boolean; email: string | null } | null>(null)

  // Ask SERVER if it sees a session; never redirect automatically
  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(setServerAuth)
      .catch(() => setServerAuth({ authenticated: false, email: null }))
  }, [])

  async function continueToApp() {
    // Only go if server is authenticated
    location.href = '/auth/after'
  }

  async function sendMagic() {
    if (!email) return alert('Enter your email.')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=%2Fauth%2Fafter` }
      })
      if (error) throw error
      alert('Magic link sent! Check your email.')
    } catch (e: any) {
      alert(e.message || 'Failed to send link')
    } finally {
      setLoading(false)
    }
  }

  async function withPassword() {
    if (!email || !pwd) return alert('Enter email & password.')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password: pwd,
          options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=%2Fauth%2Fafter` }
        })
        if (error) throw error
        alert('Check your email to confirm your account.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd })
        if (error) throw error
        // Sync tokens into server cookies
        const { data: sess } = await supabase.auth.getSession()
        const at = sess.session?.access_token
        const rt = sess.session?.refresh_token
        if (at && rt) {
          await fetch('/api/auth/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ access_token: at, refresh_token: rt }),
          })
        }
        // Hard reload so server sees cookies
        location.href = '/auth/after'
      }
    } catch (e: any) {
      alert(e.message || 'Auth error')
    } finally {
      setLoading(false)
    }
  }

  async function withGoogle() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=%2Fauth%2Fafter`,
          queryParams: { prompt: 'consent' },
        },
      })
      if (error) throw error
    } catch (e: any) {
      alert(e.message || 'OAuth error')
      setLoading(false)
    }
  }

  async function fullSignOut() {
    await supabase.auth.signOut()
    await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
    location.reload()
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-1">Sign in</h1>
      <p className="text-sm text-neutral-600 mb-4">Magic link • Email+password • Google</p>

      {/* If server already sees session, show a safe Continue button (no auto-redirect) */}
      {serverAuth?.authenticated && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm mb-4">
          Signed in as <b>{serverAuth.email}</b>. <button className="underline ml-1" onClick={continueToApp}>Continue</button> · <button className="underline ml-1" onClick={fullSignOut}>Sign out</button>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button onClick={sendMagic} disabled={loading} className="btn btn-primary">
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
          <button onClick={withGoogle} disabled={loading} className="btn btn-ghost">Continue with Google</button>
        </div>

        <div className="border-t border-black/10 my-3" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="label m-0">Email + Password</label>
            <button className="text-xs underline" onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
          </div>
          <input className="input" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="password" />
          <button onClick={withPassword} disabled={loading} className="btn btn-ghost">
            {loading ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </div>

        <p className="text-xs text-neutral-500 mt-2">
          Issues? <Link href="/contact" className="underline">Contact support</Link>.
        </p>
      </div>
    </div>
  )
}
