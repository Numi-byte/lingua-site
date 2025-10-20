'use client'
import { useState } from 'react'

export default function EnrollForm({ cohorts }: { cohorts: { id: string; label: string }[] }) {
  const [email, setEmail] = useState('')
  const [cohort_id, setCohort] = useState(cohorts[0]?.id ?? '')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!email || !cohort_id) return alert('Email and cohort required')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cohort_id }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) {
      alert(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div><label className="label">Learner email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com" /></div>
        <div><label className="label">Cohort</label>
          <select className="input" value={cohort_id} onChange={e=>setCohort(e.target.value)}>
            {cohorts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3"><button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Adding…' : 'Add enrollment'}</button></div>
    </div>
  )
}
