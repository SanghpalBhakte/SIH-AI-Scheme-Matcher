'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Languages } from 'lucide-react'

import { useLanguage } from '@/lib/i18n/language-context'
import { LOCALES, type Locale } from '@/lib/i18n/translations'
import { cn } from '@/lib/utils'

/**
 * Header language switcher.
 *
 * Previously this was a real <select> made visually invisible and
 * layered over an icon+shortLabel trigger, purely so the CLOSED state
 * never reflowed for a long native name. Functional, but it didn't
 * *read* as a working control — no visible menu, nothing shown until
 * you were already mid-click on a browser-native list. This is a real
 * popover instead: a visible trigger button and a floating panel that
 * lists every language in its own script (nativeLabel) plus the
 * English name, with the active one checked.
 *
 * Hand-rolled rather than pulled from a menu library — consistent with
 * this app's dependency-free-where-reasonable approach (see the note
 * atop translations.ts) — but keeps real interaction basics: Escape
 * and an outside click both close it and return focus to the trigger,
 * and every option is a real, individually focusable <button>.
 */
export function LanguageToggle({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const { locale, setLocale, isHydrated, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function choose(code: Locale) {
    setLocale(code)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav.languageToggle')}
        className="flex h-11 items-center gap-1.5 rounded-md px-2.5 text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground sm:h-9 sm:px-2"
      >
        <Languages className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-xs font-medium">{isHydrated ? current.shortLabel : LOCALES[0].shortLabel}</span>
        <ChevronDown
          className={cn('h-3 w-3 shrink-0 opacity-60 transition-transform duration-150', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('nav.languageToggle')}
          className="animate-fade-in-up absolute right-0 top-full z-30 mt-2 max-h-80 w-52 overflow-y-auto rounded-lg border border-border bg-card p-1.5 shadow-elevated-lg"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === locale}
              onClick={() => choose(l.code)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-100',
                l.code === locale ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-secondary'
              )}
            >
              <span className="flex items-baseline gap-2">
                <span>{l.nativeLabel}</span>
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </span>
              {l.code === locale && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
