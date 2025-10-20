export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Params = Promise<{ email: string }>

export default async function AdminStudentPage({
  params,
}: {
  params: Params
}) {
  const { email } = await params

  const db = supabaseAdmin()

  const [{ data: enrolls }, { data: asses }] = await Promise.all([
    db.from('enrollments_view')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false }),
    db.from('assessments')
      .select('created_at,target_language,cefr_estimate,total_score,details')
      .eq('email', email)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="text-xl font-semibold">Student — {email}</h1>
        <p className="text-sm text-neutral-600">
          Enrollments and assessments for this learner.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold mb-2">Enrollments</h2>
        <div className="space-y-2 text-sm">
          {(enrolls ?? []).map((r: any) => (
            <div
              key={r.enrollment_id}
              className="rounded-xl border border-black/10 bg-white/70 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.label}</div>
                  <div className="text-xs text-neutral-500">
                    {r.language} · {r.level} ·{' '}
                    {r.start_date
                      ? new Date(r.start_date).toLocaleDateString()
                      : '—'}
                  </div>
                </div>
                <span className="badge">{r.status}</span>
              </div>
            </div>
          ))}
          {(enrolls ?? []).length === 0 && (
            <div className="text-neutral-500">No enrollments.</div>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold mb-2">Assessments</h2>
        <div className="space-y-2 text-sm">
          {(asses ?? []).map((a: any, i: number) => (
            <div
              key={i}
              className="rounded-xl border border-black/10 bg-white/70 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {a.target_language} — CEFR {a.cefr_estimate}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm">
                  Score: <b>{a.total_score}</b>
                </div>
              </div>
              {a.details && (
                <pre className="mt-2 whitespace-pre-wrap text-xs text-neutral-700">
                  {JSON.stringify(a.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
          {(asses ?? []).length === 0 && (
            <div className="text-neutral-500">No assessments.</div>
          )}
        </div>
      </section>
    </div>
  )
}
