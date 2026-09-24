// "Recommendation Reasoning & Verification" — presentation-only logic
// layered on top of an already-computed SchemeMatchResult
// (lib/matching/engine.ts). Same discipline as explain.ts right next
// to this file: this NEVER recomputes matchScore, eligibilityStatus,
// or ranking, and never reads/writes any matching-engine weight or
// threshold. Every function here is a pure read of fields the engine
// (or the scheme record) already produced.
//
// Reason text (deriveMatchReasons) is sourced verbatim from
// `result.matchedCriteria[].label` — the exact strings
// lib/matching/engine.ts already generates for a matched criterion
// (e.g. "Designed for Woman entrepreneurs", "Available in Gujarat").
// Nothing here writes new claim text; it only selects and caps which
// already-produced labels are worth surfacing as a friendly "why"
// list. Like `describeAudience()` (lib/schemes/describe-audience.ts)
// and `Scheme.enhancedSupportFor.detail`, this generated text stays in
// English rather than going through t() — see scheme-overview.tsx's
// comment for the established precedent. Every STATIC piece of UI
// chrome around it (section titles, the verify-note sentences, the
// fallback string, the match-label words) is a real i18n key instead,
// per this feature's own translation requirement.

import type { Scheme, SchemeMatchResult } from '@/lib/matching/types'

// --- A. Deterministic reason derivation --------------------------------

// The exact "criterion is wide open" strings evaluateScheme() emits
// when a scheme places NO restriction on that dimension (see
// lib/matching/engine.ts). These are true, but not personal to the
// applicant — "Open to all genders" doesn't explain why THIS person
// fits. deriveMatchReasons() prefers the specific, profile-referencing
// labels first and only falls back to these generic ones if a scheme
// is so unrestricted there aren't at least two specific reasons to
// show — see below.
const GENERIC_MATCHED_LABELS = new Set<string>([
  'Open to all categories',
  'Open to all genders',
  'Available nationwide',
  'Open to all business sectors',
  'Open at any business stage',
  'No income cap for this scheme',
  'No first-time-entrepreneur requirement',
])

const MIN_REASONS = 2
const MAX_REASONS = 4

/**
 * 2-4 plain-language "why this may fit you" reasons, or an empty array
 * if nothing was safely derivable (the UI shows a safe fallback string
 * in that case — see reasoning.fallback). Reads only
 * `result.matchedCriteria`, in the fixed criterion order the engine
 * already evaluates in (category/gender/state/sector/stage/firstTime/
 * income) — never re-sorted by score, so this can't be used to imply a
 * ranking.
 */
export function deriveMatchReasons(result: SchemeMatchResult): string[] {
  const labels = result.matchedCriteria.map((c) => c.label)
  const specific = labels.filter((label) => !GENERIC_MATCHED_LABELS.has(label))

  if (specific.length >= MIN_REASONS) {
    return specific.slice(0, MAX_REASONS)
  }

  // This scheme is broad enough that fewer than 2 criteria are
  // personal to this applicant — pad with the generic (but still
  // truthful) matched criteria rather than showing just 0-1 reasons.
  const generic = labels.filter((label) => GENERIC_MATCHED_LABELS.has(label))
  return [...specific, ...generic].slice(0, MAX_REASONS)
}

// --- C. Match labels -----------------------------------------------------
// Deterministic, explainable labels — NOT a new score, NOT "AI
// confidence," NOT a percentage. Purely a friendlier re-labelling of
// the eligibilityStatus + missingCriteria the engine already computed;
// changing this mapping can never change matchScore, eligibilityStatus,
// or the sort order matchSchemes() already produced.
export type MatchLabel = 'Strong match' | 'Possible match' | 'Explore after verification'

/**
 * Label rules (documented here, not just in a comment elsewhere, per
 * this feature's own requirement):
 *
 *   - eligibilityStatus === 'Likely Eligible' AND no missing criteria
 *       → "Strong match" — every criterion the prototype checks lined
 *         up, and the engine had every input it needed to say so.
 *   - eligibilityStatus === 'Likely Eligible' (with something missing)
 *     OR eligibilityStatus === 'Possibly Eligible'
 *       → "Possible match" — a real, partial fit; not everything is
 *         confirmed or every soft criterion aligned.
 *   - eligibilityStatus === 'Insufficient Information'
 *     OR eligibilityStatus === 'Low Match'
 *       → "Explore after verification" — either the engine doesn't
 *         have enough information to judge this scheme confidently, or
 *         a hard criterion didn't line up; both cases genuinely need a
 *         closer, human look (via the official source) before this
 *         scheme can be ruled in or out. This label never claims the
 *         scheme fits — see reasoning.verifyTitle for the paired
 *         verification content whenever this label is shown.
 */
export function deriveMatchLabel(result: SchemeMatchResult): MatchLabel {
  const { eligibilityStatus, missingCriteria } = result

  if (eligibilityStatus === 'Likely Eligible' && missingCriteria.length === 0) {
    return 'Strong match'
  }
  if (eligibilityStatus === 'Likely Eligible' || eligibilityStatus === 'Possibly Eligible') {
    return 'Possible match'
  }
  return 'Explore after verification'
}

// --- B. Verification requirements ----------------------------------------

export type VerificationNoteKey = 'confirmEligibility' | 'categoryAndLocal' | 'fundingWindow'

/** i18n key for each verification note — every value here is one of this feature's safe, generic, pre-approved wordings (never invented per-scheme text). */
export const VERIFICATION_NOTE_I18N_KEY: Record<VerificationNoteKey, string> = {
  confirmEligibility: 'reasoning.verify.confirmEligibility',
  categoryAndLocal: 'reasoning.verify.categoryAndLocal',
  fundingWindow: 'reasoning.verify.fundingWindow',
}

function isNationwide(list: string[]): boolean {
  return list.includes('All')
}

/**
 * Which "Verify before applying" notes (if any) genuinely apply to
 * this result — the section itself is only shown when this returns a
 * non-empty array (see requirement B: "only where there are genuine
 * unresolved conditions"). Every rule below reads an already-computed
 * matching signal or an existing scheme field; none of it is
 * per-scheme invented text.
 *
 *   1. `missingCriteria.length > 0`
 *        → the engine itself doesn't have enough information to fully
 *          judge this scheme (e.g. income wasn't provided).
 *   2. `eligibilityStatus === 'Possibly Eligible'`
 *        → a soft criterion (sector/stage) didn't cleanly match, so
 *          this is only a partial fit even though nothing hard-failed.
 *   3. `scheme.additionalEligibleGroups` is non-empty
 *        → this scheme's category eligibility can be satisfied via a
 *          SELF-DECLARED special group (Minority/PwD — see
 *          EntrepreneurProfile.specialGroups), which nobody has
 *          verified.
 *   4. The scheme is state-specific (`!scheme.states.includes('All')`)
 *        → state schemes often carry real district/local-body-level
 *          implementation variance a nationwide rule engine can't see.
 *
 * Whenever ANY of the above applies, the universally-true funding/
 * window reminder is added alongside it — every real government
 * scheme's funding caps and application windows can change
 * independent of anything this prototype tracks, so it's never wrong
 * to say once the section is being shown at all.
 */
export function deriveVerificationNotes(result: SchemeMatchResult, scheme: Scheme): VerificationNoteKey[] {
  const notes = new Set<VerificationNoteKey>()

  if (result.missingCriteria.length > 0) {
    notes.add('confirmEligibility')
  }
  if (result.eligibilityStatus === 'Possibly Eligible') {
    notes.add('categoryAndLocal')
  }
  if (scheme.additionalEligibleGroups && scheme.additionalEligibleGroups.length > 0) {
    notes.add('categoryAndLocal')
  }
  // Same reason: eligibility rests on a self-declared group (e.g. PwD).
  if (scheme.requiredSpecialGroups && scheme.requiredSpecialGroups.length > 0) {
    notes.add('categoryAndLocal')
  }
  if (!isNationwide(scheme.states)) {
    notes.add('categoryAndLocal')
  }

  if (notes.size > 0) {
    notes.add('fundingWindow')
  }

  return [...notes]
}
