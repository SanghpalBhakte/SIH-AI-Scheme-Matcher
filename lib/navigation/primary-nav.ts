'use client'

import type { MouseEvent } from 'react'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, LayoutGrid, ListChecks, type LucideIcon } from 'lucide-react'

import { useAssessment } from '@/lib/assessment/assessment-context'
import { useLanguage } from '@/lib/i18n/language-context'

/**
 * The four top-level destinations. Shared by the desktop header nav and
 * the mobile bottom tab bar so both always list the same places in the
 * same order. `tabLabelKey` is a shorter label for the tab bar, where
 * each item gets roughly a quarter of a 360px screen.
 */
export const PRIMARY_NAV: { href: string; labelKey: string; tabLabelKey?: string; icon: LucideIcon }[] = [
  { href: '/', labelKey: 'nav.home', icon: Home },
  { href: '/assessment', labelKey: 'nav.assessment', icon: ClipboardList },
  { href: '/schemes', labelKey: 'nav.schemes', icon: LayoutGrid },
  { href: '/recommendations', labelKey: 'nav.recommendations', tabLabelKey: 'nav.tabRecommendations', icon: ListChecks },
]

export function isNavActive(pathname: string | null, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || (pathname?.startsWith(`${href}/`) ?? false)
}

/**
 * In-app unsaved-progress guard: only fires when the user is currently ON
 * /assessment, the draft is dirty, and the link would actually take them
 * somewhere else. Passing onClick and calling preventDefault is the
 * supported way to cancel a Next.js <Link> navigation. Browser
 * Back/Forward can't be intercepted this way (see assessment/page.tsx).
 */
export function useNavGuard() {
  const pathname = usePathname()
  const { isDirty } = useAssessment()
  const { t } = useLanguage()

  return function guardNavigation(e: MouseEvent, href: string) {
    if (pathname === '/assessment' && href !== '/assessment' && isDirty) {
      if (!window.confirm(t('nav.unsavedGuard'))) e.preventDefault()
    }
  }
}
