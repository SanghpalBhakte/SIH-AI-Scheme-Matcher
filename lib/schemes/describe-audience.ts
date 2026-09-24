// Plain-language description of a scheme's OWN stated eligibility
// rules — independent of any specific user. This is NOT matching
// logic: it never reads a profile and never produces a score, it just
// phrases the scheme's categories/genders/sectors/etc. fields for a
// "who can benefit" section. lib/matching/engine.ts remains the only
// place a profile is actually scored against a scheme.

import type { Scheme } from '@/lib/matching/types'

function isOpen(list: string[]): boolean {
  return list.includes('Any') || list.includes('All')
}

/** Short, plain-language sentences describing who this scheme is for. */
export function describeAudience(scheme: Scheme): string[] {
  const lines = [
    isOpen(scheme.categories)
      ? 'Open to all social/economic categories'
      : scheme.additionalEligibleGroups?.length
        ? `Primarily for ${scheme.categories.join(', ')} entrepreneurs (also open to ${scheme.additionalEligibleGroups.join('/')} applicants)`
        : scheme.additionalEligibleGenders?.length
          ? `For ${scheme.categories.join(', ')} entrepreneurs, or ${scheme.additionalEligibleGenders
              .map((g) => ({ Woman: 'women', Man: 'men', Transgender: 'transgender' })[g])
              .join('/')} entrepreneurs of any category`
          : `Primarily for ${scheme.categories.join(', ')} entrepreneurs`,
    isOpen(scheme.genders) ? 'Open to all genders' : `Focused on ${scheme.genders.join('/')} entrepreneurs`,
    isOpen(scheme.states) ? 'Available nationwide' : `Available in: ${scheme.states.join(', ')}`,
    isOpen(scheme.sectors)
      ? 'Open to any business sector'
      : `Focused on the ${scheme.sectors.join(', ')} sector(s)`,
    isOpen(scheme.stages)
      ? 'Open at any business stage'
      : `Aimed at businesses at the ${scheme.stages.join('/')} stage`,
    scheme.firstTimeOnly ? 'Only for first-time entrepreneurs' : 'No first-time-entrepreneur requirement',
    scheme.maxIncomeLakh == null
      ? 'No annual income cap for this scheme'
      : `Annual income should not exceed ₹${scheme.maxIncomeLakh} lakh`,
  ]

  // Purely informational — never affects eligibility (see
  // Scheme.enhancedSupportFor's doc comment) — so this is additive only
  // and never narrows what the lines above already say about who
  // qualifies.
  if (scheme.enhancedSupportFor?.length) {
    lines.push(
      ...scheme.enhancedSupportFor.map((e) => `Enhanced support for ${e.group}: ${e.detail}`)
    )
  }

  return lines
}
