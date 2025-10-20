'use client'
import { useState } from 'react'

export default function ResourceForm({ cohorts }: { cohorts: { id: string; label: string }[] }) {
  const [form, setForm] = useState({ title: '', url: '', language: 'Italian', level: 'A1', cohort_id: '' })
  const [loading, setLoading] = useState(false)

  function F<K extends keyof typeof form>(k: K) {
    return { value: form[k] as any, onChange: (e: any) => setForm(s => ({ ...s, [k]: e.target.value })) }
  }

  async function submit() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cohort_id: form.cohort_id || null }),
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
        <div><label className="label">Title</label><input className="input" placeholder="Unit 1 PDF" {...F('title')} /></div>
        <div><label className="label">URL</label><input className="input" placeholder="https://..." {...F('url')} /></div>
        <div><label className="label">Language</label>
          <select className="input" {...F('language')}><option>Italian</option><option>German</option></select>
        </div>
        <div><label className="label">Level</label>
          <select className="input" {...F('level')}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select>
        </div>
        <div><label className="label">Cohort (optional)</label>
          <select className="input" {...F('cohort_id')}>
            <option value="">— none —</option>
            {cohorts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Saving…' : 'Add resource'}</button>
      </div>
    </div>
  )
}
