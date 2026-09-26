'use client'

import { useLanguage } from '@/lib/i18n/language-context'
import { EmiCalculator } from '@/components/tools/emi-calculator'

export default function EmiCalculatorPage() {
  const { t } = useLanguage()

  return (
    <main className="container flex flex-col gap-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-1 text-center">
        <h1 className="font-display text-xl font-semibold text-foreground">{t('emi.pageTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('emi.pageSubtitle')}</p>
      </div>
      <EmiCalculator />
    </main>
  )
}
