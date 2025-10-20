'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Copy, Filter, Layers, MoreHorizontal, RefreshCcw, Save, ToggleLeft, ToggleRight, Users } from 'lucide-react'
import Link from 'next/link'

type Cohort = {
  id: string
  label: string
  language: 'Italian' | 'German'
  level: 'A1'|'A2'|'B1'|'B2'|'C1'
  start_date: string | null
  schedule: string | null
  capacity: number | null
  status: 'open'|'closed'|'finished'
  price_id: string | null
  created_at: string
}

export default function ClientCohortsTable({
  cohorts, counts
}: { cohorts: Cohort[]; counts: Record<string, number> }) {
  const [q, setQ] = useState('')
  const [lang, setLang] = useState<'All'|'Italian'|'German'>('All')
  const [lvl, setLvl] = useState<'All'|'A1'|'A2'|'B1'|'B2'|'C1'>('All')
  const [status, setStatus] = useState<'All'|'open'|'closed'|'finished'>('All')
  const [savingRow, setSavingRow] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return (cohorts ?? []).filter(c => {
      if (lang !== 'All' && c.language !== lang) return false
      if (lvl !== 'All' && c.level !== lvl) return false
      if (status !== 'All' && c.status !== status) return false
      if (q && !(`${c.label} ${c.schedule ?? ''}`.toLowerCase().includes(q.toLowerCase()))) return false
      return true
    })
  }, [cohorts, q, lang, lvl, status])

  async function toggleStatus(c: Cohort) {
    setBusyId(c.id)
    try {
      const newStatus = c.status === 'open' ? 'closed' : 'open'
      const res = await fetch(`/api/admin/cohorts/${c.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) { alert(e.message || 'Error') }
    finally { setBusyId(null) }
  }

  async function duplicate(c: Cohort) {
    setBusyId(c.id)
    try {
      const res = await fetch(`/api/admin/cohorts/${c.id}/duplicate`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) { alert(e.message || 'Error') }
    finally { setBusyId(null) }
  }

  async function copyEmails(cohortId: string) {
    setBusyId(cohortId)
    try {
      const res = await fetch(`/api/admin/cohorts/${cohortId}/emails`)
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed')
      const list = (j.emails ?? []).join(', ')
      await navigator.clipboard.writeText(list)
      alert('Emails copied to clipboard.')
    } catch (e: any) { alert(e.message || 'Error') }
    finally { setBusyId(null) }
  }

  function fmtDate(d: string | null) { try { return d ? new Date(d).toLocaleDateString() : '—' } catch { return d ?? '—' } }

  return (
    <div>
      {/* Filters */}
      <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 text-xs text-neutral-600"><Filter size={14}/> Filters</div>
          <input className="input w-[220px]" placeholder="Search label/schedule..." value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={lang} onChange={e=>setLang(e.target.value as any)}>
            <option>All</option><option>Italian</option><option>German</option>
          </select>
          <select className="input" value={lvl} onChange={e=>setLvl(e.target.value as any)}>
            <option>All</option><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option>
          </select>
          <select className="input" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>All</option><option>open</option><option>closed</option><option>finished</option>
          </select>
          <button className="btn btn-ghost" onClick={()=>{ setQ(''); setLang('All'); setLvl('All'); setStatus('All') }}>
            <RefreshCcw size={16}/> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="py-2">Label</th>
              <th>Lang</th>
              <th>Level</th>
              <th><CalendarClock size={14} className="inline mr-1" />Start</th>
              <th>Schedule</th>
              <th><Users size={14} className="inline mr-1" />Seats</th>
              <th>Status</th>
              <th>Price</th>
              <th className="text-right"><Layers size={14} className="inline mr-1" />Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const enrolled = counts[c.id] || 0
              const cap = c.capacity ?? 0
              const left = Math.max(0, cap - enrolled)
              const leftBadge =
                <span className={`badge ${left === 0 ? 'border-red-200' : left <= 2 ? 'border-amber-200' : 'border-black/10'}`}>
                  {enrolled}/{cap} · {left} left
                </span>

              return (
                <tr key={c.id} className="border-t">
                  <td className="py-2">
                    <div className="font-medium">{c.label}</div>
                    <div className="text-xs text-neutral-500">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</div>
                  </td>
                  <td>{c.language}</td>
                  <td>{c.level}</td>
                  <td>{fmtDate(c.start_date)}</td>
                  <td className="max-w-[280px] truncate" title={c.schedule ?? ''}>{c.schedule ?? '—'}</td>
                  <td>{leftBadge}</td>
                  <td>
                    <span className="badge">{c.status}</span>
                  </td>
                  <td className="max-w-[220px] truncate" title={c.price_id ?? ''}>{c.price_id ?? '—'}</td>
                  <td className="text-right">
                    <div className="inline-flex gap-1">
                      <Link href={`/admin/enrollments?cohort=${c.id}`} className="btn btn-ghost"><Users size={16}/> View</Link>
                      <button
                        className="btn btn-ghost"
                        onClick={() => copyEmails(c.id)}
                        disabled={busyId === c.id}
                        title="Copy student emails"
                      >
                        <Copy size={16}/> Emails
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => duplicate(c)}
                        disabled={busyId === c.id}
                        title="Duplicate cohort"
                      >
                        <MoreHorizontal size={16}/> Duplicate
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => toggleStatus(c)}
                        disabled={busyId === c.id}
                        title="Toggle open/closed"
                      >
                        {c.status === 'open' ? <><ToggleRight size={16}/> Close</> : <><ToggleLeft size={16}/> Open</>}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="py-6 text-center text-neutral-500">No cohorts match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
