// Reads app state (assessment profile, matching results, the
// currently-open scheme) into a single snapshot the chat engine can
// answer questions from. This is the ONLY place the assistant touches
// app state directly — lib/chat/engine.ts only ever sees this plain
// object, never the contexts/hooks themselves, so the engine stays a
// pure function that's easy to reason about and test.

import type { DraftEntrepreneurProfile, EntrepreneurProfile, Scheme, SchemeMatchResult } from '@/lib/matching/types'
import { isProfileComplete, toEngineProfile } from '@/lib/matching/types'
import { matchSchemes } from '@/lib/matching/engine'

export interface ChatAppContext {
  profileComplete: boolean
  /** Narrowed, engine-ready profile — set only once isProfileComplete() is true. */
  completeProfile: EntrepreneurProfile | null
  /** All schemes scored against the profile, sorted best-first. Null until the profile is complete. */
  recommendations: SchemeMatchResult[] | null
  /** The scheme whose detail page is currently open, if any (from the URL). */
  selectedScheme: Scheme | null
}

export function buildChatContext(params: {
  profile: DraftEntrepreneurProfile
  isHydrated: boolean
  pathname: string
  schemes: Scheme[]
}): ChatAppContext {
  const { profile, isHydrated, pathname, schemes } = params

  // isProfileComplete() is a type guard, so this `if` is what actually
  // narrows `profile` to EntrepreneurProfile — assigning the boolean to
  // a variable first would lose that narrowing.
  let completeProfile: EntrepreneurProfile | null = null
  if (isHydrated && isProfileComplete(profile)) {
    completeProfile = toEngineProfile(profile)
  }

  const recommendations = completeProfile ? matchSchemes(completeProfile, schemes) : null

  // /schemes/[id] is the only route with a single "active" scheme —
  // /schemes (the browser) has no one selected scheme.
  const schemeRouteMatch = pathname.match(/^\/schemes\/([^/?#]+)/)
  const selectedScheme = schemeRouteMatch
    ? (schemes.find((s) => s.id === decodeURIComponent(schemeRouteMatch[1])) ?? null)
    : null

  return {
    profileComplete: completeProfile !== null,
    completeProfile,
    recommendations,
    selectedScheme,
  }
}
