'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  timezone: string | null
  locale: string | null
  whatsapp: string | null
  target_language: 'Italian'|'German'|null
  learning_goals: string | null
  level_target: string | null
}

export default function SettingsPage() {
  const supabase = supabaseBrowser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (data) setProfile(data as any)
      else setProfile({
        id: user.id,
        email: user.email ?? '',
        full_name: '',
        phone: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
        whatsapp: '',
        target_language: 'Italian',
        learning_goals: '',
        level_target: '',
      } as any)
      setLoading(false)
    })()
  }, [])

  async function save() {
    if (!profile) return
    setSaving(true); setError(null); setOk(null)
    const payload = { ...profile }
    // put email onto profile for convenience
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) (payload as any).email = user.email

    const { error: upErr } = await supabase.from('profiles')
      .upsert(payload, { onConflict: 'id' })
    if (upErr) setError(upErr.message)
    else setOk('Saved!')
    setSaving(false)
  }

  if (loading) return <div className="card p-6">Loading…</div>
  if (!profile) return <div className="card p-6">Sign in to manage your profile.</div>

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-4">Profile</h1>

        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={profile.full_name ?? ''} onChange={e=>setProfile({...profile, full_name: e.target.value})}/>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={profile.email ?? ''} disabled />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={profile.phone ?? ''} onChange={e=>setProfile({...profile, phone: e.target.value})}/>
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" value={profile.whatsapp ?? ''} onChange={e=>setProfile({...profile, whatsapp: e.target.value})}/>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Timezone</label>
              <input className="input" value={profile.timezone ?? ''} onChange={e=>setProfile({...profile, timezone: e.target.value})}/>
            </div>
            <div>
              <label className="label">Locale</label>
              <input className="input" value={profile.locale ?? ''} onChange={e=>setProfile({...profile, locale: e.target.value})}/>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Target language</label>
              <select className="input" value={profile.target_language ?? 'Italian'} onChange={e=>setProfile({...profile, target_language: e.target.value as any})}>
                <option>Italian</option>
                <option>German</option>
              </select>
            </div>
            <div>
              <label className="label">Target level</label>
              <input className="input" placeholder="e.g., B2 by June" value={profile.level_target ?? ''} onChange={e=>setProfile({...profile, level_target: e.target.value})}/>
            </div>
          </div>

          <div>
            <label className="label">Learning goals</label>
            <textarea className="input" rows={4} value={profile.learning_goals ?? ''} onChange={e=>setProfile({...profile, learning_goals: e.target.value})}/>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            {ok && <span className="text-sm text-green-600 self-center">{ok}</span>}
            {error && <span className="text-sm text-red-600 self-center">{error}</span>}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3">Account</h2>
        <p className="text-sm text-neutral-600">Manage your sign-in and session.</p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}

function SignOutButton() {
  const supabase = supabaseBrowser()
  return (
    <button
      className="btn btn-ghost"
      onClick={async () => { await supabase.auth.signOut(); location.href = '/auth' }}
    >
      Sign out
    </button>
  )
}
