/** Extract a Stripe price id from a string like "NEXT_PUBLIC_PRICE_A1=price_123" or "price_123". */
export function extractPriceId(input?: string | null): string | null {
  if (!input) return null
  const s = String(input).trim()
  // If "KEY=value", take the part after the last "="
  const candidate = s.includes('=') ? s.slice(s.lastIndexOf('=') + 1).trim() : s
  // Accept modern "price_" or legacy "pr_" ids; otherwise return null
  if (candidate.startsWith('price_') || candidate.startsWith('pr_')) return candidate
  return null
}
