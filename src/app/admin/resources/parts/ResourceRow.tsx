'use client'
import { useState } from 'react'
import { Save, Trash2 } from 'lucide-react'

export default function ResourceRow({ r, cohorts }: { r: any; cohorts: { id: string; label: string }[] }) {
  const [row, setRow] = useState<Record<string, any>>({ ...r })
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  function F<K extends keyof typeof row>(k: K) {
    return { value: row[k] as any, onChange: (e: any) => setRow(s => ({ ...s, [k]: e.target.value })) }
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/resources/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...row, cohort_id: row.cohort_id || null }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
    } catch (e: any) {
      alert(e.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function del() {
    if (!confirm('Delete this resource?')) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/admin/resources/${row.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      location.reload()
    } catch (e: any) {
      alert(e.message || 'Error')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <tr className="border-t">
      <td className="py-2"><input className="input" {...F('title')} /></td>
      <td><input className="input" {...F('url')} /></td>
      <td><select className="input" {...F('language')}><option>Italian</option><option>German</option></select></td>
      <td><select className="input" {...F('level')}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></td>
      <td>
        <select className="input" {...F('cohort_id')}>
          <option value="">—</option>
          {cohorts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </td>
      <td className="text-right">
        <button className="btn btn-ghost" onClick={save} disabled={saving}><Save size={16}/> Save</button>
        <button className="btn btn-ghost" onClick={del} disabled={removing}><Trash2 size={16}/> Delete</button>
      </td>
    </tr>
  )
}
