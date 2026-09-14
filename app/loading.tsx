'use client'

// Next.js App Router convention: automatically shown as the Suspense
// fallback for app/ while a route segment's code/data is still loading
// (https://nextjs.org/docs/app/api-reference/file-conventions/loading).
// Renders inside the root layout (providers stay mounted — see
// app/layout.tsx), so useLanguage() works the same as it does in
// error.tsx. Deliberately minimal: one small spinner and the same
// t('common.loading') text already used elsewhere (scheme detail page),
// not a full skeleton — most routes here are fast client components, so
// this only ever shows briefly during a route's initial code-split chunk
// load, and a heavier skeleton would just be motion for its own sake.

import { Loader2 } from 'lucide-react'

import { useLanguage } from '@/lib/i18n/language-context'

export default function Loading() {
  const { t } = useLanguage()

  return (
    <main className="container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary motion-reduce:animate-none" aria-hidden />
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    </main>
  )
}
