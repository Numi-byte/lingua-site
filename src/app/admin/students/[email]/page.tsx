import { supabaseService } from '@/lib/supabaseService'
import AddNote from './parts/AddNote'
import AdjustCredits from './parts/AdjustCredits'

export const dynamic = 'force-dynamic'

export default async function AdminStudentDetail({ params }: { params: { email: string } }) {
  const email = decodeURIComponent(params.email)
  const db = supabaseService()

  const [{ data: profile }, { data: balance }, { data: assessments }, { data: purchases }, { data: notes }] =
    await Promise.all([
      db.from('profiles').select('*').eq('email', email).maybeSingle(),
      db.from('credit_balances').select('*').eq('email', email).maybeSingle(),
      db.from('assessments').select('created_at,target_language,cefr_estimate,total_score').eq('email', email).order('created_at', { ascending: false }),
      db.from('purchases').select('created_at,price_id,amount_total,currency,lang').eq('email', email).order('created_at', { ascending: false }),
      db.from('student_notes').select('created_at,note').eq('email', email).order('created_at', { ascending: false }),
    ])

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-1">{profile?.full_name || email}</h1>
        <p className="text-sm text-neutral-600">{email}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Info label="Target language" value={profile?.target_language || '—'} />
          <Info label="Timezone" value={profile?.timezone || '—'} />
          <Info label="Credits" value={(balance?.credits ?? 0).toString()} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Assessments</h2>
          {!assessments?.length ? <p className="text-sm text-neutral-600">No assessments.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-600"><th className="py-2">Date</th><th>Lang</th><th>CEFR</th><th>Score</th></tr>
                </thead>
                <tbody>
                  {assessments?.map((a, i) => (
                    <tr key={i} className="border-t border-black/5">
                      <td className="py-2">{new Date(a.created_at).toLocaleString()}</td>
                      <td>{a.target_language}</td>
                      <td className="font-medium">{a.cefr_estimate}</td>
                      <td>{a.total_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Purchases</h2>
          {!purchases?.length ? <p className="text-sm text-neutral-600">No purchases.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-600"><th className="py-2">Date</th><th>Price</th><th>Lang</th><th>Amount</th></tr>
                </thead>
                <tbody>
                  {purchases?.map((p, i) => (
                    <tr key={i} className="border-t border-black/5">
                      <td className="py-2">{new Date(p.created_at).toLocaleString()}</td>
                      <td>{p.price_id}</td>
                      <td>{p.lang}</td>
                      <td>€{(p.amount_total/100).toFixed(2)} {p.currency.toUpperCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Add Teacher Note</h2>
          <AddNote email={email} />
          <h3 className="text-sm font-semibold mt-6 mb-2">Previous notes</h3>
          <ul className="space-y-2 text-sm">
            {!notes?.length && <li className="text-neutral-600">No notes yet.</li>}
            {notes?.map((n, i) => (
              <li key={i} className="border rounded-lg px-3 py-2">
                <div className="text-neutral-500 text-xs">{new Date(n.created_at).toLocaleString()}</div>
                <div>{n.note}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-3">Adjust Credits</h2>
          <AdjustCredits email={email} />
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
