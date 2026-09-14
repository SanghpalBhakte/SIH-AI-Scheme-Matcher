import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      // Tighter on phones (reclaims width for the header's icon row —
      // see site-header.tsx) — back to the original 1.5rem from sm up.
      padding: { DEFAULT: '1rem', sm: '1.5rem' },
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Darker variant of `accent`, WCAG AA-safe as small text on
        // background/card — see the --accent-text comment in
        // globals.css. Use text-accent-text for gold text labels;
        // text-accent stays correct for icons/badges/borders.
        'accent-text': 'hsl(var(--accent-text))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        // Inter for all UI/body text — highly legible, accessible, the
        // right default for forms and dense information. Fraunces is
        // used deliberately (via the `font-display` utility), never
        // globally, for large headings only — that pairing (a warm
        // editorial serif for headlines + a clean grotesk for
        // everything else) is what gives the product some personality
        // beyond "default Inter SaaS app" without tipping into
        // decorative/gimmicky territory.
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        elevated: '0 4px 12px -2px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'elevated-lg': '0 16px 32px -12px rgb(0 0 0 / 0.16), 0 4px 8px -4px rgb(0 0 0 / 0.08)',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // One shared curve for every photo in the hero rotation (see
        // components/landing/hero-photo.tsx) — each <Image> uses this
        // same keyframe set with a different negative animation-delay,
        // which is what staggers them into a continuous crossfade
        // instead of a hard cut. Percentages assume a 21s cycle split
        // into three ~7s slots (1.5s fade + ~5.5s hold each) — keep the
        // two in sync if either changes.
        'hero-crossfade': {
          '0%, 100%': { opacity: '0' },
          '7.14%, 33.33%': { opacity: '1' },
          '40.48%': { opacity: '0' },
        },
        // The hero's one signature moment (see components/landing/
        // approval-stamp.tsx) — a rubber stamp coming down onto the
        // hero photo like a real approval stamp landing on a document:
        // drops from a steep angle, overshoots past its resting tilt as
        // it "hits," then settles. The 0.6s start delay (set on the
        // `animation` shorthand below, not here) lets the photo/heading
        // land first, so this reads as one orchestrated sequence rather
        // than everything appearing at once.
        //
        // The opacity fade is deliberately front-loaded into the first
        // ~15% of the animation, not spread across the first 55% the
        // way an earlier version had it — with a flat circular SVG,
        // fading in WHILE it's still steeply rotateX'd (near edge-on,
        // squashed to a thin sliver) read as the shape warping into
        // existence rather than dropping in. Resolving opacity to 1
        // quickly, while rotateX is still shallow enough to look like a
        // tilted disc rather than a line, keeps the "reveal" clean; the
        // rest of the animation is then a fully-opaque object dropping
        // and bouncing into place, which is the part that should feel
        // dramatic.
        'stamp-down': {
          '0%': { opacity: '0', transform: 'perspective(700px) rotateX(-32deg) rotateZ(-18deg) scale(.55) translateY(-40px)' },
          '15%': { opacity: '1', transform: 'perspective(700px) rotateX(-18deg) rotateZ(-15deg) scale(.7) translateY(-24px)' },
          '55%': { transform: 'perspective(700px) rotateX(0deg) rotateZ(-11deg) scale(1.08) translateY(0)' },
          '75%': { transform: 'perspective(700px) rotateX(0deg) rotateZ(-6deg) scale(.97) translateY(0)' },
          '100%': { opacity: '1', transform: 'perspective(700px) rotateX(0deg) rotateZ(-8deg) scale(1) translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'hero-crossfade': 'hero-crossfade 21s ease-in-out infinite',
        'stamp-down': 'stamp-down 0.85s cubic-bezier(.25,.85,.35,1) 0.6s both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
