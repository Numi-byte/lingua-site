import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export default async function DataPage() {
  const db = supabaseAdmin()
  const [{ data: asses }, { data: purchases }] = await Promise.all([
    db.from('assessments').select('created_at,email,target_language,cefr_estimate,total_score').order('created_at', { ascending: false }).limit(50),
    db.from('purchases').select('created_at,email,price_id,amount_total,currency').order('created_at', { ascending: false }).limit(50),
  ])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Recent assessments</h2>
        <div className="mt-3 space-y-2 text-sm">
          {(asses ?? []).map(a => (
            <div key={`${a.email}-${a.created_at}`} className="rounded-xl border border-black/10 bg-white/70 p-3 flex items-center justify-between">
              <div>{a.email}<div className="text-xs text-neutral-500">{a.target_language}</div></div>
              <div className="text-sm">CEFR <b>{a.cefr_estimate}</b> • {a.total_score}</div>
              <div className="text-xs text-neutral-500">{new Date(a.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Recent purchases</h2>
        <div className="mt-3 space-y-2 text-sm">
          {(purchases ?? []).map(p => (
            <div key={`${p.email}-${p.created_at}-${p.price_id}`} className="rounded-xl border border-black/10 bg-white/70 p-3 flex items-center justify-between">
              <div>{p.email}<div className="text-xs text-neutral-500">{p.price_id}</div></div>
              <div className="text-sm">{(p.currency ?? 'eur').toUpperCase()} {(p.amount_total/100).toFixed(2)}</div>
              <div className="text-xs text-neutral-500">{new Date(p.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
