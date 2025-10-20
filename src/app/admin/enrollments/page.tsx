// src/app/admin/enrollments/page.tsx
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import EnrollClientTable from './parts/EnrollClientTable'
import EnrollForm from './parts/EnrollForm'
// If you added the bulk box earlier, keep this import; otherwise remove it.
 import BulkEnrollBox from './parts/BulkEnrollBox'

export const dynamic = 'force-dynamic'

// Next.js 15+: searchParams is a Promise
type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // ✅ await searchParams before using it
  const sp = await searchParams
  const initialCohort =
    Array.isArray(sp?.cohort) ? sp.cohort[0] : sp?.cohort

  const db = supabaseAdmin()
  const [{ data: view }, { data: cohorts }] = await Promise.all([
    db
      .from('enrollments_view')
      .select('*')
      .order('created_at', { ascending: false }),
    db
      .from('cohorts')
      .select('id,label,language,level')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="text-xl font-semibold">Enrollments</h1>
        <p className="text-sm text-neutral-600">
          Search, filter, move or remove students in bulk.
        </p>
        <div className="mt-4">
          <EnrollForm cohorts={cohorts ?? []} />
        </div>
        {/* If you added BulkEnrollBox earlier, uncomment this: */}
        { <div className="mt-4"><BulkEnrollBox cohorts={cohorts ?? []} /></div> }
      </section>

      <section className="card p-6">
        <EnrollClientTable
          rows={view ?? []}
          cohorts={cohorts ?? []}
          initialCohortFilter={initialCohort as string | undefined}
        />
      </section>
    </div>
  )
}
