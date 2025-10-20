'use client'
import { useState } from 'react'
import { Upload } from 'lucide-react'

export default function BulkEnrollBox({ cohorts }: { cohorts: { id: string; label: string }[] }) {
  const [cohort, setCohort] = useState(cohorts[0]?.id ?? '')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  function parseEmails(s: string) {
    const parts = s.split(/[\s,;]+/).map(x => x.trim()).filter(Boolean)
    const clean = Array.from(new Set(parts))
    return clean.filter(x => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))
  }

  async function submit() {
    const emails = parseEmails(text)
    if (!emails.length) return alert('Paste some emails first.')
    if (!cohort) return alert('Choose a cohort.')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/enrollments/bulk-add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohort_id: cohort, emails }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed')
      alert(`Enrolled: ${j.inserted.length}\nAlready enrolled: ${j.skipped.length}\nInvalid: ${j.invalid.length}`)
      location.reload()
    } catch (e: any) {
      alert(e.message || 'Error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="label">Paste emails (comma, space, or newline separated)</label>
          <textarea className="input" rows={5} value={text} onChange={e=>setText(e.target.value)} placeholder={`alice@example.com, bob@example.com\ncarla@example.com`} />
        </div>
        <div>
          <label className="label">Cohort</label>
          <select className="input" value={cohort} onChange={e=>setCohort(e.target.value)}>
            {cohorts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>

          <button className="btn btn-primary mt-3 w-full" onClick={submit} disabled={busy}>
            <Upload size={16}/> {busy ? 'Importing…' : 'Bulk enroll'}
          </button>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-2">Duplicates are ignored automatically. You can run this multiple times safely.</p>
    </div>
  )
}
