'use client'

import { Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/language-context'

// Compact, honest explanation of how matching actually works — kept
// separate from DisclaimerBanner because it's a different claim: the
// banner says "verify officially," this says "here's specifically
// what did and didn't feed the score you're looking at." Required so
// the extra fields collected in the fuller assessment form (business
// needs, turnover, funding requirement, etc.) never read as if they
// influenced a result they don't currently touch.
export function MethodologyNote({ className }: { className?: string }) {
  const { t } = useLanguage()
  return (
    <div className={cn('flex items-start gap-2 rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground', className)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p>
        <strong className="text-foreground">{t('methodology.title')}</strong>, {t('methodology.body')}
      </p>
    </div>
  )
}
