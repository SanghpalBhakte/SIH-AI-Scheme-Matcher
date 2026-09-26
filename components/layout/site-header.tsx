'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Landmark, Bookmark } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { LanguageToggle } from '@/components/i18n/language-toggle'
import { LanguageNudge } from '@/components/i18n/language-nudge'
import { ToolsMenu } from '@/components/layout/tools-menu'
import { MobileMoreMenu } from '@/components/layout/mobile-more-menu'
import { cn } from '@/lib/utils'
import { useSavedSchemes } from '@/lib/schemes/saved-schemes-context'
import { useLanguage } from '@/lib/i18n/language-context'
import { PRIMARY_NAV, isNavActive, useNavGuard } from '@/lib/navigation/primary-nav'

// "Saved schemes" (/dashboard) is deliberately its own bookmark icon in
// the actions area rather than a 5th text nav item. The four primary
// links live in lib/navigation/primary-nav.ts, shared with the phone-only
// bottom tab bar (components/layout/mobile-tab-bar.tsx).
export function SiteHeader() {
  const pathname = usePathname()
  const guardNavigation = useNavGuard()
  const { savedIds, isHydrated: savedHydrated } = useSavedSchemes()
  const { t } = useLanguage()
  const savedCount = savedHydrated ? savedIds.length : 0
  // Keeps the one-time language nudge from overlapping the language
  // dropdown's own floating panel — both are absolutely positioned
  // under the same trigger (see the `relative` wrapper below).
  const [langOpen, setLangOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card shadow-soft">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          // Below `sm` only the icon shows — without this the link has no
          // accessible name for screen readers (axe: link-name).
          aria-label={`SchemeSetu — ${t('nav.home')}`}
          onClick={(e) => guardNavigation(e, '/')}
          // -mx-2/px-2 + min-h-11 keep a 44px tap target without shifting
          // layout. The primary nav moved to the bottom tab bar on phones,
          // so the wordmark now has room at every width.
          className="-mx-2 flex min-h-11 shrink-0 items-center gap-2 px-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-80"
        >
          <Landmark className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-display text-base">SchemeSetu</span>
        </Link>

        {/* Text links from `sm` up; on phones the same four links are the
            labelled bottom tab bar instead (mobile-tab-bar.tsx). */}
        <nav className="hidden min-w-0 items-center gap-1 text-sm sm:flex">
          {PRIMARY_NAV.map((link) => {
            const isActive = isNavActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => guardNavigation(e, link.href)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center rounded-md border-b-2 px-3 py-1.5 transition-colors duration-150',
                  isActive
                    ? 'border-primary font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {t(link.labelKey)}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Badge variant="secondary" className="hidden lg:inline-flex">
            SIH26092 · Prototype
          </Badge>
          {/* Saved schemes / Tools / Theme collapse into MobileMoreMenu
              below `sm`; at `sm` and up they're separate icons. */}
          <div className="hidden items-center gap-1 sm:flex sm:gap-2">
            <Link
              href="/dashboard"
              onClick={(e) => guardNavigation(e, '/dashboard')}
              aria-label={t('nav.savedSchemesLink')}
              className={cn(
                'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground',
                pathname === '/dashboard' && 'text-primary'
              )}
            >
              <Bookmark className="h-4 w-4" aria-hidden />
              {savedCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-accent-foreground">
                  {savedCount}
                </span>
              )}
            </Link>
            {/* EMI Calculator and the CSC locator used to live only in the
                footer / a specific scheme's checklist respectively — on
                mobile that meant scrolling past an entire page (or first
                opening a scheme) to find either. One combined icon here
                (see components/layout/tools-menu.tsx for why it's one
                icon, not two) fixes that without crowding the row. */}
            <ToolsMenu />
          </div>
          {/* Language stays visible on phones too — it's a headline feature
              for this audience (12 Indian languages), too important to
              bury inside the More menu. */}
          <LanguageToggle onOpenChange={setLangOpen} />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <MobileMoreMenu />
        </div>
      </div>
      {/* One-time hint pointing at the language button, which is now
          visible in the header at every width. See language-nudge.tsx. */}
      <LanguageNudge hidden={langOpen} />
    </header>
  )
}
