'use client'

import { useState } from 'react'
import { Users, CalendarClock } from 'lucide-react'
import { startCheckout } from '@/lib/checkout'
import { supabaseBrowser } from '@/lib/supabaseClient'

type Card = {
  id: string
  label: string
  language: 'Italian' | 'German'
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  schedule: string | null
  capacity: number | null
  enrolled: number
  held: number
  left: number
  soldOut: boolean
}

export default function LangSection({ title, items }: { title: string; items: Card[] }) {
  const [level, setLevel] = useState<'All' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('All')
  const filtered = items.filter((i) => (level === 'All' ? true : i.level === level))

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Level</span>
          <select className="input" value={level} onChange={(e) => setLevel(e.target.value as any)}>
            <option>All</option>
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
            <option>C1</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CohortCard key={c.id} c={c} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-6 text-sm text-neutral-600">
            No cohorts for this level.
          </div>
        )}
      </div>
    </section>
  )
}

function CohortCard({ c }: { c: Card }) {
  const [loading, setLoading] = useState(false)

  async function buy() {
    try {
      setLoading(true)

      // Try to include the signed-in user's email (optional)
      let email: string | undefined
      try {
        const supabase = supabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        email = user?.email ?? undefined
      } catch {
        // ignore
      }

      await startCheckout({ cohortId: c.id, lang: c.language, email })
    } catch (e: any) {
      alert(e?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const badge = (
    <span
      className={`badge ${
        c.left === 0 ? 'border-red-200' : c.left <= 2 ? 'border-amber-200' : 'border-black/10'
      }`}
    >
      {c.enrolled + c.held}/{c.capacity ?? 0} · {c.left} left
    </span>
  )

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 flex flex-col justify-between">
      <div>
        <div className="text-sm text-neutral-500">{c.level}</div>
        <div className="font-semibold">{c.label}</div>
        <div className="text-sm text-neutral-600 mt-1">{c.schedule ?? 'Online'}</div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs text-neutral-600">
          <Users size={14} /> {badge}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost" onClick={() => (window.location.href = '/assessment')}>
            <CalendarClock size={16} /> Assessment
          </button>
          <button className="btn btn-primary" onClick={buy} disabled={loading || c.soldOut}>
            {loading ? 'Redirecting…' : c.soldOut ? 'Sold out' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  )
}
