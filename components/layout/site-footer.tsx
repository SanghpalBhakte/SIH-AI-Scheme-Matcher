'use client'

import Link from 'next/link'
import { Landmark } from 'lucide-react'

import { DisclaimerBanner } from '@/components/layout/disclaimer-banner'
import { MachineTranslationNotice } from '@/components/layout/machine-translation-notice'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { useLanguage } from '@/lib/i18n/language-context'
import { CSC_LOCATOR_URL } from '@/lib/schemes/csc-locator'

// Footer content inspired by the reference site's 3-column layout (brand
// blurb / platform links / important notes) — rewritten in our own words
// and, unlike that reference's permanently-dark footer, kept theme-aware
// (bg-secondary/border-border) so it doesn't clash with our light/dark
// toggle. The disclaimer banner is unchanged and still lives here, just
// with real content around it now instead of being the footer's only
// content.
export function SiteFooter() {
  const { t } = useLanguage()

  return (
    // mt-28 on mobile only: on a short page (dashboard, offline) at a
    // phone-height viewport, the flex-1 content area above stretches to
    // fill the remaining viewport height regardless of its own content
    // — so extra bottom padding *inside* that area has no effect on
    // where this footer starts (flex-grow, not content size, decides
    // that). Margin here, on the footer itself, isn't absorbed the same
    // way: it reliably pushes the footer (and the nav links right
    // inside it) down and clear of the floating chat launcher's fixed
    // bottom-right band (see chat-launcher.tsx), instead of landing
    // under it. Not needed from sm: up, where the launcher moves to
    // bottom-6 and taller viewports make this a non-issue.
    <footer className="mt-16 border-t border-border bg-secondary/30 sm:mt-0">
      {/* pb-24 on phones: the last lines can scroll clear of the chat button. */}
      <div className="container flex flex-col gap-8 pb-24 pt-10 sm:py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Landmark className="h-4 w-4 text-primary" aria-hidden />
              <span className="font-display text-base">SchemeSetu</span>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">{t('footer.blurb')}</p>
            <p className="text-xs text-muted-foreground">{t('footer.builtFor')}</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{t('footer.platformHeading')}</p>
            <nav className="flex flex-col text-sm sm:gap-1.5">
              <Link href="/assessment" className="flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0">
                {t('nav.assessment')}
              </Link>
              <Link href="/schemes" className="flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0">
                {t('nav.schemes')}
              </Link>
              <Link href="/dashboard" className="flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0">
                {t('nav.saved')}
              </Link>
              <Link href="/institutions" className="flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0">
                {t('nav.institutions')}
              </Link>
              <Link href="/emi-calculator" className="flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0">
                {t('nav.emiCalculator')}
              </Link>
              <a
                href={CSC_LOCATOR_URL}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
              >
                {t('checklist.findCscHelp')}
              </a>
            </nav>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{t('footer.importantHeading')}</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>{t('footer.importantNote1')}</li>
              <li>{t('footer.importantNote2')}</li>
              <li>{t('footer.importantNote3')}</li>
            </ul>
          </div>
        </div>

        <DisclaimerBanner />
        <MachineTranslationNotice />

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{t('footer.copyright', { year: String(new Date().getFullYear()) })}</p>
          <InstallPrompt />
        </div>
      </div>
    </footer>
  )
}
