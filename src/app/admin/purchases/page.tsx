import { supabaseService } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

export default async function AdminPurchases() {
  const db = supabaseService()
  const { data, error } = await db
    .from('purchases')
    .select('created_at,email,price_id,amount_total,currency,lang')
    .order('created_at', { ascending: false })

  if (error) return <div className="card p-6">DB error: {error.message}</div>

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-3">Purchases</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="py-2">Date</th>
              <th>Email</th>
              <th>Price</th>
              <th>Lang</th>
              <th>Amount</th>
              <th>Cur</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td>{r.email}</td>
                <td>{r.price_id}</td>
                <td>{r.lang}</td>
                <td>€{(r.amount_total/100).toFixed(2)}</td>
                <td>{r.currency.toUpperCase()}</td>
              </tr>
            ))}
            {!data?.length && <tr><td className="py-3" colSpan={6}>No data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
