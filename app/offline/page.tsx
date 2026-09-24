'use client'

import Link from 'next/link'
import { WifiOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/language-context'

// Service-worker fallback for a navigation that isn't cached and the
// network is unreachable — see public/sw.js. Deliberately has no data
// dependency (no schemes, no profile) so it always renders correctly
// even with zero connectivity.
export default function OfflinePage() {
  const { t } = useLanguage()

  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <WifiOff className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="text-lg font-semibold text-foreground">{t('offline.title')}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t('offline.body')}</p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/">{t('nav.home')}</Link>
      </Button>
    </main>
  )
}
