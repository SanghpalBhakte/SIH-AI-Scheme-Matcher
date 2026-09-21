'use client'

import { useMemo, useState } from 'react'

import { SearchX } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DisclaimerBanner } from '@/components/layout/disclaimer-banner'
import { SchemeBrowserCard } from '@/components/schemes/scheme-browser-card'
import { useLanguage } from '@/lib/i18n/language-context'
import { useSchemes } from '@/lib/schemes/live-schemes'

// Standalone catalog of every scheme — no assessment required. Filter
// option sets are derived from the dataset itself rather than reusing
// CATEGORY_OPTIONS/SECTOR_OPTIONS (lib/matching/types.ts), because
// scheme data contains values like "Woman"/"Any" that aren't part of
// those stricter assessment-form option lists. Computed via useMemo
// (not a module-level constant) since the dataset itself can now
// upgrade from static to live after mount — see lib/schemes/live-schemes.tsx.

export default function SchemesBrowserPage() {
  const { t } = useLanguage()
  const schemes = useSchemes()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sector, setSector] = useState('')

  const allCategories = useMemo(() => Array.from(new Set(schemes.flatMap((s) => s.categories))).sort(), [schemes])
  const allSectors = useMemo(() => Array.from(new Set(schemes.flatMap((s) => s.sectors))).sort(), [schemes])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return schemes.filter((scheme) => {
      const matchesQuery =
        q.length === 0 ||
        scheme.name.toLowerCase().includes(q) ||
        scheme.ministry?.toLowerCase().includes(q) ||
        scheme.summary.toLowerCase().includes(q)
      const matchesCategory = category === '' || scheme.categories.includes(category)
      const matchesSector = sector === '' || scheme.sectors.includes(sector)
      return matchesQuery && matchesCategory && matchesSector
    })
  }, [schemes, search, category, sector])

  const hasActiveFilters = search !== '' || category !== '' || sector !== ''

  function clearFilters() {
    setSearch('')
    setCategory('')
    setSector('')
  }

  return (
    <main className="container flex flex-col gap-6 py-12">
      <div className="space-y-1">
        <h1 className="font-display text-xl font-semibold text-foreground">{t('browser.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('browser.subtitle', { count: schemes.length })}</p>
      </div>

      <DisclaimerBanner />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('browser.searchPlaceholder')}
          aria-label={t('browser.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('common.allCategories')} className="sm:max-w-[180px]">
          <option value="">{t('common.allCategories')}</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={sector} onChange={(e) => setSector(e.target.value)} aria-label={t('common.allSectors')} className="sm:max-w-[180px]">
          <option value="">{t('common.allSectors')}</option>
          {allSectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="w-fit" onClick={clearFilters}>
            {t('common.clearFilters')}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t('browser.showingCount', { shown: filtered.length, total: schemes.length })}</p>

      {filtered.length === 0 ? (
        <Card className="mx-auto w-full max-w-md text-center">
          <CardHeader className="items-center">
            <SearchX className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
            <CardTitle>{t('common.noResults')}</CardTitle>
          </CardHeader>
          {hasActiveFilters && (
            <CardContent>
              <Button variant="outline" onClick={clearFilters}>
                {t('common.clearFilters')}
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme) => (
            <SchemeBrowserCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </main>
  )
}
