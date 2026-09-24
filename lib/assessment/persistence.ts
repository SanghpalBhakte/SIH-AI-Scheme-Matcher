// Client-side-only persistence for the in-progress assessment draft.
// localStorage remains what the UI actually reads from — nothing about
// that changed. savePersistedAssessment() additionally fires a
// best-effort, non-blocking mirror write to Supabase (see
// lib/supabase/sync.ts) so a visitor's draft can survive a cleared
// browser IF Supabase is configured and reachable; a visitor with
// Supabase unconfigured, offline, or mid-outage sees zero difference —
// localStorage alone still fully drives this app.
//
// Why localStorage and not sessionStorage: the goal is refresh/close
// -tab demo reliability, and localStorage survives an accidental tab
// close the same way it survives a refresh, which sessionStorage
// would not.
//
// Read this file's exports only from lib/assessment/assessment-context.tsx
// (via a client-only useEffect, never during the initial render) —
// calling into localStorage during a Server Component render, or
// during a Client Component's first render pass, would either throw
// (no `window` on the server) or cause a hydration mismatch (server
// and client would render different content on the very first paint).

import { ASSESSMENT_STEPS } from './steps'
import { deleteAssessmentProfile, syncAssessmentProfile } from '@/lib/supabase/sync'
import type { DraftEntrepreneurProfile } from '@/lib/matching/types'

const STORAGE_KEY = 'sih26092.assessment'

// Bump this whenever DraftEntrepreneurProfile's shape changes. A
// mismatch causes loadPersistedAssessment to discard the stored draft
// outright rather than attempt a blind migration — safer for a
// prototype than guessing how to upgrade old data.
//
// v2 (2026-09-02): added `minorityStatus` (Yes/No, mirrors
// `disabilityStatus`) for the new eligibility-schema special-groups
// support — see lib/matching/types.ts's SpecialGroup/deriveSpecialGroups.
const STORAGE_VERSION = 2

// The Supabase mirror is debounced: the draft changes on every
// keystroke (name, business name, amounts), and writing each one would
// mean dozens of network calls per form — plus a slow early request
// could land after a later one and leave a stale copy. Only the latest
// draft is sent, once typing pauses. localStorage is still written
// immediately, so nothing is lost on refresh.
export const SYNC_DEBOUNCE_MS = 1500
let pendingSync: ReturnType<typeof setTimeout> | null = null

export interface PersistedAssessmentState {
  profile: DraftEntrepreneurProfile
  stepIndex: number
}

// Field-by-field runtime shape check. TypeScript types don't exist at
// runtime, and localStorage content can be edited, stale from a prior
// version, or simply corrupt — this is the one place that content
// gets trusted, so it checks every field explicitly rather than
// assuming the JSON matches the type just because it parsed.
const STRING_FIELDS: (keyof DraftEntrepreneurProfile)[] = [
  'category',
  'gender',
  'state',
  'sector',
  'stage',
  'annualIncomeRange',
  'fullName',
  'district',
  'locationType',
  'disabilityStatus',
  'minorityStatus',
  'educationLevel',
  'businessName',
  'businessType',
  'businessLocation',
  'registrationStatus',
  'existingLoan',
  'creditRequirement',
  'subsidyRequirement',
]

const NUMBER_OR_EMPTY_FIELDS: (keyof DraftEntrepreneurProfile)[] = [
  'age',
  'yearsInOperation',
  'numberOfEmployees',
  'annualTurnoverLakh',
  'investmentRequiredLakh',
  'fundingRequirementLakh',
]

function isValidDraftProfile(value: unknown): value is DraftEntrepreneurProfile {
  if (typeof value !== 'object' || value === null) return false
  const draft = value as Record<string, unknown>

  const stringFieldsValid = STRING_FIELDS.every((key) => typeof draft[key] === 'string')
  const numberFieldsValid = NUMBER_OR_EMPTY_FIELDS.every((key) => typeof draft[key] === 'number' || draft[key] === '')
  const firstTimeValid = draft.firstTimeEntrepreneur === null || typeof draft.firstTimeEntrepreneur === 'boolean'
  const needsValid = Array.isArray(draft.businessNeeds) && draft.businessNeeds.every((v) => typeof v === 'string')

  return stringFieldsValid && numberFieldsValid && firstTimeValid && needsValid
}

/**
 * Reads and validates the persisted assessment draft. Returns null on
 * ANY problem — nothing stored, unparsable JSON, a version bump, or a
 * shape that doesn't match DraftEntrepreneurProfile — so the caller
 * always gets a clean "nothing usable was stored" signal rather than
 * a partially-trusted object. Never throws.
 */
export function loadPersistedAssessment(): PersistedAssessmentState | null {
  if (typeof window === 'undefined') return null

  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null // storage unavailable (private mode, disabled, quota, etc.)
  }
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null // corrupt JSON — discard rather than guess at repair
  }

  if (typeof parsed !== 'object' || parsed === null) return null
  const candidate = parsed as Record<string, unknown>

  if (candidate.version !== STORAGE_VERSION) return null
  if (!isValidDraftProfile(candidate.profile)) return null

  const rawStepIndex = candidate.stepIndex
  const stepIndex =
    typeof rawStepIndex === 'number' && Number.isInteger(rawStepIndex)
      ? Math.max(0, Math.min(rawStepIndex, ASSESSMENT_STEPS.length - 1))
      : 0

  return { profile: candidate.profile, stepIndex }
}

/** Persists the current draft. Silently no-ops if storage is unavailable. */
export function savePersistedAssessment(profile: DraftEntrepreneurProfile, stepIndex: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, profile, stepIndex }))
  } catch {
    // storage full/unavailable — persistence is a nice-to-have, never fatal
  }
  // Best-effort mirror to Supabase — never awaited, never blocks the
  // local save above, silently inert if Supabase isn't configured.
  if (pendingSync) clearTimeout(pendingSync)
  pendingSync = setTimeout(() => {
    pendingSync = null
    syncAssessmentProfile(profile, stepIndex).catch(() => {})
  }, SYNC_DEBOUNCE_MS)
}

/** Clears any persisted draft — used once the draft is back to empty, and on resetAssessment(). */
export function clearPersistedAssessment(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  // A queued mirror write must not re-upload a draft that was just cleared.
  if (pendingSync) {
    clearTimeout(pendingSync)
    pendingSync = null
  }
}

/**
 * "Start over": clears the local draft AND deletes the private backup
 * copy, if one was ever made. Kept separate from clearPersistedAssessment()
 * because that one also runs automatically on every visit with an empty
 * draft, which must never trigger a network call.
 */
export function discardPersistedAssessment(): void {
  clearPersistedAssessment()
  deleteAssessmentProfile().catch(() => {})
}
