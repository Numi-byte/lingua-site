'use client'
import { useState } from 'react'

export default function AddNote({ email }: { email: string }) {
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function submit() {
    setMsg(null)
    const res = await fetch('/api/admin/add-note', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ email, note })
    })
    const j = await res.json().catch(()=>({}))
    if (!res.ok) setMsg(`Error: ${j.error || res.statusText}`)
    else { setMsg('Added. Refresh to see it above.'); setNote('') }
  }

  return (
    <div className="space-y-3">
      <textarea className="input" rows={4} placeholder="Lesson recap, strengths, next focus…" value={note} onChange={e=>setNote(e.target.value)} />
      <button className="btn btn-primary" onClick={submit} disabled={!note.trim()}>Add note</button>
      {msg && <div className="text-sm">{msg}</div>}
    </div>
  )
}
