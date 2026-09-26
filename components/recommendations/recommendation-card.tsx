'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EligibilityStatusBadge, ELIGIBILITY_STATUS_ACCENT } from './eligibility-status-badge'
import { MatchExplanation } from './match-explanation'
import { MatchScoreRing } from './match-score-ring'
import { RecommendationReasoning } from './recommendation-reasoning'
import { SaveSchemeButton } from '@/components/schemes/save-scheme-button'
import { SchemeCardActions } from '@/components/schemes/scheme-card-actions'
import { WhatsAppShareButton } from '@/components/schemes/whatsapp-share-button'
import { DataConfidenceNote } from '@/components/schemes/data-confidence-note'
import { SpeakButton } from '@/components/ui/speak-button'
import { useLanguage } from '@/lib/i18n/language-context'
import { SCHEME_CONTENT_SPEECH_LANG } from '@/lib/i18n/speech-lang'
import { cn } from '@/lib/utils'
import type { SchemeMatchResult } from '@/lib/matching/types'

// One scheme's card on the recommendations list: name, ministry,
// score, status, benefit, summary, official/detail links, plus the
// shared MatchExplanation block (also used on the scheme details
// page) for the matched/missing/failed breakdown. The left accent bar
// and score ring are purely visual — both are derived from the same
// already-computed result the badge and explanation use, nothing new
// is scored or decided here.
export function RecommendationCard({ result }: { result: SchemeMatchResult }) {
  const { t } = useLanguage()
  const { scheme, matchScore, eligibilityStatus } = result

  return (
    <Card
      className={cn(
        'flex flex-col border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated',
        ELIGIBILITY_STATUS_ACCENT[eligibilityStatus]
      )}
    >
      <CardHeader className="space-y-3">
        {/* Row 1: name + score only. The listen/share/save icons used to sit
            in this row too, squeezing the name to a word per line on phones
            ("TREAD / Scheme / for / Women"); they now share row 2 with the
            status badge. */}
        <div className="flex items-start justify-between gap-3">
          {/* min-w-0: same fix as scheme-browser-card.tsx -- without it this
              title column won't shrink below its content's natural width,
              so a long scheme name (or a longer translated string in one
              of the other 11 languages) pushes the match-score circle off
              the card instead of wrapping. */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-foreground">{scheme.name}</h3>
            {scheme.ministry && <p className="mt-0.5 text-xs text-muted-foreground">{scheme.ministry}</p>}
          </div>
          <MatchScoreRing score={matchScore} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <EligibilityStatusBadge status={eligibilityStatus} />
            {scheme.isDemo && <Badge variant="destructive">{t('common.demoSchemeBadge')}</Badge>}
          </div>
          <div className="-mr-2 flex items-center">
            <SpeakButton
              text={[scheme.name, scheme.benefit, scheme.summary].join('. ')}
              lang={SCHEME_CONTENT_SPEECH_LANG}
            />
            <WhatsAppShareButton scheme={scheme} />
            <SaveSchemeButton schemeId={scheme.id} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 text-sm">
        <p className="font-medium text-primary">{scheme.benefit}</p>
        <p className="text-muted-foreground">{scheme.summary}</p>
        <DataConfidenceNote scheme={scheme} />

        <RecommendationReasoning result={result} scheme={scheme} variant="compact" />

        {/* Visually separated from RecommendationReasoning above so its
            own "Why this matches you:" lead-in never reads as a second
            answer to the same question right underneath "Why this
            matched" — MatchExplanation itself is untouched. */}
        <div className="border-t border-border pt-3">
          <MatchExplanation result={result} />
        </div>

        <SchemeCardActions scheme={scheme} />
      </CardContent>
    </Card>
  )
}
