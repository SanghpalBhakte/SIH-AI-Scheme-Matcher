'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ExternalLink, FileText, MapPin, Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DisclaimerBanner } from '@/components/layout/disclaimer-banner'
import { EligibilityStatusBadge } from '@/components/recommendations/eligibility-status-badge'
import { MatchScoreRing } from '@/components/recommendations/match-score-ring'
import { MatchExplanation } from '@/components/recommendations/match-explanation'
import { RecommendationReasoning } from '@/components/recommendations/recommendation-reasoning'
import { RecommendationDisclaimer } from '@/components/recommendations/recommendation-disclaimer'
import { SchemeOverview } from '@/components/schemes/scheme-overview'
import { ApplicationChecklist } from '@/components/schemes/application-checklist'
import { SaveSchemeButton } from '@/components/schemes/save-scheme-button'
import { WhatsAppShareButton } from '@/components/schemes/whatsapp-share-button'
import { DocumentsChecklistLink } from '@/components/schemes/documents-checklist-link'
import { EmiCalculatorButton } from '@/components/schemes/emi-calculator-button'
import { CscLocatorButton } from '@/components/schemes/csc-locator-button'
import { useAssessment } from '@/lib/assessment/assessment-context'
import { useLanguage } from '@/lib/i18n/language-context'
import { evaluateScheme } from '@/lib/matching/engine'
import { useSchemes } from '@/lib/schemes/live-schemes'
import { isProfileComplete, toEngineProfile } from '@/lib/matching/types'
import { getInstitutionForScheme } from '@/lib/institutions/directory'
import { isLoanBased } from '@/lib/finance/emi'

// Quick actions as one row of equal-width tiles (icon over a short,
// wrapping label) at every width. As inline buttons they wrapped into a
// ragged 3 + 1 on desktop and a 4-row stack on phones.
const QUICK_ACTION_TILE =
  'h-auto min-h-[4.25rem] w-full flex-col gap-1 whitespace-normal px-1 py-2 text-center text-xs leading-tight sm:text-sm'

// Continues the explanation started on /recommendations for a single
// scheme. This route needs the in-progress assessment profile (React
// Context) to compute "why this matches you," which is only available
// to Client Components — hence 'use client' here, unlike the earlier
// placeholder version of this page.
//
// The id comes from useParams() rather than the `params` prop: in
// Next.js 15 page props' `params` is a Promise, while useParams() works
// the same in a Client Component on Next 14 and 15.
export default function SchemeDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { profile, isHydrated } = useAssessment()
  const { t } = useLanguage()
  const schemes = useSchemes()
  const scheme = schemes.find((s) => s.id === id)

  if (!scheme) {
    return (
      <main className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">{t('schemeDetails.notFoundTitle')}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t('schemeDetails.notFoundBody')}</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/recommendations">
            <ArrowLeft className="h-4 w-4" />
            {t('schemeDetails.backToRecommendations')}
          </Link>
        </Button>
      </main>
    )
  }

  // Only compute a match once hydration has checked for a stored
  // profile AND that profile is complete — scoring against the
  // still-empty default profile that's in place before hydration
  // finishes would incorrectly flash "finish your assessment" for
  // someone who actually has a complete profile stored from a
  // previous visit (see assessment-context.tsx's isHydrated). See
  // lib/matching/types.ts's isProfileComplete for what "complete"
  // means (the 6 hard-required fields; income stays optional).
  const profileComplete = isHydrated && isProfileComplete(profile)
  const result = profileComplete ? evaluateScheme(toEngineProfile(profile), scheme) : null
  const institution = getInstitutionForScheme(scheme.id)
  const loanBased = isLoanBased(scheme)

  return (
    <main className="container flex flex-col gap-6 py-8 sm:py-12">
      <Button variant="outline" size="sm" className="w-fit" asChild>
        <Link href="/recommendations">
          <ArrowLeft className="h-4 w-4" />
          {t('schemeDetails.backToRecommendations')}
        </Link>
      </Button>

      <Card className="mx-auto w-full max-w-2xl shadow-elevated">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            {/* min-w-0: same fix as scheme-browser-card.tsx / recommendation-card.tsx --
                keeps the title shrinkable so it wraps instead of pushing the
                match-score circle off the card on narrow phones. */}
            <div className="min-w-0 flex-1">
              {/* The page's one h1 (CardTitle renders an h3). Same classes as CardTitle. */}
              <h1 className="font-display text-lg font-semibold leading-none tracking-tight">{scheme.name}</h1>
              {scheme.ministry && <CardDescription>{scheme.ministry}</CardDescription>}
            </div>
            {result && <MatchScoreRing score={result.matchScore} />}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {result && <EligibilityStatusBadge status={result.eligibilityStatus} />}
            {scheme.isDemo && <Badge variant="destructive">{t('common.demoSchemeBadge')}</Badge>}
          </div>

          <div className="flex flex-col items-start gap-3 pt-1">
            {/* The scheme's main next step, so a real button (full width on
                phones), not a text link. */}
            {scheme.officialUrl ? (
              <Button className="w-full sm:w-auto" asChild>
                <a href={scheme.officialUrl} target="_blank" rel="noreferrer">
                  {t('common.officialPortal').replace(/\s*→\s*$/, '')}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">{t('schemeDetails.noOfficialLink')}</p>
            )}
            {/* One row of equal-width icon-over-label tiles (3 or 4,
                depending on whether EMI applies). */}
            <div className="grid w-full auto-cols-fr grid-flow-col gap-2">
              {/* EMI Calculator and CSC help used to be a small text
                  link buried a section down (EMI) or only reachable
                  from the header's Tools menu (both) — real buttons
                  here, same weight as Share/Save, so they're visible
                  the moment someone opens a scheme that needs them.
                  EMI only makes sense for loan-based schemes; CSC help
                  ("someone can walk you through any application in
                  person") applies to every scheme. */}
              {loanBased && <EmiCalculatorButton variant="label" className={QUICK_ACTION_TILE} />}
              <CscLocatorButton variant="label" className={QUICK_ACTION_TILE} />
              <WhatsAppShareButton scheme={scheme} variant="label" className={QUICK_ACTION_TILE} />
              <SaveSchemeButton schemeId={scheme.id} variant="label" className={QUICK_ACTION_TILE} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <DisclaimerBanner />

          <section className="space-y-3 rounded-md border border-border bg-secondary/30 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t('schemeDetails.quickRefTitle')}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">{t('schemeDetails.quickRefDocs')}</p>
                  <DocumentsChecklistLink scheme={scheme} />
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">{t('schemeDetails.quickRefWhere')}</p>
                  {scheme.officialUrl ? (
                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center break-all text-xs font-semibold text-primary underline-offset-4 hover:underline sm:min-h-0"
                    >
                      {scheme.officialUrl}
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t('schemeDetails.noOfficialLink')}</p>
                  )}
                </div>
              </div>
              {institution && (
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t('schemeDetails.quickRefAdministeredBy')}</p>
                    <Link href="/institutions" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary underline-offset-4 hover:underline sm:min-h-0">
                      {institution.name}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-2 border-t border-border pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t('schemeDetails.overview')}</h2>
            <SchemeOverview scheme={scheme} />
          </section>

          <section className="space-y-2 border-t border-border pt-4">
            {/* Heading intentionally isn't "Why this matches you" — MatchExplanation
                already opens with that exact phrase inline, and repeating it as the
                section heading directly above it read as duplicate messaging. */}
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t('schemeDetails.matchExplanation')}</h2>
            {!isHydrated ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : result ? (
              <MatchExplanation result={result} />
            ) : (
              <Alert variant="warning">
                <AlertDescription className="flex flex-col gap-2">
                  <span>{t('schemeDetails.finishToSeeMatch')}</span>
                  <Button size="sm" className="w-fit" asChild>
                    <Link href="/assessment">{t('recommendations.finishAssessment')}</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </section>

          {/* Only rendered when a real SchemeMatchResult exists (a
              completed assessment profile) — never shown for a direct
              browse with no profile, so this can never claim a match
              that wasn't actually computed (see app-level requirement
              on not misrepresenting a direct browse as a match). */}
          {result && (
            <section className="space-y-2 border-t border-border pt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t('reasoning.whyTitle')}</h2>
              <RecommendationReasoning result={result} scheme={scheme} variant="full" />
              <RecommendationDisclaimer className="pt-1" />
            </section>
          )}

          <section className="space-y-2 border-t border-border pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t('schemeDetails.applicationChecklist')}</h2>
            <p className="text-xs text-muted-foreground">{t('schemeDetails.checklistIntro')}</p>
            <ApplicationChecklist scheme={scheme} />
          </section>
        </CardContent>
      </Card>
    </main>
  )
}
