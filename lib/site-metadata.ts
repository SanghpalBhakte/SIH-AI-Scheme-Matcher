import type { Metadata } from 'next'

// Shared bits for page titles and link previews (WhatsApp, LinkedIn, X).
// The preview image itself is app/opengraph-image.tsx.
export const SITE_URL = 'https://sih-ai-scheme-matcher-v2.vercel.app'
export const SITE_NAME = 'SchemeSetu'
export const SITE_DESCRIPTION =
  'Find government schemes you may qualify for, with a clear reason for each match. A Smart India Hackathon prototype (SIH26092) for first-time and marginalised entrepreneurs.'

const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'SchemeSetu: find the government schemes you’re eligible for' }

/**
 * Metadata for one route. A child route's `openGraph` replaces the root
 * one completely, so the preview image and URL are set again here
 * instead of relying on the root layout.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_IN',
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE.url],
    },
  }
}
