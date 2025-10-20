'use client'

type StartCohort = { cohortId: string; lang: 'Italian'|'German'; email?: string }
type StartPrice  = { priceId: string; lang?: 'Italian'|'German' }

export async function startCheckout(input: StartCohort | StartPrice) {
  if ('cohortId' in input) {
    const res = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohort_id: input.cohortId, lang: input.lang, email: input.email }),
    })
    const j = await res.json()
    if (!res.ok) throw new Error(j.error || 'Failed to start checkout')
    window.location.href = j.url
    return
  }

  const res = await fetch('/api/checkout/price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price_id: input.priceId, lang: input.lang }),
  })
  const j = await res.json()
  if (!res.ok) throw new Error(j.error || 'Failed to start checkout')
  window.location.href = j.url
}
