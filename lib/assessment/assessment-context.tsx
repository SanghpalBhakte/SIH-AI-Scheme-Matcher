'use client'

// In-progress assessment state, held in React Context — still NOT URL
// search params (that's a different concern: a shareable *results*
// view, not the draft form). It IS now backed by localStorage for
// continuity across a refresh/tab-close — see lib/assessment/persistence.ts
// for the storage mechanism and its validation/versioning rules. React
// Context remains the only thing components actually read from;
// persistence is a hydrate-on-mount / save-on-change side effect, not
// a second source of truth.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DraftEntrepreneurProfile, EntrepreneurProfile } from '@/lib/matching/types'
import { ASSESSMENT_STEPS } from './steps'
import { clearPersistedAssessment, discardPersistedAssessment, loadPersistedAssessment, savePersistedAssessment } from './persistence'

// Every eligibility-affecting field starts unselected — no silent
// defaults (category/gender/state/sector/stage/first-time all start
// blank/null). annualIncomeRange defaults to '', because that's its
// own honest "prefer not to say" answer, not an unset placeholder —
// and every additional (engine-independent) field added for the
// fuller assessment form follows the same rule: '' / '' / [] means
// "not provided," never a fabricated default.
const DEFAULT_DRAFT_PROFILE: DraftEntrepreneurProfile = {
  category: '',
  gender: '',
  state: '',
  sector: '',
  stage: '',
  firstTimeEntrepreneur: null,
  annualIncomeRange: '',

  fullName: '',
  age: '',
  district: '',
  locationType: '',
  disabilityStatus: '',
  minorityStatus: '',
  educationLevel: '',

  businessName: '',
  businessType: '',
  yearsInOperation: '',
  numberOfEmployees: '',
  annualTurnoverLakh: '',
  businessLocation: '',
  registrationStatus: '',

  investmentRequiredLakh: '',
  existingLoan: '',
  fundingRequirementLakh: '',
  creditRequirement: '',
  subsidyRequirement: '',

  businessNeeds: [],
}

/**
 * True once any field differs from the untouched, empty draft.
 * `businessNeeds` is an array, so it's compared by content rather than
 * reference — otherwise toggling a need on and back off would leave a
 * new (but equally empty) array that reads as "dirty" by reference
 * alone.
 */
function isDraftDirty(draft: DraftEntrepreneurProfile): boolean {
  return (Object.keys(DEFAULT_DRAFT_PROFILE) as (keyof DraftEntrepreneurProfile)[]).some((key) => {
    const current = draft[key]
    const initial = DEFAULT_DRAFT_PROFILE[key]
    if (Array.isArray(current) && Array.isArray(initial)) {
      return current.length !== initial.length || current.some((v, i) => v !== initial[i])
    }
    return current !== initial
  })
}

interface AssessmentContextValue {
  profile: DraftEntrepreneurProfile
  /** Shallow-merges the given fields into the current draft profile. */
  updateProfile: (fields: Partial<DraftEntrepreneurProfile>) => void
  /**
   * Loads a demo profile (used by "load demo profile"). Demo profiles
   * only specify the engine-relevant fields (they're deliberately not
   * padded with fabricated names/ages/business details), so this
   * backfills every additional field to its honest "not provided"
   * default rather than leaving them undefined.
   */
  loadProfile: (profile: EntrepreneurProfile) => void
  resetAssessment: () => void
  /**
   * True once the draft differs from its untouched, empty state.
   * Used to gate unsaved-progress warnings on the /assessment route
   * — see app/assessment/page.tsx (beforeunload) and
   * components/layout/site-header.tsx (in-app nav confirmation).
   */
  isDirty: boolean
  /**
   * True once the initial localStorage read has completed. Both
   * server rendering and the client's very first paint always show
   * DEFAULT_DRAFT_PROFILE (required to avoid a hydration mismatch —
   * see persistence.ts) — restoring a real stored draft happens a
   * moment later in a useEffect. Pages that would otherwise flash an
   * incorrect "assessment incomplete" state before a stored complete
   * profile loads (recommendations, scheme details) should wait for
   * isHydrated before deciding what to render.
   */
  isHydrated: boolean
  stepIndex: number
  isFirstStep: boolean
  isLastStep: boolean
  goToStep: (index: number) => void
  nextStep: () => void
  previousStep: () => void
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DraftEntrepreneurProfile>(DEFAULT_DRAFT_PROFILE)
  const [stepIndex, setStepIndex] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage once, after mount. Client-only by
  // construction (useEffect never runs during SSR or the initial
  // client render), so the first paint is always identical on server
  // and client — no hydration mismatch — and a moment later this
  // swaps in a real stored draft if one exists.
  useEffect(() => {
    const restored = loadPersistedAssessment()
    if (restored) {
      setProfile(restored.profile)
      setStepIndex(restored.stepIndex)
    }
    setIsHydrated(true)
  }, [])

  // Persist on every change, but only once hydration has actually run
  // — otherwise this would fire on the very first render (still
  // holding DEFAULT_DRAFT_PROFILE) and overwrite a real stored draft
  // with the empty default before the hydration effect above gets a
  // chance to read it. Once hydrated, an untouched draft (still at
  // its default, step 0) clears storage instead of writing an empty
  // record — nothing worth restoring means nothing worth persisting.
  useEffect(() => {
    if (!isHydrated) return
    if (!isDraftDirty(profile) && stepIndex === 0) {
      clearPersistedAssessment()
      return
    }
    savePersistedAssessment(profile, stepIndex)
  }, [profile, stepIndex, isHydrated])

  const value = useMemo<AssessmentContextValue>(
    () => ({
      profile,
      updateProfile: (fields) => setProfile((prev) => ({ ...prev, ...fields })),
      loadProfile: (next) => setProfile({ ...DEFAULT_DRAFT_PROFILE, ...next }),
      resetAssessment: () => {
        setProfile(DEFAULT_DRAFT_PROFILE)
        setStepIndex(0)
        discardPersistedAssessment()
      },
      isDirty: isDraftDirty(profile),
      isHydrated,
      stepIndex,
      isFirstStep: stepIndex === 0,
      isLastStep: stepIndex === ASSESSMENT_STEPS.length - 1,
      goToStep: (index) => setStepIndex(Math.max(0, Math.min(index, ASSESSMENT_STEPS.length - 1))),
      nextStep: () => setStepIndex((i) => Math.min(i + 1, ASSESSMENT_STEPS.length - 1)),
      previousStep: () => setStepIndex((i) => Math.max(i - 1, 0)),
    }),
    [profile, stepIndex, isHydrated]
  )

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext)
  if (!ctx) {
    throw new Error('useAssessment() must be used within an <AssessmentProvider>')
  }
  return ctx
}
