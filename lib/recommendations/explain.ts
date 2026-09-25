// Plain-language summary text for a single scheme match. This is a
// PRESENTATION helper only — it formats a SchemeMatchResult the engine
// already computed (lib/matching/engine.ts) into a short sentence. It
// never recomputes or re-weighs anything, so lib/matching/* stays the
// only scoring source: this file just reads that output and phrases
// it in plain, non-legal language for the results page.

import type { SchemeMatchResult } from '@/lib/matching/types'

function lowercaseFirst(text: string): string {
  return text.length === 0 ? text : text[0].toLowerCase() + text.slice(1)
}

/**
 * A one-sentence, honest explanation of why a scheme scored the way
 * it did. Deliberately avoids words like "eligible"/"approved" for
 * anything short of "Likely Eligible", and never claims certainty the
 * underlying status doesn't have.
 */
export function summarizeMatch(result: SchemeMatchResult): string {
  const { eligibilityStatus, matchedCriteria, missingCriteria, failedCriteria } = result

  if (eligibilityStatus === 'Insufficient Information') {
    return missingCriteria.length === 1
      ? `This looks promising, but one detail (${lowercaseFirst(missingCriteria[0].label)}) is still needed to judge it confidently.`
      : 'This looks promising, but a few details are still needed to judge it properly. See "Needs verification" below.'
  }

  if (matchedCriteria.length === 0) {
    return "None of the criteria this prototype checks lined up with your profile. See \"Not aligned\" below."
  }

  const topReasons = matchedCriteria.slice(0, 2).map((c) => lowercaseFirst(c.label))
  const reasonText = topReasons.join(' and ')

  switch (eligibilityStatus) {
    case 'Likely Eligible':
      return `Matches well: ${reasonText}. Final approval still depends on the scheme's own verification process.`
    case 'Possibly Eligible':
      return `Partially matches: ${reasonText}, but ${
        failedCriteria.length > 0 ? "not every criterion aligns, see \"Not aligned\" below" : 'a few details are unclear'
      }.`
    case 'Low Match':
    default:
      return 'At least one requirement for this scheme doesn\'t fit your profile right now. See "Not aligned" below.'
  }
}
