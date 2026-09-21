'use client'

import { Award, ListChecks, AlertCircle, CheckCircle2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/language-context'
import type { SchemeMatchResult } from '@/lib/matching/types'

// At-a-glance summary strip: how many schemes are shown, the
// strongest one, and whether anything shown still needs more
// information to judge confidently. Reads only from already-computed
// SchemeMatchResult objects — no new scoring happens here.
export function RecommendationsSummary({
  results,
  totalEvaluated,
}: {
  results: SchemeMatchResult[]
  totalEvaluated: number
}) {
  const { t } = useLanguage()
  const strongest = results[0]
  const needsMoreInfoCount = results.filter((r) => r.missingCriteria.length > 0).length

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <ListChecks className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('recommendations.schemesShown')}</p>
            <p className="text-sm font-semibold text-foreground">
              {t('recommendations.schemesShownDetail', { shown: results.length, total: totalEvaluated })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/15">
            <Award className="h-5 w-5 text-accent" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t('recommendations.strongestMatch')}</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {strongest ? `${strongest.scheme.name} · ${strongest.matchScore}%` : '—'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
        <CardContent className="flex items-center gap-3 p-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
              needsMoreInfoCount > 0 ? 'bg-warning/15' : 'bg-success/15'
            )}
          >
            {needsMoreInfoCount > 0 ? (
              <AlertCircle className="h-5 w-5 text-warning" aria-hidden />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('recommendations.missingInfo')}</p>
            <p className={cn('text-sm font-semibold text-foreground')}>
              {needsMoreInfoCount > 0
                ? needsMoreInfoCount === 1
                  ? t('recommendations.needsMoreInfoOne')
                  : t('recommendations.needsMoreInfoMany', { count: needsMoreInfoCount })
                : t('recommendations.noneShown')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
