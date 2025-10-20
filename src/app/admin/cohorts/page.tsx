import { supabaseAdmin } from '@/lib/supabaseAdmin'
import ClientCohortsTable from './parts/ClientCohortsTable'
import CohortForm from './parts/CohortForm'

export const dynamic = 'force-dynamic'

export default async function CohortsPage() {
  const db = supabaseAdmin()

  const { data: cohorts } = await db
    .from('cohorts')
    .select('id,label,language,level,start_date,schedule,capacity,status,price_id,created_at')
    .order('created_at', { ascending: false })

  // Count enrollments per cohort (simple and reliable)
  const { data: enr } = await db
    .from('enrollments')
    .select('cohort_id')
  const counts: Record<string, number> =
    (enr ?? []).reduce((acc: Record<string, number>, e: any) => {
      acc[e.cohort_id] = (acc[e.cohort_id] || 0) + 1
      return acc
    }, {})

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="text-xl font-semibold">Cohorts</h1>
        <p className="text-sm text-neutral-600">Create, filter, and manage. Live seats and quick actions included.</p>
        <div className="mt-4"><CohortForm /></div>
      </section>

      <section className="card p-6">
        <ClientCohortsTable
          cohorts={cohorts ?? []}
          counts={counts}
        />
      </section>
    </div>
  )
}
