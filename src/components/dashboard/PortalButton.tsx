'use client'

import { useState } from 'react'

type PortalRes = { url?: string; error?: string }

export default function PortalButton() {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data: PortalRes = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to open portal')
      window.location.href = data.url
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="btn btn-ghost" onClick={openPortal} disabled={loading}>
      {loading ? 'Opening…' : 'Billing Portal'}
    </button>
  )
}
