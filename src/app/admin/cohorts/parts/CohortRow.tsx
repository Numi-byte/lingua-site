'use client'
import { useState } from 'react'
import { Trash2, Save } from 'lucide-react'

export default function CohortRow({ c }: { c: any }) {
  const [row, setRow] = useState({ ...c })
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  function F<K extends keyof typeof row>(k: K) {
    return { value: row[k] as any, onChange: (e: any) => setRow((s: typeof row) => ({ ...s, [k]: e.target.value })) }
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/cohorts/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
    } catch (e: any) {
      alert(e.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function del() {
    if (!confirm('Delete this cohort?')) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/admin/cohorts/${row.id}`, { method: 'DELETE' })
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
      <td className="py-2"><input className="input" {...F('label')} /></td>
      <td><select className="input" {...F('language')}><option>Italian</option><option>German</option></select></td>
      <td><select className="input" {...F('level')}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></td>
      <td><input className="input" type="date" {...F('start_date')} /></td>
      <td><input className="input" {...F('schedule')} /></td>
      <td><input className="input" type="number" {...F('capacity')} /></td>
      <td><select className="input" {...F('status')}><option>open</option><option>closed</option><option>finished</option></select></td>
      <td><input className="input" {...F('price_id')} /></td>
      <td className="text-right">
        <button className="btn btn-ghost" onClick={save} disabled={saving}><Save size={16}/> Save</button>
        <button className="btn btn-ghost" onClick={del} disabled={removing}><Trash2 size={16}/> Delete</button>
      </td>
    </tr>
  )
}
