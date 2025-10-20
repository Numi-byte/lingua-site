'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { dict, Locale } from './dictionaries'

type Ctx = { locale: Locale; setLocale: (l:Locale)=>void; t:(k:string)=>string }
const I18nCtx = createContext<Ctx | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  useEffect(() => {
    const saved = (localStorage.getItem('locale') as Locale) || 'en'
    setLocaleState(saved)
    document.documentElement.lang = saved
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('locale', l)
    document.documentElement.lang = l
  }

  const t = (k: string) => dict[locale][k] ?? dict.en[k] ?? k
  return <I18nCtx.Provider value={{ locale, setLocale, t }}>{children}</I18nCtx.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error('I18nProvider missing')
  return ctx
}
