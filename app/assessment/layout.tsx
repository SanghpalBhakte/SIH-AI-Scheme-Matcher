import { pageMetadata } from '@/lib/site-metadata'

export const metadata = pageMetadata({
  title: 'Check your eligibility',
  description: 'Answer a few questions about you and your business to see which government schemes you may qualify for.',
  path: '/assessment',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
