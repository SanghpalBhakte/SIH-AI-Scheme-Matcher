'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLanguage } from '@/lib/i18n/language-context'
import { PRIMARY_NAV, isNavActive, useNavGuard } from '@/lib/navigation/primary-nav'
import { cn } from '@/lib/utils'

/**
 * Phone-only bottom navigation (hidden from `sm` up, where the header
 * shows the same links as text). Replaces the old row of four unlabelled
 * icons in the mobile header: every tab now has an icon AND a label,
 * sits in the thumb zone, and is a full quarter-width, 64px-tall target.
 *
 * The bar is 4rem tall (+ the device's home-indicator inset). Things that
 * share the bottom of the screen are offset to match: the chat launcher
 * sits at 5rem, the one-time language hint at 9rem, and <body> gets 4rem
 * of bottom padding on phones (globals.css) so the last content on every
 * page can always scroll clear of the bar.
 *
 * Hidden while a text field has focus: with the on-screen keyboard open,
 * a bottom bar would sit on top of the keyboard and eat the little
 * screen space left for the field being typed into.
 */
const TYPING_FIELD = 'input:not([type=radio]):not([type=checkbox]):not([type=range]):not([type=button]):not([type=submit]), textarea, [contenteditable=true]'

export function MobileTabBar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const guardNavigation = useNavGuard()
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => setTyping(e.target instanceof Element && e.target.matches(TYPING_FIELD))
    const onFocusOut = () => setTyping(false)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_4px_rgb(0_0_0/0.05)] sm:hidden',
        typing && 'hidden'
      )}
    >
      <ul className="grid h-16 grid-cols-4">
        {PRIMARY_NAV.map((link) => {
          const active = isNavActive(pathname, link.href)
          const Icon = link.icon
          return (
            <li key={link.href} className="min-w-0">
              <Link
                href={link.href}
                onClick={(e) => guardNavigation(e, link.href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 px-1 text-xs font-medium transition-colors duration-150 active:bg-secondary/60',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-14 items-center justify-center rounded-full transition-colors duration-150',
                    active && 'bg-primary/10'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="max-w-full truncate leading-none">{t(link.tabLabelKey ?? link.labelKey)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
