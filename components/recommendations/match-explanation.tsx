'use client'

import { Check, ChevronDown } from 'lucide-react'

import { CriteriaList } from './criteria-list'
import { summarizeMatch } from '@/lib/recommendations/explain'
import { useLanguage } from '@/lib/i18n/language-context'
import type { SchemeMatchResult } from '@/lib/matching/types'

const TOP_MATCHED_LIMIT = 3

/**
 * The shared "why did this scheme score this way" explanation block —
 * used on both the recommendations list (RecommendationCard) and the
 * scheme details page, so the two never drift out of sync on wording
 * or structure. Reads only from an already-computed SchemeMatchResult
 * (lib/matching/engine.ts); it never recomputes or re-weighs anything.
 *
 * Structure:
 *  - always visible: a one-line "why", and the top matched criteria
 *  - always visible (when non-empty, so nothing the user needs to act
 *    on is hidden): "Needs verification" and "Not aligned"
 *  - progressive disclosure: any matched criteria beyond the top 3
 *    (most high-scoring schemes match on all 7 — showing all of them
 *    by default would bury the one-line "why" in a wall of text)
 */
export function MatchExplanation({ result }: { result: SchemeMatchResult }) {
  const { t } = useLanguage()
  const { matchedCriteria, missingCriteria, failedCriteria } = result
  const topMatches = matchedCriteria.slice(0, TOP_MATCHED_LIMIT)
  const remainingMatches = matchedCriteria.slice(TOP_MATCHED_LIMIT)

  return (
    <div className="space-y-3 text-sm">
      <p className="rounded-md border-l-2 border-primary bg-secondary/50 p-2.5 leading-relaxed text-foreground">
        <span className="font-semibold">{t('matchExplanation.why')} </span>
        {summarizeMatch(result)}
      </p>

      {topMatches.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 font-semibold text-success">
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('criteria.matched')}
          </p>
          <ul className="mt-1.5 space-y-1 pl-0.5 leading-relaxed text-muted-foreground">
            {topMatches.map((c) => (
              <li key={c.key} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" aria-hidden />
                {c.label}
              </li>
            ))}
          </ul>
          {remainingMatches.length > 0 && (
            <details className="group mt-1.5">
              <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1 font-medium sm:min-h-0 text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline">
                {t('matchExplanation.moreMatched', { count: remainingMatches.length })}
                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="mt-1.5 space-y-1 pl-0.5 leading-relaxed text-muted-foreground">
                {remainingMatches.map((c) => (
                  <li key={c.key} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-success" aria-hidden />
                    {c.label}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <CriteriaList tone="missing" items={missingCriteria} />
      <CriteriaList tone="failed" items={failedCriteria} />
    </div>
  )
}
