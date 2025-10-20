'use client'
import { useState } from 'react'
import { CreditCard } from 'lucide-react'

export default function PortalButton() {
  const [loading, setLoading] = useState(false)
  return (
    <button
      className="btn btn-ghost"
      onClick={async () => {
        try {
          setLoading(true)
          const res = await fetch('/api/billing/portal', { method: 'POST' })
          const j = await res.json()
          if (!res.ok) throw new Error(j.error || 'Failed')
          window.location.href = j.url
        } catch (e: any) {
          alert(e.message || 'Unable to open billing portal')
        } finally {
          setLoading(false)
        }
      }}
      disabled={loading}
    >
      <CreditCard size={16} /> {loading ? 'Opening…' : 'Open billing portal'}
    </button>
  )
}
