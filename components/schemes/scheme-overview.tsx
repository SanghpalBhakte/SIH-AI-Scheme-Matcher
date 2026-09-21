'use client'

import { Users } from 'lucide-react'

import { describeAudience } from '@/lib/schemes/describe-audience'
import { DataConfidenceNote } from '@/components/schemes/data-confidence-note'
import { SpeakButton } from '@/components/ui/speak-button'
import { useLanguage } from '@/lib/i18n/language-context'
import { SCHEME_CONTENT_SPEECH_LANG } from '@/lib/i18n/speech-lang'
import type { Scheme } from '@/lib/matching/types'

// Plain-language "what this scheme offers, and who it's for" section.
// Reads only the scheme's own fields — no profile, no scoring. The
// generated audience lines (describeAudience) stay in English — see
// lib/i18n/translations.ts's header comment for why data-generated
// text isn't translated this pass, only the static "Who can benefit"
// heading around it.
export function SchemeOverview({ scheme }: { scheme: Scheme }) {
  const { t } = useLanguage()
  const audience = describeAudience(scheme)
  // Read aloud in English regardless of UI locale — same rule as the
  // text itself (see SCHEME_CONTENT_SPEECH_LANG's doc comment): this is
  // the scheme's own name/benefit/summary, never machine-translated.
  const speechText = [scheme.name, scheme.benefit, scheme.summary].join('. ')

  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          {/* min-w-0: same fix as the scheme-name title rows elsewhere --
              a long benefit string (several run 60-80+ characters, e.g.
              "Collateral-free loan up to ...") needs to be able to shrink
              below its own content width to wrap instead of crowding out
              the SpeakButton on narrow phones. */}
          <p className="min-w-0 flex-1 font-medium text-primary">{scheme.benefit}</p>
          <SpeakButton text={speechText} lang={SCHEME_CONTENT_SPEECH_LANG} className="-mt-2 -mr-2" />
        </div>
        <p className="mt-1 text-muted-foreground">{scheme.summary}</p>
        <DataConfidenceNote scheme={scheme} className="mt-2" />
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Users className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {t('schemeDetails.whoCanBenefit')}
        </p>
        <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-muted-foreground">
          {audience.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
