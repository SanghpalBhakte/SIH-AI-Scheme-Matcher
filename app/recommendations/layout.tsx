import { pageMetadata } from '@/lib/site-metadata'

export const metadata = pageMetadata({
  title: 'Your matches',
  description: 'Your ranked scheme matches, with what matched and what still needs checking.',
  path: '/recommendations',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
