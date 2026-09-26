'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/language-context'
import type { Scheme } from '@/lib/matching/types'

/**
 * The two actions at the bottom of every scheme card (recommendations and
 * the scheme browser): open the scheme here, or go to its official source.
 * Real buttons rather than the old 12px text links, which were 16px-tall
 * tap targets on phones. Stacked full width on phones (translated labels
 * can be long), side by side from `sm` up. `mt-auto` pins them to the
 * bottom of the card (the card body is a flex column) so they line up
 * across cards of different heights in the same grid row.
 */
export function SchemeCardActions({ scheme }: { scheme: Scheme }) {
  const { t } = useLanguage()

  return (
    <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
      <Button size="sm" className="w-full sm:w-auto" asChild>
        <Link href={`/schemes/${scheme.id}`}>{t('common.viewDetails')}</Link>
      </Button>
      {scheme.officialUrl && (
        <Button size="sm" variant="outline" className="w-full sm:w-auto" asChild>
          <a href={scheme.officialUrl} target="_blank" rel="noreferrer">
            {t('common.officialPortal').replace(/\s*→\s*$/, '')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </Button>
      )}
    </div>
  )
}
