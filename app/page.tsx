'use client'

import Link from 'next/link'
import {
  ArrowRight,
  ClipboardList,
  ScanSearch,
  Sparkles,
  Landmark,
  ShieldCheck,
  ScrollText,
  Scale,
  Users,
  HeartHandshake,
  MapPin,
  Lightbulb,
  Palette,
  Store,
  Gauge,
  BadgeCheck,
  ListChecks,
  Languages,
  Bookmark,
  LayoutGrid,
  Target,
  Compass,
  Briefcase,
  WifiOff,
  Globe2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeroPhoto } from '@/components/landing/hero-photo'
import { HeroPhotoTilt } from '@/components/landing/hero-photo-tilt'
import { ApprovalStamp } from '@/components/landing/approval-stamp'
import { HeroBackdrop } from '@/components/landing/hero-backdrop'
import { LanguageChipStrip } from '@/components/i18n/language-chip-strip'
import { useSchemes } from '@/lib/schemes/live-schemes'
import { useLanguage } from '@/lib/i18n/language-context'
import { LOCALES } from '@/lib/i18n/translations'

const STEPS = [
  { icon: ClipboardList, titleKey: 'landing.step1Title', descKey: 'landing.step1Desc' },
  { icon: ScanSearch, titleKey: 'landing.step2Title', descKey: 'landing.step2Desc' },
  { icon: Sparkles, titleKey: 'landing.step3Title', descKey: 'landing.step3Desc' },
] as const

// "Why it works" — the old 3-item trust row, upgraded into a proper
// 4-card section (trust1-3 reused as-is, trust4 is new — see
// translations.ts). Card, not a thin icon+text row, so it carries the
// same visual weight as "How it works" and "Key features" below it.
const WHY_CARDS = [
  { icon: Scale, titleKey: 'landing.trust1Title', descKey: 'landing.trust1Desc' },
  { icon: ShieldCheck, titleKey: 'landing.trust2Title', descKey: 'landing.trust2Desc' },
  { icon: ScrollText, titleKey: 'landing.trust3Title', descKey: 'landing.trust3Desc' },
  { icon: Sparkles, titleKey: 'landing.trust4Title', descKey: 'landing.trust4Desc' },
] as const

// Grounded in the app's real CATEGORY_OPTIONS/GENDER_OPTIONS values
// (lib/matching/types.ts) and real feature set — not invented personas.
const AUDIENCE = [
  { icon: Users, key: 'landing.audience1' },
  { icon: HeartHandshake, key: 'landing.audience2' },
  { icon: MapPin, key: 'landing.audience3' },
  { icon: Lightbulb, key: 'landing.audience4' },
  { icon: Palette, key: 'landing.audience5' },
  { icon: Store, key: 'landing.audience6' },
] as const

// Every card here maps to a real, shipped feature — nothing aspirational.
const FEATURES = [
  { icon: Gauge, titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
  { icon: BadgeCheck, titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
  { icon: ListChecks, titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
  { icon: Languages, titleKey: 'landing.feature4Title', descKey: 'landing.feature4Desc' },
  { icon: Bookmark, titleKey: 'landing.feature5Title', descKey: 'landing.feature5Desc' },
  { icon: LayoutGrid, titleKey: 'landing.feature6Title', descKey: 'landing.feature6Desc' },
] as const

// "Why SchemeSetu" — direct, honest differentiation against the
// government's own scheme-directory portal (myScheme), for the
// question a judge or a skeptical user will ask sooner or later.
// Every point here maps to a real, shipped capability — see
// SIH_TECH_STACK_QA.md for the fuller reasoning behind each.
const WHY_DIFF = [
  { icon: Target, titleKey: 'landing.why1Title', descKey: 'landing.why1Desc' },
  { icon: Compass, titleKey: 'landing.why2Title', descKey: 'landing.why2Desc' },
  { icon: Briefcase, titleKey: 'landing.why3Title', descKey: 'landing.why3Desc' },
  { icon: WifiOff, titleKey: 'landing.why4Title', descKey: 'landing.why4Desc' },
  { icon: Globe2, titleKey: 'landing.why5Title', descKey: 'landing.why5Desc' },
] as const

/** Small reusable "eyebrow + centered title (+ optional subtitle)" header, used
 *  by every section below the hero for a consistent, calm rhythm. */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-accent-text">{eyebrow}</p>}
      <h2 className="font-display mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

// Native-script names of every supported language, derived from LOCALES
// (the same source the language chip strip below renders from) so this
// list can never drift out of sync as languages are added or removed.
const SUPPORTED_LANGUAGES = LOCALES.map((l) => l.nativeLabel).join(', ')

export default function HomePage() {
  const { t } = useLanguage()
  const schemes = useSchemes()

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-card">
        <HeroBackdrop />
        <div className="container relative z-10 grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8">
          <div className="flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit">
              {t('landing.eyebrow')}
            </Badge>

            {/* Bumped up a size step from the previous 4xl/5xl and given
                tighter tracking — Fraunces was already the right
                display face (see tailwind.config.ts), this just lets
                it actually carry the page the way an editorial serif
                at this weight is meant to, instead of reading like a
                slightly-larger body font. */}
            <h1 className="font-display max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              {t('landing.heroTitle')}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">{t('landing.heroSubtitle')}</p>

            {/* Phone-only placement of the same crossfade used in the
                desktop column below — nested here (between the subtitle
                and the CTAs) rather than left to trail after the
                language chips at the bottom of this column, so it reads
                as part of the hero instead of a stray afterthought.
                lg:hidden removes it entirely at that breakpoint (the
                dedicated desktop instance below takes over); see
                hero-photo.tsx for why each instance is safe to render
                unconditionally without double-fetching. */}
            <div className="mx-auto w-full max-w-[280px] py-1 lg:hidden">
              <HeroPhotoTilt>
                <HeroPhoto
                  sizes="(min-width: 1024px) 0px, 280px"
                  className="animate-fade-in-up relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border shadow-elevated"
                />
                {/* The one signature moment on this page — see
                    approval-stamp.tsx for why an unlabelled stamp
                    rather than a text badge. */}
                <ApprovalStamp className="absolute -right-4 -top-4 z-20 h-20 w-20" />
                <div
                  className="animate-fade-in-up absolute -bottom-3 left-1/2 w-48 -translate-x-1/2 rounded-lg border border-border bg-card/95 px-3 py-2 text-center shadow-elevated backdrop-blur-sm"
                  style={{ animationDelay: '150ms' }}
                >
                  <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                    {t('landing.trust1Title')}
                  </p>
                </div>
              </HeroPhotoTilt>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="group" asChild>
                <Link href="/assessment">
                  {t('landing.ctaStart')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/assessment#demo-profiles">{t('landing.ctaDemo')}</Link>
              </Button>
            </div>

            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t('landing.schemeCount', { count: schemes.length })}
              </span>
              <Link href="/schemes" className="font-medium text-primary underline-offset-4 hover:underline">
                {t('landing.browseAll')}
              </Link>
            </p>

            <LanguageChipStrip />
          </div>

          <div className="hidden lg:block">
            <HeroPhotoTilt className="mx-auto max-w-md">
              <HeroPhoto
                sizes="(min-width: 1024px) 448px, 0px"
                className="animate-fade-in-up relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border shadow-elevated-lg"
              />
              {/* The one signature moment on this page — see
                  approval-stamp.tsx for why an unlabelled stamp rather
                  than a text badge. */}
              <ApprovalStamp className="absolute -right-6 -top-6 z-20 h-28 w-28" />
              <div
                className="animate-fade-in-up absolute -bottom-4 left-1/2 w-56 -translate-x-1/2 rounded-lg border border-border bg-card/95 px-3 py-2 text-center shadow-elevated backdrop-blur-sm"
                style={{ animationDelay: '150ms' }}
              >
                <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
                  {t('landing.trust1Title')}
                </p>
              </div>
            </HeroPhotoTilt>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeader
            eyebrow={t('landing.trustEyebrow')}
            title={t('landing.trustSectionTitle')}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {WHY_CARDS.map((card) => (
              <Card key={card.titleKey} className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
                <CardHeader className="flex-row items-start gap-4 space-y-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <card.icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <div className="space-y-1.5">
                    <CardTitle className="text-base">
                      {card.titleKey === 'landing.trust2Title' ? t(card.titleKey, { count: schemes.length }) : t(card.titleKey)}
                    </CardTitle>
                    <CardDescription>{t(card.descKey)}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-16 sm:py-20">
        <div className="container">
          <SectionHeader eyebrow="" title={t('landing.howItWorks')} />
          {/* The only card grid on this page that becomes a numbered,
              connected path instead — because this is the one section
              where the numbers mean something (a real 3-step sequence),
              unlike the icon grids below it (trust reasons, audience,
              features, differentiators) which aren't sequences and
              stay plain grids on purpose. A dashed thread rather than a
              solid line, echoing the hero photo's own subject (people
              who work with textiles, weaving, embroidery). */}
          <ol className="relative grid grid-cols-1 gap-8 border-l-2 border-dashed border-accent/40 pl-9 sm:grid-cols-3 sm:gap-x-6 sm:border-l-0 sm:border-t-2 sm:pl-0 sm:pt-9">
            {STEPS.map((step, i) => (
              <li key={step.titleKey} className="relative sm:text-center">
                <div className="absolute -left-[42px] top-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-background font-display text-sm font-semibold text-accent shadow-soft sm:-top-[38px] sm:left-1/2 sm:-translate-x-1/2">
                  {i + 1}
                </div>
                <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:gap-2">
                  <step.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0 sm:h-6 sm:w-6" aria-hidden />
                  <div>
                    {/* Every locale's landing.stepNTitle starts with its
                        own leading numeral + ". " (see translations.ts) —
                        that made sense when the number lived only in the
                        copy, but now the numbered badge carries it, so
                        strip the one token before the first ". " rather
                        than showing the same number twice. */}
                    <p className="text-base font-semibold text-foreground">{t(step.titleKey).replace(/^\S+\.\s*/, '')}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(step.descKey)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeader eyebrow={t('landing.audienceEyebrow')} title={t('landing.audienceTitle')} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {AUDIENCE.map((item) => (
              <div
                key={item.key}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-5 text-center shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <item.icon className="h-6 w-6 text-primary" aria-hidden />
                <p className="text-sm font-medium text-foreground">{t(item.key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-16 sm:py-20">
        <div className="container">
          <SectionHeader eyebrow={t('landing.featuresEyebrow')} title={t('landing.featuresTitle')} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card
                key={feature.titleKey}
                className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
                    <feature.icon className="h-5 w-5 text-accent" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{t(feature.titleKey)}</CardTitle>
                  <CardDescription>
                    {t(feature.descKey, { count: LOCALES.length, languages: SUPPORTED_LANGUAGES })}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeader
            eyebrow={t('landing.whyEyebrow')}
            title={t('landing.whyTitle')}
            subtitle={t('landing.whySubtitle')}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_DIFF.map((item) => (
              <Card
                key={item.titleKey}
                className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
                    <item.icon className="h-5 w-5 text-accent" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{t(item.titleKey)}</CardTitle>
                  <CardDescription>{t(item.descKey)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            {t('landing.whyHonestNote', { count: schemes.length })}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20">
        <HeroBackdrop variant="dark" />
        <div className="container relative z-10 flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t('landing.ctaBandTitle')}</h2>
          <p className="max-w-xl text-sm text-primary-foreground/85 sm:text-base">{t('landing.ctaBandSubtitle')}</p>
          <Button size="lg" variant="secondary" className="group mt-2" asChild>
            <Link href="/assessment">
              {t('landing.ctaBandButton')}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
