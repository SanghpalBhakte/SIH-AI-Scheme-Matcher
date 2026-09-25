import { pageMetadata } from '@/lib/site-metadata'

export const metadata = pageMetadata({
  title: 'EMI calculator',
  description: 'Estimate the monthly instalment for a business loan.',
  path: '/emi-calculator',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
