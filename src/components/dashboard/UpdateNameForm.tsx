'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { User } from 'lucide-react'

export default function UpdateNameForm({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName || '')
  const [loading, setLoading] = useState(false)
  const supabase = supabaseBrowser()

  async function save() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
      if (error) throw error
      alert('Saved!')
    } catch (e: any) {
      alert(e.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-3">
      <div className="text-xs text-neutral-500 mb-1">Display name</div>
      <div className="flex gap-2">
        <div className="flex-1">
          <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <button className="btn btn-ghost" onClick={save} disabled={loading}>
          <User size={16} /> {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
