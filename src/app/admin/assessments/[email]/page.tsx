export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Params = Promise<{ email: string }>

export default async function AdminAssessmentByEmailPage({ params }: { params: Params }) {
  const { email } = await params

  const db = supabaseAdmin()
  const { data: asses } = await db
    .from('assessments')
    .select('created_at,target_language,cefr_estimate,total_score,details')
    .eq('email', email)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="text-xl font-semibold">Assessments — {email}</h1>
        <p className="text-sm text-neutral-600">
          All assessment attempts for this learner.
        </p>
      </section>

      <section className="card p-6">
        <div className="space-y-3 text-sm">
          {(asses ?? []).map((a, idx) => (
            <div key={idx} className="rounded-xl border border-black/10 bg-white/70 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.target_language} — CEFR {a.cefr_estimate}</div>
                  <div className="text-xs text-neutral-500">{new Date(a.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm">Score: <b>{a.total_score}</b></div>
              </div>
              {a.details && (
                <pre className="mt-2 whitespace-pre-wrap text-xs text-neutral-700">
                  {JSON.stringify(a.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
          {(asses ?? []).length === 0 && (
            <div className="text-neutral-500">No assessments found for this email.</div>
          )}
        </div>
      </section>
    </div>
  )
}
