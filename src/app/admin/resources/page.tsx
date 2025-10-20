import { supabaseAdmin } from '@/lib/supabaseAdmin'
import ResourceForm from './parts/ResourceForm'
import ResourceRow from './parts/ResourceRow'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
  const db = supabaseAdmin()
  const { data: resources } = await db
    .from('resources')
    .select('id,title,url,language,level,cohort_id,created_at')
    .order('created_at', { ascending: false })

  const { data: cohorts } = await db.from('cohorts').select('id,label').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="text-xl font-semibold">Resources</h1>
        <p className="text-sm text-neutral-600">Attach links/files to levels or specific cohorts.</p>
        <div className="mt-4">
          <ResourceForm cohorts={cohorts ?? []} />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">All resources</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-600">
                <th className="py-2">Title</th>
                <th>URL</th>
                <th>Lang</th>
                <th>Level</th>
                <th>Cohort</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(resources ?? []).map(r => <ResourceRow key={r.id} r={r} cohorts={cohorts ?? []} />)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
