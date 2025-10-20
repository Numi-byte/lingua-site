'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/status', { cache: 'no-store' })
        if (!res.ok) return
        const data: { isAdmin?: boolean } = await res.json()
        if (alive) setIsAdmin(Boolean(data.isAdmin))
      } catch {
        // ignore
      }
    })()
    return () => {
      alive = false
    }
  }, []) // no missing deps now

  if (!isAdmin) return null
  return (
    <Link href="/admin" className="btn btn-ghost">
      Admin
    </Link>
  )
}
