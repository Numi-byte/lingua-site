'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function BookPage() {
  const sp = useSearchParams()
  const paid = sp.get('paid') === '1'

  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://assets.calendly.com/assets/external/widget.js'
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="card p-6">
        <h1 className="text-xl font-semibold mb-2">Book your free class</h1>
        {paid && (
          <div className="mb-3 text-sm">
            ✅ Payment received. If you bought credits, you can also use them for 1:1 sessions.
          </div>
        )}
        <p className="text-sm text-neutral-600 mb-4">
          Pick a time that works. You’ll get an email confirmation and calendar invite.
        </p>
        <div
          className="calendly-inline-widget rounded-xl"
          style={{ minWidth: '320px', height: '760px' }}
          data-url="https://calendly.com/numairahmed11/30min"
        />
      </div>

      <aside className="card p-6">
        <h3 className="text-lg font-semibold">How it works</h3>
        <ol className="mt-3 list-decimal pl-5 text-sm text-neutral-700 space-y-1">
          <li>Book your free class</li>
          <li>We discuss goals and do a quick speaking check</li>
          <li>Choose a plan and schedule your lessons</li>
        </ol>
        <p className="mt-4 text-xs text-neutral-500">Zoom/Meet links are auto-generated with reminders 24h & 1h before.</p>

        <div className="mt-5 flex gap-3">
          <Link href="/pricing" className="btn btn-ghost">Buy credits</Link>
          <Link href="/dashboard" className="btn btn-primary">Go to dashboard</Link>
        </div>
      </aside>
    </div>
  )
}
