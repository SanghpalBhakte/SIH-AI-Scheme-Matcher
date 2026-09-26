'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Circle, ExternalLink, MapPin } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/language-context'
import { GENERIC_CHECKLIST_STEPS, type ChecklistStepId } from '@/lib/schemes/checklist'
import { loadPersistedChecklist, savePersistedChecklist } from '@/lib/schemes/checklist-persistence'
import { getDocumentIcon } from '@/lib/schemes/document-icon'
import { CSC_LOCATOR_URL } from '@/lib/schemes/csc-locator'
import { DocumentsChecklistLink } from '@/components/schemes/documents-checklist-link'
import type { Scheme } from '@/lib/matching/types'

// Several schemes in this dataset explicitly route applicants through
// a CSC, a bank branch, or a Lead District Manager rather than a pure
// self-service portal, so CSC_LOCATOR_URL (see lib/schemes/csc-locator.ts
// for sourcing/verification notes) is offered on every scheme's
// checklist below, rather than gated behind a per-scheme flag we'd
// otherwise have to invent. It's also surfaced globally in the site
// header (components/layout/site-header.tsx) — this per-scheme link
// stays too, for anyone who reaches it via a scheme page directly.

/**
 * Per-step guidance. Reads only the scheme's OWN requiredDocuments /
 * applicationSteps fields — never invents scheme-specific content. The
 * real scheme-specific document/step text stays in English (sourced
 * verbatim from official material — see data/schemes.ts); only the
 * generic surrounding guidance and fallback text is translated.
 * Every branch has a real fallback, so no step is ever a dead end
 * even when the dataset doesn't have scheme-specific detail yet.
 */
function StepDetail({ id, scheme, t }: { id: ChecklistStepId; scheme: Scheme; t: (key: string) => string }) {
  switch (id) {
    case 'check-eligibility':
      return <p className="text-sm leading-relaxed text-muted-foreground">{t('checklist.detail.check-eligibility')}</p>

    case 'prepare-documents':
      return scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
        <div className="space-y-1.5">
          <ul className="space-y-1 text-sm">
            {scheme.requiredDocuments.map((doc) => {
              const DocIcon = getDocumentIcon(doc)
              return (
                <li key={doc} className="flex items-start gap-1.5 leading-relaxed text-muted-foreground">
                  <DocIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
                  <span>{doc}</span>
                </li>
              )
            })}
          </ul>
          <DocumentsChecklistLink scheme={scheme} />
        </div>
      ) : scheme.officialChecklistUrl ? (
        <div className="space-y-1.5">
          <p className="text-sm leading-relaxed text-muted-foreground">{t('checklist.detail.prepare-documents-fallback')}</p>
          <DocumentsChecklistLink scheme={scheme} />
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">{t('checklist.detail.prepare-documents-fallback')}</p>
      )

    case 'visit-portal':
      return scheme.officialUrl ? (
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center break-all text-sm font-semibold text-primary underline-offset-4 hover:underline sm:min-h-0"
        >
          {scheme.officialUrl}
        </a>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">{t('checklist.detail.visit-portal-fallback')}</p>
      )

    case 'register-login':
      return <p className="text-sm leading-relaxed text-muted-foreground">{t('checklist.detail.register-login')}</p>

    case 'complete-application':
      return scheme.applicationSteps && scheme.applicationSteps.length > 0 ? (
        <ol className="list-decimal space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground">
          {scheme.applicationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">{t('checklist.detail.complete-application-fallback')}</p>
      )

    case 'upload-documents':
      return <p className="text-sm leading-relaxed text-muted-foreground">{t('checklist.detail.upload-documents')}</p>

    case 'submit-track':
      return <p className="text-sm leading-relaxed text-muted-foreground">{t('checklist.detail.submit-track')}</p>
  }
}

/**
 * A guided, trackable application checklist for one scheme. Built to
 * be reusable (e.g. a future dashboard or saved-schemes area): it
 * takes only `scheme` and owns its own progress state — no wiring
 * beyond that one prop.
 *
 * Progress is persisted to localStorage, keyed per scheme id, via
 * lib/schemes/checklist-persistence.ts — the same isHydrated-safe
 * pattern as lib/schemes/saved-schemes-context.tsx (server render and
 * the client's first paint always start from an empty checklist; a
 * client-only effect restores real stored progress a moment later, so
 * there's no hydration mismatch) and the same versioned,
 * safe-to-discard-on-any-shape-mismatch storage as
 * lib/assessment/persistence.ts. A page refresh no longer starts the
 * checklist over.
 */
export function ApplicationChecklist({ scheme }: { scheme: Scheme }) {
  const { t } = useLanguage()
  const [completed, setCompleted] = useState<ReadonlySet<ChecklistStepId>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)

  // Runs on mount and whenever the scheme changes (this component can
  // be reused across schemes without unmounting) — always resets to
  // that scheme's own persisted progress, or an empty checklist if
  // none is stored, rather than carrying over the previous scheme's
  // state.
  useEffect(() => {
    setCompleted(loadPersistedChecklist(scheme.id) ?? new Set())
    setIsHydrated(true)
  }, [scheme.id])

  function toggle(id: ChecklistStepId) {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      savePersistedChecklist(scheme.id, next)
      return next
    })
  }

  const nextStep = GENERIC_CHECKLIST_STEPS.find((step) => !completed.has(step.id))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{t('checklist.stepsChecked', { done: completed.size, total: GENERIC_CHECKLIST_STEPS.length })}</span>
        {scheme.officialUrl && (
          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline sm:min-h-0"
          >
            {t('checklist.officialPortal')}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}
      </div>

      {nextStep ? (
        <p className="flex items-center gap-1.5 rounded-md bg-secondary/50 p-2.5 text-xs font-medium text-foreground">
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {t('checklist.next', { step: t(`checklist.step.${nextStep.id}`) })}
        </p>
      ) : (
        <p className="rounded-md bg-success/10 p-2.5 text-xs font-medium text-success">{t('checklist.allDone')}</p>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border shadow-soft">
        {GENERIC_CHECKLIST_STEPS.map((step) => {
          const isDone = completed.has(step.id)
          const label = t(`checklist.step.${step.id}`)
          return (
            <li
              key={step.id}
              className={cn('flex gap-3 p-3 transition-colors duration-150', isDone ? 'bg-success/5' : 'hover:bg-secondary/40')}
            >
              <button
                type="button"
                onClick={() => toggle(step.id)}
                // Guards against a click landing in the brief window
                // before the persisted-progress effect has run, which
                // would otherwise toggle against (and then overwrite)
                // state that hasn't finished loading yet.
                disabled={!isHydrated}
                aria-pressed={isDone}
                aria-label={t('checklist.markAs', { label, state: isDone ? t('checklist.notStarted') : t('checklist.completed') })}
                className="-m-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:text-primary active:bg-secondary disabled:pointer-events-none disabled:opacity-50"
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
                ) : (
                  <Circle className="h-5 w-5" aria-hidden />
                )}
              </button>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn('text-sm font-medium', isDone ? 'text-muted-foreground line-through' : 'text-foreground')}>
                    {label}
                  </p>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                      isDone ? 'bg-success/15 text-success' : 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {isDone ? t('checklist.completed') : t('checklist.notStarted')}
                  </span>
                </div>
                <StepDetail id={step.id} scheme={scheme} t={t} />
              </div>
            </li>
          )
        })}
      </ul>

      <a
        href={CSC_LOCATOR_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 rounded-md border border-dashed border-border p-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        {t('checklist.findCscHelp')}
        <ExternalLink className="ml-auto h-3 w-3 shrink-0" aria-hidden />
      </a>

      <p className="text-xs text-muted-foreground">{t('checklist.footerNote')}</p>
    </div>
  )
}
