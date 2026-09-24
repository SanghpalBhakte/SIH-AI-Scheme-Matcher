'use client'

// Next.js App Router convention: renders for any URL that doesn't match a
// route (https://nextjs.org/docs/app/api-reference/file-conventions/not-found).
// Without this file Next.js falls back to its own unstyled default 404 —
// confirmed live during the UI/UX audit to render as a jarring plain page
// against this app's branded header/footer. Mirrors the same on-theme
// empty-state pattern as app/error.tsx and app/offline/page.tsx (icon chip +
// title + body + Button/Link actions) rather than one-off styling.

import Link from 'next/link'
import { Compass } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/language-context'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Compass className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-foreground">{t('notFound.title')}</h1>
            <p className="max-w-sm text-sm text-muted-foreground">{t('notFound.body')}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button size="sm" asChild>
              <Link href="/">{t('error.goHome')}</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/schemes">{t('landing.browseAll')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
