import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'
import { CalendarClock, GraduationCap, Layers, ShoppingCart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const db = supabaseAdmin()

  const [{ data: cohorts }, { data: enrolls }, { data: purchases }, { data: asses }] = await Promise.all([
    db.from('cohorts').select('id,status').order('created_at', { ascending: false }),
    db.from('enrollments').select('id'),
    db.from('purchases').select('amount_total, currency'),
    db.from('assessments').select('id'),
  ])

  const revenueEur = (purchases ?? [])
    .filter(p => (p.currency ?? 'eur').toLowerCase() === 'eur')
    .reduce((s, p) => s + (p.amount_total ?? 0), 0)

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-neutral-600">Manage cohorts, enrollments, and resources. See quick stats below.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <KPI label="Cohorts" value={String(cohorts?.length ?? 0)} icon={<Layers size={16} />} />
          <KPI label="Enrollments" value={String(enrolls?.length ?? 0)} icon={<CalendarClock size={16} />} />
          <KPI label="Assessments" value={String(asses?.length ?? 0)} icon={<GraduationCap size={16} />} />
          <KPI label="Revenue (EUR)" value={`€ ${(revenueEur/100).toFixed(2)}`} icon={<ShoppingCart size={16} />} />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="/admin/cohorts">Manage cohorts</Link>
          <Link className="btn btn-ghost" href="/admin/enrollments">Manage enrollments</Link>
          <Link className="btn btn-ghost" href="/admin/resources">Manage resources</Link>
        </div>
      </section>
    </div>
  )
}

function KPI({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-4">
      <div className="text-xs text-neutral-500 inline-flex items-center gap-2">{icon}{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
