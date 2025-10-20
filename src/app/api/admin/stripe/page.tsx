'use client'

import { useEffect, useMemo, useState } from 'react'

type Resource =
  | 'products' | 'prices' | 'customers' | 'checkout_sessions'
  | 'payment_intents' | 'events' | 'coupons' | 'promotion_codes'

const RESOURCES: { key: Resource; label: string; tip?: string }[] = [
  { key: 'products', label: 'Products' },
  { key: 'prices', label: 'Prices' },
  { key: 'customers', label: 'Customers' },
  { key: 'checkout_sessions', label: 'Checkout Sessions', tip: 'Use expand=line_items' },
  { key: 'payment_intents', label: 'Payment Intents' },
  { key: 'events', label: 'Events' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'promotion_codes', label: 'Promotion Codes' },
]

export default function StripeExplorer() {
  const [resource, setResource] = useState<Resource>('products')
  const [expand, setExpand] = useState<string>('')
  const [limit, setLimit] = useState<number>(20)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startingAfter, setStartingAfter] = useState<string | null>(null)

  const listUrl = useMemo(() => {
    const u = new URL('/api/admin/stripe/list', window.location.origin)
    u.searchParams.set('resource', resource)
    u.searchParams.set('limit', String(limit))
    if (expand.trim()) u.searchParams.set('expand', expand.trim())
    if (startingAfter) u.searchParams.set('starting_after', startingAfter)
    return u.toString()
  }, [resource, limit, expand, startingAfter])

  async function fetchList(resetCursor = false) {
    try {
      setLoading(true); setError(null)
      if (resetCursor) setStartingAfter(null)
      const res = await fetch(listUrl)
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || res.statusText)
      setData(j)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList(true) }, [resource]) // auto load on resource change

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Stripe Explorer</h1>

      <div className="card p-4 flex flex-col gap-3 md:flex-row md:items-end">
        <div>
          <label className="label">Resource</label>
          <select className="input" value={resource} onChange={e=>setResource(e.target.value as Resource)}>
            {RESOURCES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          {RESOURCES.find(r=>r.key===resource)?.tip && (
            <div className="text-xs text-neutral-500 mt-1">{RESOURCES.find(r=>r.key===resource)?.tip}</div>
          )}
        </div>
        <div>
          <label className="label">Expand (comma-separated)</label>
          <input className="input" placeholder="e.g. line_items,data.customer" value={expand} onChange={e=>setExpand(e.target.value)} />
        </div>
        <div>
          <label className="label">Limit</label>
          <input className="input" type="number" min={1} max={100} value={limit} onChange={e=>setLimit(Number(e.target.value||20))} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={()=>fetchList(true)} disabled={loading}>Fetch</button>
          <button className="btn btn-ghost" onClick={()=>data && downloadJSON(`${resource}.json`, data)} disabled={!data}>Download JSON</button>
        </div>
      </div>

      {error && <div className="card p-4 text-red-600 text-sm">Error: {error}</div>}

      <div className="card p-4">
        {loading && <div className="animate-pulse h-16 rounded bg-black/10" />}
        {!loading && data && (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-neutral-600">
                {Array.isArray(data.data) ? `${data.data.length} items` : ''} {data.has_more ? '(has more)' : ''}
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => { if (data.next_starting_after) { setStartingAfter(data.next_starting_after); fetchList(false) } }}
                  disabled={!data?.next_starting_after}
                >
                  Load more →
                </button>
              </div>
            </div>

            {/* Compact tables for common resources, else JSON */}
            {resource === 'products' && <ProductsTable rows={data.data} />}
            {resource === 'prices' && <PricesTable rows={data.data} />}
            {resource === 'customers' && <CustomersTable rows={data.data} />}
            {resource === 'checkout_sessions' && <SessionsTable rows={data.data} />}
            {(resource === 'payment_intents' || resource === 'events' || resource === 'coupons' || resource === 'promotion_codes') && (
              <JsonBlock obj={data} />
            )}
          </>
        )}
        {!loading && !data && <div className="text-sm text-neutral-600">No data yet.</div>}
      </div>
    </div>
  )
}

function ProductsTable({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-neutral-600"><th className="py-2">ID</th><th>Name</th><th>Active</th><th>Created</th></tr></thead>
        <tbody>
          {rows.map((p: any) => (
            <tr key={p.id} className="border-t border-black/5">
              <td className="py-2 font-mono text-xs">{p.id}</td>
              <td>{p.name}</td>
              <td>{p.active ? 'yes' : 'no'}</td>
              <td>{new Date(p.created * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PricesTable({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-neutral-600"><th className="py-2">ID</th><th>Product</th><th>Unit Amount</th><th>Currency</th><th>Recurring</th></tr></thead>
        <tbody>
          {rows.map((p: any) => (
            <tr key={p.id} className="border-t border-black/5">
              <td className="py-2 font-mono text-xs">{p.id}</td>
              <td className="font-mono text-xs">{typeof p.product === 'string' ? p.product : p.product?.id}</td>
              <td>€{(p.unit_amount/100).toFixed(2)}</td>
              <td>{p.currency?.toUpperCase()}</td>
              <td>{p.recurring ? `${p.recurring.interval}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CustomersTable({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-neutral-600"><th className="py-2">ID</th><th>Email</th><th>Name</th><th>Created</th></tr></thead>
        <tbody>
          {rows.map((c: any) => (
            <tr key={c.id} className="border-t border-black/5">
              <td className="py-2 font-mono text-xs">{c.id}</td>
              <td>{c.email}</td>
              <td>{c.name}</td>
              <td>{new Date(c.created * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SessionsTable({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-neutral-600"><th className="py-2">ID</th><th>Email</th><th>Status</th><th>Amount</th><th>Created</th></tr></thead>
        <tbody>
          {rows.map((s: any) => (
            <tr key={s.id} className="border-t border-black/5">
              <td className="py-2 font-mono text-xs">{s.id}</td>
              <td>{s.customer_details?.email || s.customer_email || '—'}</td>
              <td>{s.status}</td>
              <td>{s.amount_total != null ? `€${(s.amount_total/100).toFixed(2)}` : '—'}</td>
              <td>{new Date((s.created || s.created_at_unix || 0) * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function JsonBlock({ obj }: { obj: any }) {
  return (
    <pre className="mt-3 overflow-auto rounded-xl border border-black/10 bg-white/70 p-3 text-xs leading-relaxed">
      {JSON.stringify(obj, null, 2)}
    </pre>
  )
}

function downloadJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
