'use client'
import { useState } from 'react'
import { Save, Trash2 } from 'lucide-react'

export default function EnrollRow({ e, cohorts }: { e: any; cohorts: { id: string; label: string }[] }) {
  const [row, setRow] = useState({ ...e })
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/enrollments/${row.enrollment_id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohort_id: row.cohort_id, status: row.status }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
    } catch (e: any) { alert(e.message || 'Error') }
    finally { setSaving(false) }
  }

  async function del() {
    if (!confirm('Remove this enrollment?')) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/admin/enrollments/${row.enrollment_id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) { alert(e.message || 'Error') }
    finally { setRemoving(false) }
  }

  return (
    <tr className="border-t">
      <td className="py-2">{row.email}</td>
      <td>
        <select className="input" value={row.cohort_id} onChange={e=>setRow((s: typeof row) => ({ ...s, cohort_id: e.target.value }))}>
          {cohorts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </td>
      <td>{row.language}</td>
      <td>{row.level}</td>
      <td>{row.start_date ? new Date(row.start_date).toLocaleDateString() : '—'}</td>
      <td>
        <select className="input" value={row.status} onChange={e=>setRow((s: typeof row) => ({ ...s, status: e.target.value }))}>
          <option>pending</option><option>confirmed</option><option>moved</option><option>cancelled</option>
        </select>
      </td>
      <td className="text-right">
        <button className="btn btn-ghost" onClick={save} disabled={saving}><Save size={16}/> Save</button>
        <button className="btn btn-ghost" onClick={del} disabled={removing}><Trash2 size={16}/> Delete</button>
      </td>
    </tr>
  )
}
