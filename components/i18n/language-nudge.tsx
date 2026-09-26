'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'

import { useLanguage } from '@/lib/i18n/language-context'
import { DEFAULT_LOCALE } from '@/lib/i18n/translations'

const STORAGE_KEY = 'sih26092.languageNudgeDismissed'

/**
 * One-time discovery hint for the language switcher — most first-time
 * visitors have no reason to notice a small "EN" in the header. Shows
 * once, disappears for good once dismissed OR once the visitor actually
 * switches language (at that point they've found it; no need to nag).
 * Same isHydrated-safe localStorage pattern as the rest of this app's
 * persisted UI state — server render and first paint always render
 * nothing, so there's no hydration mismatch and no popover flash for a
 * returning visitor.
 *
 * Fixed to the bottom of the viewport rather than floating under the
 * language icon — a real mobile audit (2026-09-09) found the old
 * "absolute, dropped below the header" version landing directly on top
 * of the page's own H1 on every page checked (Home, Saved schemes,
 * Recommendations, a scheme's detail page): a slim 64px sticky header
 * leaves page content starting almost immediately below it, so a
 * 3-line tooltip had nowhere to drop without covering something real.
 * A bottom banner never competes with a page's own heading, and reads
 * the same regardless of where the language control currently lives
 * (a standalone icon at `sm` and up, tucked inside the "More" menu
 * below it — see mobile-more-menu.tsx) — hence the generic "in the
 * header" wording instead of the old "tap here" pointing at a specific
 * icon.
 *
 * 2026-09-26 (mobile UX pass): shown ONCE per browser (marked seen the
 * moment it appears), auto-hides after 12s, never on the home page (which
 * already shows every language as a chip), and on phones it sits above
 * the chat launcher and the bottom tab bar instead of on top of page
 * content. The language button is now visible in the header at every
 * width, so the copy can point at it directly.
 */
export function LanguageNudge({ hidden = false }: { hidden?: boolean }) {
  const { locale, isHydrated } = useLanguage()
  const pathname = usePathname()
  const [dismissed, setDismissed] = useState(true)
  const [storageChecked, setStorageChecked] = useState(false)

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setDismissed(false)
    }
    setStorageChecked(true)
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // non-fatal — the nudge just might show again next visit
    }
  }

  // Once someone has actually switched language, they've found the
  // control — stop nagging and remember that too.
  useEffect(() => {
    if (isHydrated && locale !== DEFAULT_LOCALE) dismiss()
  }, [isHydrated, locale])

  const visible = !hidden && isHydrated && storageChecked && !dismissed && locale === DEFAULT_LOCALE && pathname !== '/'

  // One-time hint: remember it was seen as soon as it appears, and get
  // out of the way on its own after 12s.
  useEffect(() => {
    if (!visible) return
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // storage unavailable — it'll just show again next visit
    }
    const id = window.setTimeout(() => setDismissed(true), 12000)
    return () => window.clearTimeout(id)
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="status"
      className="animate-fade-in-up fixed inset-x-4 bottom-[calc(9rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-sm rounded-md border border-border bg-card py-2 pl-3 pr-12 text-left shadow-elevated-lg sm:bottom-24"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss language hint"
        // p-2.5 around a 12px icon gives a ~32px tap target (the icon
        // itself stays visually small) — the raw p-0.5 this replaced
        // measured at just 16x16px on a real mobile audit.
        className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <p className="text-xs leading-relaxed text-foreground">
        <span className="font-semibold">12 Indian languages available.</span> Switch anytime with the language
        button at the top of the screen.
      </p>
    </div>
  )
}
