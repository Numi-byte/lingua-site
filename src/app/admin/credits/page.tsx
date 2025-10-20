'use client'
import { useState } from 'react'

export default function AdminCredits() {
  const [email, setEmail] = useState('')
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
    else setMsg('Done.')
  }

  return (
    <div className="card p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-3">Adjust Credits</h1>
      <div className="space-y-4">
        <div>
          <label className="label">Student email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Delta credits (positive or negative)</label>
          <input className="input" type="number" value={delta} onChange={e=>setDelta(parseInt(e.target.value || '0'))} />
        </div>
        <div>
          <label className="label">Notes</label>
          <input className="input" value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={submit}>Apply</button>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </div>
    </div>
  )
}
