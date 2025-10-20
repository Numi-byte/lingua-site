'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useI18n } from '@/app/i18n/provider'
import { CalendarClock, Compass, LayoutGrid, User } from 'lucide-react'
import { Suspense } from 'react'

export default function HeaderClient() {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-xl bg-brand-500/90" />
          <span className="text-[15px] font-semibold tracking-tight">Lingua</span>
        </Link>

        <nav className="hidden gap-6 md:flex text-sm">
          <NavItem href="/assessment" label={t('nav_assessment') || 'Assessment'} icon={<Compass size={16} />} />
          <NavItem href="/book" label={t('nav_book') || 'Free Trial'} icon={<CalendarClock size={16} />} />
          <NavItem href="/pricing" label={t('nav_pricing') || 'Packages'} icon={<LayoutGrid size={16} />} />
          <NavItem href="/dashboard" label={t('nav_dashboard') || 'Dashboard'} icon={<User size={16} />} />
        </nav>

        <div className="flex items-center gap-2">
          {/* Wrap LanguageSwitcher (uses useSearchParams) in Suspense */}
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
          <ThemeToggle />
          <Link href="/book" className="btn btn-primary hidden md:inline-flex">
            {t('book_free_class') || 'Book free class'}
          </Link>
          <Link href="/auth" className="btn btn-ghost">
            {t('sign_in') || 'Sign in'}
          </Link>
        </div>
      </div>
    </header>
  )
}

function NavItem({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-900"
    >
      {icon} {label}
    </Link>
  )
}
