import { supabaseService } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

export default async function AdminAssessments() {
  const db = supabaseService()
  const { data, error } = await db
    .from('assessments')
    .select('created_at,email,target_language,cefr_estimate,total_score')
    .order('created_at', { ascending: false })

  if (error) return <div className="card p-6">DB error: {error.message}</div>

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-3">Assessments</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="py-2">Date</th><th>Email</th><th>Lang</th><th>CEFR</th><th>Score</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td>{r.email}</td>
                <td>{r.target_language}</td>
                <td className="font-medium">{r.cefr_estimate}</td>
                <td>{r.total_score}</td>
              </tr>
            ))}
            {!data?.length && <tr><td className="py-3" colSpan={5}>No data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
