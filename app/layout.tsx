import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Self-hosted fonts (no external font-CDN request at runtime or build
// time — @fontsource ships the actual font files in the package).
// Only the specific weights actually used are imported, so the
// browser only ever fetches the unicode-range subsets a page needs.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'

import './globals.css'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { SkipToContentLink } from '@/components/layout/skip-to-content-link'
import { ChatWidget } from '@/components/chat/chat-widget'
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import { AssessmentProvider } from '@/lib/assessment/assessment-context'
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/lib/theme/theme-context'
import { LanguageProvider } from '@/lib/i18n/language-context'
import { SavedSchemesProvider } from '@/lib/schemes/saved-schemes-context'
import { SchemesProvider } from '@/lib/schemes/live-schemes'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site-metadata'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | SIH26092`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  // The preview image comes from app/opengraph-image.tsx.
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    title: `${SITE_NAME} | SIH26092`,
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | SIH26092`,
    description: SITE_DESCRIPTION,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
}

export const viewport = {
  themeColor: '#19763b',
}

// Only mount Vercel observability components when actually running on
// Vercel infrastructure. Both packages are no-ops in other environments
// by design, but @vercel/speed-insights can throw
// "Cannot read properties of undefined (reading 'startTime')" in
// non-Vercel runtimes (e.g. local dev, Netlify, raw Node) because the
// PerformanceEntry objects it expects may not be present. Gating on
// VERCEL prevents that crash without removing the components from
// production builds.
const isVercel = process.env.VERCEL === '1'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is required here because the inline
    // script below sets the `dark` class on this element before React
    // hydrates — React would otherwise warn about an attribute it
    // didn't render itself. Nothing else about this element is
    // affected; see lib/theme/theme-context.tsx for the full
    // reasoning.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before first paint so the correct theme is already
            applied — no flash of the wrong theme. Static app string,
            not user data. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <SchemesProvider>
            <LanguageProvider>
              <SavedSchemesProvider>
                <AssessmentProvider>
                  <SkipToContentLink />

                  <SiteHeader />

                  <div id="main-content" className="flex-1">{children}</div>

                  <SiteFooter />

                  {/* Phones only: labelled bottom navigation (see mobile-tab-bar.tsx). */}
                  <MobileTabBar />

                  {/* App-wide floating assistant — see components/chat/chat-widget.tsx.
                      Mounted here (inside AssessmentProvider, outside <main>) so it reads
                      live profile state and persists across route changes without
                      affecting any page's own layout or scroll. */}
                  <ChatWidget />
                  <ServiceWorkerRegistration />
                  {/* Vercel Speed Insights — reports real-user Core Web Vitals.
                      Gated on VERCEL env var to prevent the
                      "startTime of undefined" PerformanceEntry crash that
                      occurs when the package runs outside Vercel infrastructure. */}
                  {isVercel && <SpeedInsights />}
                  {/* Vercel Web Analytics — same gate: only activates on
                      Vercel edge; no-op and no config anywhere else. */}
                  {isVercel && <Analytics />}
                </AssessmentProvider>
              </SavedSchemesProvider>
            </LanguageProvider>
          </SchemesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
