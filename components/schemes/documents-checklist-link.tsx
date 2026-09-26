'use client'

import { useState } from 'react'
import { Download, ExternalLink, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/language-context'
import { downloadRequiredDocumentsPdf } from '@/lib/schemes/documents-pdf'
import type { Scheme } from '@/lib/matching/types'

/**
 * Renders the "Documents needed" quick-ref row's value. Three cases,
 * in priority order — never more than one is true for a given scheme:
 *
 * 1. scheme.requiredDocuments is real, sourced data (see
 *    data/schemes.ts) — render a clickable control that generates and
 *    downloads a PDF of exactly those items (lib/schemes/documents-pdf.ts).
 *    The PDF can never say more than the dataset already verified.
 * 2. scheme.officialChecklistUrl — SchemeSetu confirmed an official
 *    checklist file exists but couldn't itself read its contents (see
 *    the type's own doc comment). Link straight to the real file
 *    instead of guessing what it says.
 * 3. Neither — the existing honest "not catalogued yet" fallback.
 */
export function DocumentsChecklistLink({ scheme, className }: { scheme: Scheme; className?: string }) {
  const { t } = useLanguage()
  const [isGenerating, setIsGenerating] = useState(false)

  if (scheme.requiredDocuments && scheme.requiredDocuments.length > 0) {
    const count = scheme.requiredDocuments.length
    return (
      <button
        type="button"
        disabled={isGenerating}
        onClick={async () => {
          setIsGenerating(true)
          try {
            await downloadRequiredDocumentsPdf(scheme)
          } finally {
            setIsGenerating(false)
          }
        }}
        aria-label={`${t('browser.documentsRequired', { count })}, ${t('schemeDetails.quickRefDocsDownloadPdf')}`}
        className={cn(
          'inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-60 sm:min-h-0',
          className
        )}
      >
        {isGenerating ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Download className="h-3 w-3 shrink-0" aria-hidden />
        )}
        <span>
          {t('browser.documentsRequired', { count })} · {t('schemeDetails.quickRefDocsDownloadPdf')}
        </span>
      </button>
    )
  }

  if (scheme.officialChecklistUrl) {
    return (
      <a
        href={scheme.officialChecklistUrl}
        target="_blank"
        rel="noreferrer"
        className={cn('inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline sm:min-h-0', className)}
      >
        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
        {t('schemeDetails.quickRefDocsOfficialChecklist')}
      </a>
    )
  }

  return <p className={cn('text-xs text-muted-foreground', className)}>{t('schemeDetails.quickRefDocsUnknown')}</p>
}
