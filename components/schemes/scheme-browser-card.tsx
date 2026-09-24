'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SaveSchemeButton } from '@/components/schemes/save-scheme-button'
import { DataConfidenceNote } from '@/components/schemes/data-confidence-note'
import { useLanguage } from '@/lib/i18n/language-context'
import type { Scheme } from '@/lib/matching/types'

/**
 * One scheme's card on the standalone browser (app/schemes/page.tsx) —
 * deliberately simpler than RecommendationCard: no match score or
 * eligibility badge, since browsing here never requires an assessment.
 * Shows only the scheme's own data (ministry, categories/sectors,
 * benefit, summary, document count) plus the same save/bookmark and
 * view-details/official-source actions.
 */
export function SchemeBrowserCard({ scheme }: { scheme: Scheme }) {
  const { t } = useLanguage()

  return (
    <Card className="flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          {/* min-w-0 keeps this title column shrinkable to the actual row
              width instead of its own max-content width -- same fix as
              institutions/page.tsx; without it a long scheme.name pushes
              the card a few px past the viewport on the narrowest phones
              before wrapping. */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-foreground">{scheme.name}</h3>
            {scheme.ministry && <p className="mt-0.5 text-xs text-muted-foreground">{scheme.ministry}</p>}
          </div>
          <SaveSchemeButton schemeId={scheme.id} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {scheme.isDemo && <Badge variant="destructive">{t('common.demoSchemeBadge')}</Badge>}
          {[...scheme.categories, ...(scheme.additionalEligibleGenders ?? []).map((g) => (g === 'Woman' ? 'Women' : g))]
            .slice(0, 3)
            .map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 text-sm">
        <p className="font-medium text-primary">{scheme.benefit}</p>
        <p className="text-muted-foreground">{scheme.summary}</p>
        <p className="text-xs text-muted-foreground">
          {scheme.requiredDocuments && scheme.requiredDocuments.length > 0
            ? t('browser.documentsRequired', { count: scheme.requiredDocuments.length })
            : t('browser.documentsUnknown')}
        </p>
        <DataConfidenceNote scheme={scheme} />

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href={`/schemes/${scheme.id}`}
            className="text-xs font-semibold text-foreground underline-offset-4 hover:underline"
          >
            {t('common.viewDetails')}
          </Link>
          {scheme.officialUrl && (
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t('common.officialPortal')}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
