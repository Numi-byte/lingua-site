'use client'

import { useState, type FormEvent } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function UpdateNameForm({ initialName = '' }: { initialName?: string }) {
  const [name, setName] = useState<string>(initialName)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      const sb = supabaseBrowser()
      const { error } = await sb.auth.updateUser({ data: { full_name: name } })
      if (error) throw error
      alert('Saved!')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save'
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        className="input"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        placeholder="Your name"
        aria-label="Full name"
      />
      <button className="btn btn-ghost" type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
