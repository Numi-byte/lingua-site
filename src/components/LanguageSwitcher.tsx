'use client'
import { useI18n } from '@/app/i18n/provider'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e)=>setLocale(e.target.value as any)}
      className="btn btn-ghost text-sm"
    >
      <option value="en">EN</option>
      <option value="it">IT</option>
      <option value="de">DE</option>
    </select>
  )
}
