import { pageMetadata } from '@/lib/site-metadata'

export const metadata = pageMetadata({
  title: 'Saved schemes',
  description: 'The schemes you saved to come back to later.',
  path: '/dashboard',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
