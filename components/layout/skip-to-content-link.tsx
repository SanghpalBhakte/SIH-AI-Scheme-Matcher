'use client'

// Keyboard/screen-reader users otherwise have to tab through the entire
// header nav on every single page load to reach content. Visually hidden
// until focused (sr-only / focus:not-sr-only), and rendered as the very
// first thing in <body> (see layout.tsx) so it's the first Tab stop.
// Pulled into its own client component because the root layout itself is
// a server component (no hooks) — this is the only piece of it that needs
// useLanguage().

import { useLanguage } from '@/lib/i18n/language-context'

export function SkipToContentLink() {
  const { t } = useLanguage()

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-elevated"
    >
      {t('a11y.skipToContent')}
    </a>
  )
}
