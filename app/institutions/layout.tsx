import { pageMetadata } from '@/lib/site-metadata'

export const metadata = pageMetadata({
  title: 'Who runs these schemes',
  description: 'The government bodies and corporations that run each scheme, so you know who to contact.',
  path: '/institutions',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
