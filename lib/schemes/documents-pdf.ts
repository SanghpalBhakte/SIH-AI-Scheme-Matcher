// Generates a simple, honest PDF listing a scheme's own verified
// requiredDocuments (see data/schemes.ts) — nothing else. The PDF's
// content IS scheme.requiredDocuments; there is no separate,
// hand-maintained file that could drift out of sync or invent items
// beyond what the dataset already states.
//
// jsPDF is dynamically imported (not a top-level import) so it's only
// ever fetched by a browser that actually clicks "download" — it never
// adds to the initial page weight, consistent with this app's mobile
// data-usage priorities (see components/landing/hero-photo-mobile.tsx).
// Generation is entirely client-side, so it also works offline once the
// page's own JS is cached by the service worker (public/sw.js) — no
// network round trip needed to produce the file.
import type { Scheme } from '@/lib/matching/types'

const MARGIN = 48
const LINE_HEIGHT = 16
const PAGE_HEIGHT = 842 // A4, in points

export async function downloadRequiredDocumentsPdf(scheme: Scheme): Promise<void> {
  const documents = scheme.requiredDocuments
  if (!documents || documents.length === 0) return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = MARGIN

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(scheme.name, MARGIN, y)
  y += LINE_HEIGHT * 1.5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(90)
  doc.text('Required documents', MARGIN, y)
  y += LINE_HEIGHT

  doc.setTextColor(0)
  doc.setFontSize(11)
  for (const item of documents) {
    const wrapped = doc.splitTextToSize(item, 500 - 14)
    if (y + wrapped.length * LINE_HEIGHT > PAGE_HEIGHT - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
    doc.text('•', MARGIN, y)
    doc.text(wrapped, MARGIN + 14, y)
    y += wrapped.length * LINE_HEIGHT
  }

  y += LINE_HEIGHT * 0.5
  if (y > PAGE_HEIGHT - MARGIN * 2) {
    doc.addPage()
    y = MARGIN
  }
  doc.setDrawColor(200)
  doc.line(MARGIN, y, 500 + MARGIN - 14, y)
  y += LINE_HEIGHT

  doc.setFontSize(9)
  doc.setTextColor(120)
  const source = scheme.sourceUrl ?? scheme.officialUrl
  if (source) {
    doc.text(`Source: ${source}`, MARGIN, y)
    y += LINE_HEIGHT * 0.9
  }
  if (scheme.lastVerified) {
    doc.text(`Checked against the official source on: ${scheme.lastVerified}`, MARGIN, y)
    y += LINE_HEIGHT * 0.9
  }
  const disclaimer = doc.splitTextToSize(
    'Made by SchemeSetu from official sources. Requirements can change, so always confirm the current list on the official source above before applying.',
    500 - 14
  )
  doc.text(disclaimer, MARGIN, y)

  doc.save(`${scheme.id}-required-documents.pdf`)
}
