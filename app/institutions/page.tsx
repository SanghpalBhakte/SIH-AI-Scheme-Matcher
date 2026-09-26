'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2, ExternalLink, SearchX } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/i18n/language-context'
import { getInstitutionDirectory } from '@/lib/institutions/directory'

// A directory of who actually runs each scheme, browsable by
// institution instead of by scheme. Deliberately NOT a bank/NBFC
// branch locator: this app has no real branch-level dataset (location,
// contact, live fund status) to plug in, and inventing one would
// violate the same no-fabrication rule the rest of this codebase
// follows for scheme data (see data/schemes.ts). Every entry here is
// derived straight from data/schemes.ts's own ministry/officialUrl
// fields (lib/institutions/directory.ts) — nothing is typed in fresh
// for this page, so it can't drift out of sync with the scheme data.
const INSTITUTIONS = getInstitutionDirectory()

export default function InstitutionsPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q.length === 0) return INSTITUTIONS
    return INSTITUTIONS.filter(
      (inst) =>
        inst.name.toLowerCase().includes(q) ||
        inst.parentMinistry?.toLowerCase().includes(q) ||
        inst.schemes.some((s) => s.name.toLowerCase().includes(q))
    )
  }, [search])

  return (
    <main className="container flex flex-col gap-6 py-8 sm:py-12">
      <div className="space-y-1">
        <h1 className="font-display text-xl font-semibold text-foreground">{t('institutions.title')}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t('institutions.subtitle')}</p>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('institutions.searchPlaceholder')}
        aria-label={t('institutions.searchPlaceholder')}
        className="sm:max-w-sm"
      />

      <p className="text-xs text-muted-foreground">
        {t('institutions.showingCount', { shown: filtered.length, total: INSTITUTIONS.length })}
      </p>

      {filtered.length === 0 ? (
        <Card className="mx-auto w-full max-w-md text-center">
          <CardHeader className="items-center">
            <SearchX className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
            <CardTitle>{t('common.noResults')}</CardTitle>
          </CardHeader>
          {search !== '' && (
            <CardContent>
              <Button variant="outline" onClick={() => setSearch('')}>
                {t('common.clearFilters')}
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inst) => (
            <Card key={inst.officialUrl} className="flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" aria-hidden />
                </div>
                {/* min-w-0 is required here: this div is a flex sibling of the
                    shrink-0 icon box, so without it the browser sizes it to
                    its content's max-content width (the institution name's
                    widest unbroken word) instead of the actual remaining
                    row width, pushing the card wider than the viewport on
                    phones before the long name gets a chance to wrap. */}
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="text-sm leading-snug">{inst.name}</CardTitle>
                  {inst.parentMinistry && <CardDescription className="text-xs">{inst.parentMinistry}</CardDescription>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {inst.schemes.map((s) => (
                    <Link key={s.id} href={`/schemes/${s.id}`} className="inline-flex min-h-11 items-center sm:min-h-0">
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/70">
                        {s.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
                <a
                  href={inst.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto flex min-h-11 w-fit items-center gap-1.5 text-xs font-semibold text-primary underline-offset-4 hover:underline sm:min-h-0"
                >
                  {t('common.officialPortal')}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
