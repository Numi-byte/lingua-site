'use client'
import { useState } from 'react'

export default function AdjustCredits({ email }: { email: string }) {
  const [delta, setDelta] = useState(1)
  const [notes, setNotes] = useState('manual adjust')
  const [msg, setMsg] = useState<string | null>(null)

  async function submit() {
    setMsg(null)
    const res = await fetch('/api/admin/adjust-credits', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ email, delta, notes })
    })
    const j = await res.json().catch(()=>({}))
    if (!res.ok) setMsg(`Error: ${j.error || res.statusText}`)
    else setMsg('Credits updated.')
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Delta credits</label>
        <input className="input" type="number" value={delta} onChange={e=>setDelta(parseInt(e.target.value || '0'))}/>
      </div>
      <div>
        <label className="label">Notes</label>
        <input className="input" value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={submit}>Apply</button>
      {msg && <div className="text-sm mt-1">{msg}</div>}
    </div>
  )
}
