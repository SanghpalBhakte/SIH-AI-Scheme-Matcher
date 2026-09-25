import { pageMetadata } from '@/lib/site-metadata'

export const metadata = pageMetadata({
  title: 'All schemes',
  description: 'Search and filter every government scheme in SchemeSetu. Each one links to its official page.',
  path: '/schemes',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
