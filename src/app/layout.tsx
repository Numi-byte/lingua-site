import './globals.css'
import Link from 'next/link'
import { Plus_Jakarta_Sans } from 'next/font/google'
import ToastHost from '@/components/Toast'
import HeaderClient from '@/components/HeaderClient'
import { I18nProvider } from './i18n/provider'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lingua By — Italian & German',
  description: 'Free assessment + free first class. Group cohorts.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="page-bg font-sans text-neutral-900">
        {/* Wrap anything that might use useSearchParams/usePathname in Suspense */}
        <Suspense fallback={null}>
          <I18nProvider>
            <HeaderClient />
            <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
            <Footer />
            <ToastHost />
          </I18nProvider>
        </Suspense>
      </body>
    </html>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-8 text-sm text-neutral-500">
        <p>© {new Date().getFullYear()} Lingua by</p>
        <div className="flex gap-4">
          <Link href="/pricing" className="hover:text-neutral-800">Pricing</Link>
          <Link href="/book" className="hover:text-neutral-800">Book</Link>
          <Link href="/assessment" className="hover:text-neutral-800">Assessment</Link>
        </div>
      </div>
    </footer>
  )
}
