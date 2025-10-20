'use client'

import { useMemo, useState } from 'react'
import { ArrowRightLeft, Filter, MoveRight, RefreshCcw, Save, Trash2 } from 'lucide-react'

type Row = {
  enrollment_id: string
  email: string
  status: 'pending'|'confirmed'|'moved'|'cancelled'
  cohort_id: string
  label: string
  language: 'Italian'|'German'
  level: 'A1'|'A2'|'B1'|'B2'|'C1'
  start_date: string | null
  schedule: string | null
}

export default function EnrollClientTable({
  rows, cohorts, initialCohortFilter
}: { rows: Row[]; cohorts: { id: string; label: string; language: string; level: string }[]; initialCohortFilter?: string }) {
  const [q, setQ] = useState('')
  const [cohort, setCohort] = useState<string>(initialCohortFilter || 'All')
  const [status, setStatus] = useState<'All'|'pending'|'confirmed'|'moved'|'cancelled'>('All')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkTo, setBulkTo] = useState<string>('') // cohort id
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    return (rows ?? []).filter(r => {
      if (q && !(`${r.email} ${r.label}`.toLowerCase().includes(q.toLowerCase()))) return false
      if (cohort !== 'All' && r.cohort_id !== cohort) return false
      if (status !== 'All' && r.status !== status) return false
      return true
    })
  }, [rows, q, cohort, status])

  const allChecked = filtered.length > 0 && filtered.every(r => selected.has(r.enrollment_id))
  function toggleAll() {
    const s = new Set(selected)
    if (allChecked) filtered.forEach(r => s.delete(r.enrollment_id))
    else filtered.forEach(r => s.add(r.enrollment_id))
    setSelected(s)
  }
  function toggleOne(id: string) {
    const s = new Set(selected)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelected(s)
  }

  async function bulkMove() {
    if (!bulkTo) return alert('Choose target cohort')
    if (selected.size === 0) return alert('Select at least one row')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/enrollments/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', ids: Array.from(selected), cohort_id: bulkTo }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) { alert(e.message || 'Error') } finally { setBusy(false) }
  }

  async function bulkDelete() {
    if (selected.size === 0) return alert('Select at least one row')
    if (!confirm('Remove selected enrollments?')) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/enrollments/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: Array.from(selected) }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) { alert(e.message || 'Error') } finally { setBusy(false) }
  }

  function fmtDate(d: string | null) { try { return d ? new Date(d).toLocaleDateString() : '—' } catch { return d ?? '—' } }

  return (
    <div>
      {/* Filters + bulk */}
      <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 text-xs text-neutral-600"><Filter size={14}/> Filters</div>
          <input className="input w-[220px]" placeholder="Search email/cohort..." value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={cohort} onChange={e=>setCohort(e.target.value)}>
            <option value="All">All cohorts</option>
            {cohorts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select className="input" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>All</option><option>pending</option><option>confirmed</option><option>moved</option><option>cancelled</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <select className="input" value={bulkTo} onChange={e=>setBulkTo(e.target.value)}>
              <option value="">Move to cohort…</option>
              {cohorts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <button className="btn btn-ghost" onClick={bulkMove} disabled={busy}><ArrowRightLeft size={16}/> Move</button>
            <button className="btn btn-ghost" onClick={bulkDelete} disabled={busy}><Trash2 size={16}/> Remove</button>
            <button className="btn btn-ghost" onClick={()=>{ setQ(''); setCohort('All'); setStatus('All'); setSelected(new Set()); setBulkTo('') }}>
              <RefreshCcw size={16}/> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="py-2"><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
              <th>Email</th>
              <th>Cohort</th>
              <th>Lang</th>
              <th>Level</th>
              <th>Start</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.enrollment_id} className="border-t">
                <td className="py-2"><input type="checkbox" checked={selected.has(r.enrollment_id)} onChange={()=>toggleOne(r.enrollment_id)} /></td>
                <td>{r.email}</td>
                <td>{r.label}</td>
                <td>{r.language}</td>
                <td>{r.level}</td>
                <td>{fmtDate(r.start_date)}</td>
                <td>
                  <span className="badge">{r.status}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-neutral-500">No enrollments match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
