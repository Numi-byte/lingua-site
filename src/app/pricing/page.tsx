import { supabaseAdmin } from '@/lib/supabaseAdmin'
import LangSection from './parts/LangSections'
import { Sparkles, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const db = supabaseAdmin()

  const [{ data: cohorts }, { data: enr }, { data: holds }] = await Promise.all([
    db
      .from('cohorts')
      .select('id,label,language,level,start_date,schedule,capacity,status,price_id')
      .eq('status', 'open')
      .order('start_date', { ascending: true }),
    db.from('enrollments').select('cohort_id'),
    db.from('cohort_holds').select('cohort_id,expires_at'),
  ])

  const enrolledCount = new Map<string, number>()
  ;(enr ?? []).forEach((r: any) => {
    enrolledCount.set(r.cohort_id, (enrolledCount.get(r.cohort_id) || 0) + 1)
  })

  const now = Date.now()
  const holdsCount = new Map<string, number>()
  ;(holds ?? [])
    .filter((h: any) => new Date(h.expires_at).getTime() > now)
    .forEach((h: any) => {
      holdsCount.set(h.cohort_id, (holdsCount.get(h.cohort_id) || 0) + 1)
    })

  const cards = (cohorts ?? []).map((c: any) => {
    const enrolled = enrolledCount.get(c.id) || 0
    const held = holdsCount.get(c.id) || 0
    const capacity = c.capacity ?? 0
    const left = Math.max(0, capacity - enrolled - held)
    return { ...c, enrolled, held, left, soldOut: left <= 0 }
  })

  const italian = cards.filter((c) => c.language === 'Italian')
  const german = cards.filter((c) => c.language === 'German')

  return (
    <div className="space-y-8">
      <section className="card p-6 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs">
          <Sparkles size={14} /> Live cohorts — free assessment + free class included
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Join a cohort</h1>
        <p className="mt-1 text-neutral-700">
          Seats are first-come, first-served. A seat is held for 15 minutes while you’re on checkout.
        </p>
      </section>

      <LangSection title="Italian 🇮🇹" items={italian} />
      <LangSection title="German 🇩🇪" items={german} />

      {cards.length === 0 && (
        <section className="card p-6">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle size={18} /> No open cohorts right now. Check back soon!
          </div>
        </section>
      )}
    </div>
  )
}
