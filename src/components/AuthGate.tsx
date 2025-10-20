'use client'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  if (status === 'loading') return <div className="card p-6">Checking session…</div>
  if (status === 'guest') {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Sign in required</h2>
        <p className="text-sm text-neutral-600 mb-4">Please sign in to access your dashboard.</p>
        <Link href="/auth" className="btn btn-primary">Sign in</Link>
      </div>
    )
  }
  return <>{children}</>
}
