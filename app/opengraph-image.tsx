import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { schemes } from '@/data/schemes'

// The picture that shows up when someone shares a SchemeSetu link.
// Built once at build time from the same fonts and colours as the site.
export const alt = 'SchemeSetu: find the government schemes you’re eligible for'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const font = (pkg: string, file: string) => readFile(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file))

export default async function OpengraphImage() {
  const [fraunces, inter, interBold] = await Promise.all([
    font('fraunces', 'fraunces-latin-700-normal.woff'),
    font('inter', 'inter-latin-400-normal.woff'),
    font('inter', 'inter-latin-600-normal.woff'),
  ])
  const green = '#19763b'
  const gold = '#d18f1f'
  const ink = '#181e2a'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#faf8f5',
          color: ink,
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="6" fill={green} />
            <path d="M16 6l10 5v2H6v-2l10-5z" fill="#fff" />
            <rect x="8" y="14" width="3" height="9" fill="#fff" />
            <rect x="14.5" y="14" width="3" height="9" fill="#fff" />
            <rect x="21" y="14" width="3" height="9" fill="#fff" />
            <rect x="6" y="25" width="20" height="2.5" fill="#fff" />
          </svg>
          <div style={{ fontFamily: 'Fraunces', fontSize: 40, color: green }}>SchemeSetu</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 820 }}>
          <div style={{ fontFamily: 'Fraunces', fontSize: 70, lineHeight: 1.08, letterSpacing: -1 }}>
            Find the government schemes you’re actually eligible for
          </div>
          <div style={{ width: 96, height: 6, background: gold, marginTop: 28, borderRadius: 3 }} />
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#4a5263', gap: 14 }}>
          <span style={{ fontWeight: 600, color: ink }}>{schemes.length} verified schemes</span>
          <span>·</span>
          <span>12 Indian languages</span>
          <span>·</span>
          <span>Smart India Hackathon, SIH26092</span>
        </div>

        {/* The same approval stamp as the home page hero */}
        <svg
          width="230"
          height="230"
          viewBox="0 0 120 120"
          style={{ position: 'absolute', right: 70, top: 150, transform: 'rotate(-8deg)' }}
        >
          <circle cx="60" cy="60" r="54" fill="none" stroke={gold} strokeWidth="2.5" strokeDasharray="3.5 5" />
          <circle cx="60" cy="60" r="44" fill={green} />
          <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          <path d="M40 61 L53 74 L82 44" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Fraunces', data: fraunces, weight: 700, style: 'normal' },
        { name: 'Inter', data: inter, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 600, style: 'normal' },
      ],
    }
  )
}
