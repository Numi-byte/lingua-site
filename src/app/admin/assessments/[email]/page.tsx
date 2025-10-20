import { supabaseService } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

export default async function AdminAssessmentDetail({ params }: { params: { email: string } }) {
  const email = decodeURIComponent(params.email)
  const db = supabaseService()
  const { data, error } = await db
    .from('assessments')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) return <div className="card p-6">DB error: {error.message}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Assessments — {email}</h1>

      {(data ?? []).map((row: any) => (
        <div key={row.id} className="card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">{new Date(row.created_at).toLocaleString()}</div>
            <div className="text-sm">Lang: <b>{row.target_language}</b> • CEFR: <b>{row.cefr_estimate}</b> • Score: <b>{row.total_score}</b></div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 mt-3">
            <Box title="Grammar & Vocab" body={`${row.answers?.gv?.score ?? 0} / ${row.answers?.gv?.max ?? 0}`} />
            <Box title="Reading" body={`${row.answers?.reading?.score ?? 0} / ${row.answers?.reading?.max ?? 0}`} />
            <Box title="Writing" body={`${row.answers?.writing?.score ?? 0} / ${row.answers?.writing?.max ?? 0}`} />
          </div>
          {row.answers?.writing?.text && (
            <div className="mt-4">
              <div className="text-xs text-neutral-500 mb-1">Writing sample</div>
              <div className="rounded-xl border border-black/10 bg-white/70 p-3 text-sm whitespace-pre-wrap">
                {row.answers.writing.text}
              </div>
            </div>
          )}
        </div>
      ))}

      {!data?.length && <div className="card p-6">No assessments.</div>}
    </div>
  )
}

function Box({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-3">
      <div className="text-xs text-neutral-500">{title}</div>
      <div className="text-lg font-semibold">{body}</div>
    </div>
  )
}
