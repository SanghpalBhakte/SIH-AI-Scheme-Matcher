'use client'

import { useLanguage } from '@/lib/i18n/language-context'
import { LOCALES } from '@/lib/i18n/translations'
import { cn } from '@/lib/utils'

/**
 * Landing-page discovery surface for the language switcher — a second,
 * more visible way to find it beyond the header's compact icon+label
 * control (see components/i18n/language-toggle.tsx). Tapping a chip
 * switches immediately; the current language is highlighted the same
 * way an active nav link is elsewhere in this app.
 */
export function LanguageChipStrip() {
  const { locale, setLocale, isHydrated, t } = useLanguage()
  const current = isHydrated ? locale : LOCALES[0].code

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{t('landing.readInLabel')}</span>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={current === l.code}
          className={cn(
            // py-2.5 (was py-1, a 26px-tall tap target on a real mobile
            // audit) gets each chip closer to a comfortable ~36px —
            // this is the primary, most-discoverable way to switch
            // language for a first-time visitor, worth the extra room.
            'inline-flex min-h-11 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 sm:min-h-9',
            current === l.code
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
          )}
        >
          {l.nativeLabel}
        </button>
      ))}
    </div>
  )
}
