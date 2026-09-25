import type { Metadata } from 'next'
import { schemes } from '@/data/schemes'
import { pageMetadata, SITE_NAME } from '@/lib/site-metadata'

// Gives each scheme page its own tab title and link preview.
// The page itself is a client component, so this lives in a layout.
// `absolute` is needed because the parent /schemes layout sets a plain
// title, which stops the root "%s | SchemeSetu" template reaching here.
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const scheme = schemes.find((s) => s.id === params.id)
  if (!scheme) return { title: { absolute: `Scheme not found | ${SITE_NAME}` } }
  const summary = scheme.summary.length > 160 ? `${scheme.summary.slice(0, 157).trimEnd()}…` : scheme.summary
  return {
    ...pageMetadata({ title: scheme.name, description: summary, path: `/schemes/${scheme.id}` }),
    title: { absolute: `${scheme.name} | ${SITE_NAME}` },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
