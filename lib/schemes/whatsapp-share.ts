// Builds the pre-filled message for the "Share on WhatsApp" button.
// wa.me needs no API key or backend — it's just a URL that opens
// WhatsApp (app or web) with a message already typed in; the person
// then picks who to send it to themselves. Nothing is sent by this
// app directly, and no contact list or phone number is ever read.
//
// The message body is composed only from the scheme's own real,
// already-verified fields (name/benefit — see data/schemes.ts) plus a
// link back to this scheme's own detail page — never anything invented
// beyond what's already shown on screen. It stays in English
// regardless of the UI's selected locale, the same convention already
// used for the generated documents-checklist PDF (see
// lib/schemes/documents-pdf.ts): exported/shared content mirrors the
// scheme data itself, which this app never machine-translates.
import type { Scheme } from '@/lib/matching/types'

export function buildSchemeWhatsAppUrl(scheme: Scheme, detailUrl: string): string {
  const message = [
    scheme.name,
    scheme.benefit,
    '',
    `Check if you're eligible: ${detailUrl}`,
    '',
    '(Shared from SchemeSetu, a student prototype that matches schemes using their eligibility rules. It is not an official government decision.)',
  ].join('\n')

  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
