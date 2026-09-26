'use client'

import { ChevronDown } from 'lucide-react'

import { MatchLabelBadge } from './match-label-badge'
import { useLanguage } from '@/lib/i18n/language-context'
import {
  deriveMatchReasons,
  deriveVerificationNotes,
  VERIFICATION_NOTE_I18N_KEY,
} from '@/lib/recommendations/reasoning'
import { cn } from '@/lib/utils'
import type { Scheme, SchemeMatchResult } from '@/lib/matching/types'

const VISIBLE_REASON_LIMIT = 2

/**
 * The "Recommendation Reasoning & Verification" layer — reads only an
 * already-computed SchemeMatchResult and the scheme's own fields, same
 * discipline as MatchExplanation (never recomputes or re-weighs
 * anything). Two variants:
 *
 *  - "compact" (RecommendationCard): match label + up to 2 reason
 *    chips, with a "Why this matched" expand/collapse for anything
 *    beyond that (extra reasons + the verify-before-applying section,
 *    when one applies) — kept deliberately small so the card doesn't
 *    get overloaded on top of its existing MatchExplanation block.
 *  - "full" (scheme detail page): the same content, always expanded —
 *    there's room for it there, and the task asks for the complete
 *    section on that page.
 *
 * Note: this intentionally does NOT re-render Scheme.dataConfidenceNote
 * — that's already shown as its own distinct block wherever this
 * component is used (DataConfidenceNote in RecommendationCard's
 * CardContent, and inside SchemeOverview on the detail page), so
 * showing it a second time here would duplicate it rather than keep it
 * "distinct," which is what requirement B actually asks for.
 */
export function RecommendationReasoning({
  result,
  scheme,
  variant = 'compact',
  className,
}: {
  result: SchemeMatchResult
  scheme: Scheme
  variant?: 'compact' | 'full'
  className?: string
}) {
  const { t } = useLanguage()
  const reasons = deriveMatchReasons(result)
  const verificationNotes = deriveVerificationNotes(result, scheme)

  const visibleReasons = variant === 'full' ? reasons : reasons.slice(0, VISIBLE_REASON_LIMIT)
  const hiddenReasons = variant === 'full' ? [] : reasons.slice(VISIBLE_REASON_LIMIT)
  const hasMoreToExpand = hiddenReasons.length > 0 || verificationNotes.length > 0

  const reasonChips = (items: string[]) => (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((reason) => (
        <li key={reason} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
          {reason}
        </li>
      ))}
    </ul>
  )

  const verifySection = verificationNotes.length > 0 && (
    <div className="space-y-1 rounded-md border border-warning/30 bg-warning/5 p-2.5">
      <p className="text-xs font-semibold text-foreground">{t('reasoning.verifyTitle')}</p>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {verificationNotes.map((key) => (
          <li key={key} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" aria-hidden />
            {t(VERIFICATION_NOTE_I18N_KEY[key])}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className={cn('space-y-2 text-sm', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <MatchLabelBadge result={result} />
        <p className="text-xs font-semibold text-foreground">{t('reasoning.whyTitle')}</p>
      </div>

      {visibleReasons.length > 0 ? reasonChips(visibleReasons) : (
        <p className="text-xs text-muted-foreground">{t('reasoning.fallback')}</p>
      )}

      {variant === 'compact' ? (
        hasMoreToExpand && (
          <details className="group">
            <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1 text-xs font-medium sm:min-h-0 text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline">
              {t('reasoning.expandMore')}
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-open:rotate-180" aria-hidden />
            </summary>
            <div className="mt-1.5 space-y-2">
              {hiddenReasons.length > 0 && reasonChips(hiddenReasons)}
              {verifySection}
            </div>
          </details>
        )
      ) : (
        verifySection
      )}
    </div>
  )
}
