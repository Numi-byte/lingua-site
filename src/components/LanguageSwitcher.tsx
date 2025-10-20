'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ChangeEvent } from 'react'

const SUPPORTED = ['en', 'it', 'de'] as const
type Lang = (typeof SUPPORTED)[number]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const current = (sp.get('lang') as Lang) || 'en'

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value as Lang
    const params = new URLSearchParams(sp.toString())
    params.set('lang', lang)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select className="input" value={current} onChange={onChange} aria-label="Language">
      <option value="en">EN</option>
      <option value="it">IT</option>
      <option value="de">DE</option>
    </select>
  )
}
