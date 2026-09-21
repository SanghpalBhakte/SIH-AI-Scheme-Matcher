'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DisclaimerBanner } from '@/components/layout/disclaimer-banner'
import { MethodologyNote } from '@/components/recommendations/methodology-note'
import { RecommendationsSummary } from '@/components/recommendations/recommendations-summary'
import { LowMatchNotice } from '@/components/recommendations/low-match-notice'
import { RecommendationCard } from '@/components/recommendations/recommendation-card'
import { RecommendationDisclaimer } from '@/components/recommendations/recommendation-disclaimer'
import { StartOverButton } from '@/components/assessment/start-over-button'
import { useAssessment } from '@/lib/assessment/assessment-context'
import { useLanguage } from '@/lib/i18n/language-context'
import { matchSchemes } from '@/lib/matching/engine'
import { useSchemes } from '@/lib/schemes/live-schemes'
import { deriveSpecialGroups, isProfileComplete } from '@/lib/matching/types'

const RESULTS_SHOWN = 3

export default function RecommendationsPage() {
  const { profile, isHydrated } = useAssessment()
  const { t } = useLanguage()
  const schemes = useSchemes()

  // Before the localStorage read completes, `profile` is always the
  // empty default (see assessment-context.tsx) — showing the
  // "finish your assessment" gate at that instant would be wrong for
  // anyone who actually has a complete profile stored from a previous
  // visit. Wait for isHydrated so a refresh never flashes an
  // incorrect message before snapping to the real content.
  if (!isHydrated) {
    return (
      <main className="container flex min-h-[40vh] items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </main>
    )
  }

  // Never score an incomplete draft — a result computed from a value
  // the user never actually chose would be misleading. This also
  // covers navigating here directly (e.g. via the URL) without going
  // through the assessment at all.
  if (!isProfileComplete(profile)) {
    return (
      <main className="container flex flex-col gap-6 py-12">
        <div className="space-y-1">
          <h1 className="font-display text-xl font-semibold text-foreground">{t('recommendations.incompleteTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('recommendations.incompleteSubtitle')}</p>
        </div>
        <DisclaimerBanner />
        <Alert variant="warning">
          <ShieldAlert className="h-4 w-4" aria-hidden />
          <AlertDescription>{t('recommendations.incompleteAlert')}</AlertDescription>
        </Alert>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="w-fit" asChild>
            <Link href="/assessment">
              <ArrowLeft className="h-4 w-4" />
              {t('recommendations.finishAssessment')}
            </Link>
          </Button>
          <Button variant="outline" className="w-fit" asChild>
            <Link href="/assessment#demo-profiles">{t('recommendations.orLoadDemo')}</Link>
          </Button>
          <StartOverButton />
        </div>
      </main>
    )
  }

  // `profile` is now narrowed to a complete profile (engine fields set).
  const allResults = matchSchemes({ ...profile, specialGroups: deriveSpecialGroups(profile) }, schemes)
  const results = allResults.slice(0, RESULTS_SHOWN)
  const hasStrongMatch = results.some(
    (r) => r.eligibilityStatus === 'Likely Eligible' || r.eligibilityStatus === 'Possibly Eligible'
  )

  return (
    <main className="container flex flex-col gap-6 py-12">
      <div className="flex items-start justify-between gap-3">
        {/* min-w-0: defensive, same class of fix as the scheme-card title
            rows -- the title/subtitle here are short in English but some
            of the other 11 translated locales run noticeably longer. */}
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="font-display text-xl font-semibold text-foreground">{t('recommendations.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('recommendations.subtitle')}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Button variant="outline" size="sm" asChild>
            <Link href="/assessment">
              <ArrowLeft className="h-4 w-4" />
              {t('recommendations.backToAssessment')}
            </Link>
          </Button>
          <StartOverButton />
        </div>
      </div>

      <DisclaimerBanner />
      <MethodologyNote />

      <RecommendationsSummary results={results} totalEvaluated={allResults.length} />
      <RecommendationDisclaimer />

      {!hasStrongMatch && <LowMatchNotice />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {results.map((result) => (
          <RecommendationCard key={result.scheme.id} result={result} />
        ))}
      </div>
    </main>
  )
}
