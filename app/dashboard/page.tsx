'use client'

import Link from 'next/link'
import { Bookmark } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecommendationCard } from '@/components/recommendations/recommendation-card'
import { SchemeOverview } from '@/components/schemes/scheme-overview'
import { SaveSchemeButton } from '@/components/schemes/save-scheme-button'
import { useAssessment } from '@/lib/assessment/assessment-context'
import { useSavedSchemes } from '@/lib/schemes/saved-schemes-context'
import { useLanguage } from '@/lib/i18n/language-context'
import { evaluateScheme } from '@/lib/matching/engine'
import { useSchemes } from '@/lib/schemes/live-schemes'
import { deriveSpecialGroups, isProfileComplete } from '@/lib/matching/types'

// Saved schemes now live here (this route was a deliberate
// placeholder before). With a complete profile, a saved scheme gets
// the full RecommendationCard (real match score, reused as-is —
// nothing new is scored). Without one, it falls back to a plain
// SchemeOverview card with a nudge to finish the assessment, rather
// than showing a misleading/absent score.
export default function DashboardPage() {
  const { profile, isHydrated: profileHydrated } = useAssessment()
  const { savedIds, isHydrated: savedHydrated } = useSavedSchemes()
  const { t } = useLanguage()
  const schemes = useSchemes()

  const isHydrated = profileHydrated && savedHydrated
  const savedSchemes = savedIds.map((id) => schemes.find((s) => s.id === id)).filter((s): s is (typeof schemes)[number] => Boolean(s))
  const profileComplete = isHydrated && isProfileComplete(profile)

  if (!isHydrated) {
    return (
      <main className="container flex min-h-[40vh] items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </main>
    )
  }

  return (
    <main className="container flex flex-col gap-6 py-12">
      <div className="space-y-1">
        <h1 className="font-display text-xl font-semibold text-foreground">{t('saved.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('saved.subtitle')}</p>
      </div>

      {savedSchemes.length === 0 ? (
        <Card className="mx-auto w-full max-w-md text-center">
          <CardHeader className="items-center">
            <Bookmark className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
            <CardTitle>{t('saved.emptyTitle')}</CardTitle>
            <CardDescription>{t('saved.emptyBody')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/schemes">{t('saved.browseSchemes')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {!profileComplete && (
            <p className="rounded-md border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
              {t('saved.needsProfile')}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedSchemes.map((scheme) =>
              profileComplete ? (
                <RecommendationCard
                  key={scheme.id}
                  result={evaluateScheme({ ...profile, specialGroups: deriveSpecialGroups(profile) }, scheme)}
                />
              ) : (
                <Card key={scheme.id} className="flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      {/* min-w-0: same fix applied to every other scheme-name
                          title row in this codebase (scheme-browser-card.tsx,
                          recommendation-card.tsx, schemes/[id]/page.tsx). */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold leading-snug text-foreground">{scheme.name}</h3>
                        {scheme.ministry && <p className="mt-0.5 text-xs text-muted-foreground">{scheme.ministry}</p>}
                      </div>
                      <SaveSchemeButton schemeId={scheme.id} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <SchemeOverview scheme={scheme} />
                    <Link
                      href={`/schemes/${scheme.id}`}
                      className="text-xs font-semibold text-foreground underline-offset-4 hover:underline"
                    >
                      {t('common.viewDetails')}
                    </Link>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      )}
    </main>
  )
}
