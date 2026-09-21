'use client'

import { useMemo, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/language-context'
import { calculateEmi } from '@/lib/finance/emi'

function formatRupees(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

/**
 * General-purpose EMI calculator. Every field is user-entered — see
 * lib/finance/emi.ts's header comment for why nothing here is
 * prefilled with a scheme-specific "typical" rate.
 */
export function EmiCalculator() {
  const { t } = useLanguage()
  const [principal, setPrincipal] = useState('500000')
  const [rate, setRate] = useState('10')
  const [tenureYears, setTenureYears] = useState('5')

  const result = useMemo(() => {
    const p = Number(principal)
    const r = Number(rate)
    const years = Number(tenureYears)
    if (!Number.isFinite(p) || !Number.isFinite(r) || !Number.isFinite(years)) return null
    return calculateEmi(p, r, Math.round(years * 12))
  }, [principal, rate, tenureYears])

  const principalShare = result && result.totalPayment > 0 ? (Number(principal) / result.totalPayment) * 100 : 100

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-elevated">
      <CardHeader>
        <CardTitle className="font-display">{t('emi.title')}</CardTitle>
        <CardDescription>{t('emi.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="space-y-1.5 text-sm">
            <span className="block font-medium text-foreground">{t('emi.principalLabel')}</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              aria-label={t('emi.principalLabel')}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="block font-medium text-foreground">{t('emi.rateLabel')}</span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              aria-label={t('emi.rateLabel')}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="block font-medium text-foreground">{t('emi.tenureLabel')}</span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.5"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              aria-label={t('emi.tenureLabel')}
            />
          </label>
        </div>

        {result ? (
          <div className="space-y-4 rounded-md border border-border bg-secondary/30 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t('emi.monthlyEmi')}</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatRupees(result.emi)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t('emi.totalInterest')}</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatRupees(result.totalInterest)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t('emi.totalPayment')}</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatRupees(result.totalPayment)}</p>
              </div>
            </div>

            <div>
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-border"
                role="img"
                aria-label={t('emi.breakdownAria', {
                  principalPct: Math.round(principalShare),
                  interestPct: Math.round(100 - principalShare),
                })}
              >
                <div className="h-full bg-primary" style={{ width: `${principalShare}%` }} />
                <div className="h-full bg-accent" style={{ width: `${100 - principalShare}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                  {t('emi.legendPrincipal')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
                  {t('emi.legendInterest')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('emi.invalidInputs')}</p>
        )}

        <p className="text-sm leading-relaxed text-muted-foreground">{t('emi.disclaimer')}</p>
      </CardContent>
    </Card>
  )
}
