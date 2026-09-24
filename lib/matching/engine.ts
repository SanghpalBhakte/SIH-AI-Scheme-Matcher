// Deterministic, rule-based scheme matching engine.
//
// No LLM involved — every score is reproducible from (profile, scheme,
// weights). This is intentional: the product must be able to explain
// *exactly* why a scheme was or wasn't recommended.

import type {
  CriterionResult,
  EligibilityStatus,
  EntrepreneurProfile,
  Gender,
  Scheme,
  SchemeMatchResult,
} from './types'
import { INCOME_RANGE_OPTIONS } from './types'
import { INSUFFICIENT_INFO_MISSING_SHARE, MATCH_WEIGHTS, SCORE_THRESHOLDS, TOTAL_WEIGHT } from './weights'

const HARD_FAIL_KEYS = new Set<CriterionResult['key']>(['category', 'gender', 'state', 'firstTime', 'income'])

function isOpen(list: string[]) {
  return list.includes('Any') || list.includes('All')
}

const GENDER_PLURAL: Record<Gender, string> = { Woman: 'women', Man: 'men', Transgender: 'transgender' }

function incomeLakh(profile: EntrepreneurProfile): number | null {
  return INCOME_RANGE_OPTIONS.find((o) => o.value === profile.annualIncomeRange)?.representativeLakh ?? null
}

type CriterionOutcome = 'matched' | 'missing' | 'failed'

function evaluateCriterion(
  key: CriterionResult['key'],
  outcome: CriterionOutcome,
  label: string
): { key: CriterionResult['key']; outcome: CriterionOutcome; label: string } {
  return { key, outcome, label }
}

/**
 * Evaluates a single scheme against a profile. Pure function — same
 * inputs always produce the same output.
 */
export function evaluateScheme(profile: EntrepreneurProfile, scheme: Scheme): SchemeMatchResult {
  const results: { key: CriterionResult['key']; outcome: CriterionOutcome; label: string }[] = []

  // --- category ---
  // A scheme's category criterion is satisfied by matching `categories`
  // directly, OR by matching one of `additionalEligibleGroups` (special
  // groups like Minority/PwD that some schemes' own eligibility lists
  // include alongside caste category — see SpecialGroup's doc comment
  // for why these are a separate field rather than folded into
  // `categories`). This stays a single 'category' criterion (not two
  // independent ones) deliberately: the real-world rule is "any ONE of
  // these groups qualifies," an OR — modeling it as two separately
  // hard-failing criteria would wrongly force "Low Match" for a
  // General-category applicant who qualifies via a special group, since
  // HARD_FAIL_KEYS treats every failed hard criterion as disqualifying
  // on its own.
  const matchedSpecialGroups = scheme.additionalEligibleGroups?.length
    ? (profile.specialGroups ?? []).filter((g) => scheme.additionalEligibleGroups!.includes(g))
    : []
  // Same OR idea for gender-based category eligibility (e.g. Stand-Up
  // India: "SC/ST and/or women") — see Scheme.additionalEligibleGenders.
  const matchesEligibleGender = scheme.additionalEligibleGenders?.includes(profile.gender) ?? false

  if (isOpen(scheme.categories)) {
    results.push(evaluateCriterion('category', 'matched', 'Open to all categories'))
  } else if (scheme.categories.includes(profile.category)) {
    results.push(evaluateCriterion('category', 'matched', `Specifically targets ${profile.category} entrepreneurs`))
  } else if (matchedSpecialGroups.length > 0) {
    results.push(
      evaluateCriterion(
        'category',
        'matched',
        `Also open to ${matchedSpecialGroups.join('/')} applicants, which matches your profile`
      )
    )
  } else if (matchesEligibleGender) {
    results.push(
      evaluateCriterion(
        'category',
        'matched',
        `Open to ${GENDER_PLURAL[profile.gender]} entrepreneurs of any category, which matches your profile`
      )
    )
  } else {
    const eligibleGroups = [...scheme.categories, ...(scheme.additionalEligibleGroups ?? [])]
    const eligibleGenders = (scheme.additionalEligibleGenders ?? []).map((g) => GENDER_PLURAL[g])
    results.push(
      evaluateCriterion(
        'category',
        'failed',
        `Restricted to ${eligibleGroups.join('/')} entrepreneurs` +
          (eligibleGenders.length ? ` or ${eligibleGenders.join('/')} of any category` : '') +
          ` — you selected ${profile.category}` +
          (eligibleGenders.length ? `, ${profile.gender}` : '') +
          (scheme.additionalEligibleGroups?.length ? " and didn't indicate any of the additional eligible groups" : '')
      )
    )
  }

  // --- gender ---
  if (isOpen(scheme.genders)) {
    results.push(evaluateCriterion('gender', 'matched', 'Open to all genders'))
  } else if (scheme.genders.includes(profile.gender)) {
    results.push(evaluateCriterion('gender', 'matched', `Designed for ${profile.gender} entrepreneurs`))
  } else {
    results.push(
      evaluateCriterion('gender', 'failed', `Restricted to ${scheme.genders.join('/')} entrepreneurs`)
    )
  }

  // --- state ---
  if (isOpen(scheme.states)) {
    results.push(evaluateCriterion('state', 'matched', 'Available nationwide'))
  } else if (scheme.states.includes(profile.state)) {
    results.push(evaluateCriterion('state', 'matched', `Available in ${profile.state}`))
  } else {
    results.push(evaluateCriterion('state', 'failed', `Not currently listed as available in ${profile.state}`))
  }

  // --- sector (soft: contributes to score, never hard-blocks) ---
  if (isOpen(scheme.sectors)) {
    results.push(evaluateCriterion('sector', 'matched', 'Open to all business sectors'))
  } else if (scheme.sectors.includes(profile.sector)) {
    results.push(evaluateCriterion('sector', 'matched', `Covers your sector (${profile.sector})`))
  } else {
    results.push(
      evaluateCriterion('sector', 'failed', `Typically focused on ${scheme.sectors.join('/')}, not ${profile.sector}`)
    )
  }

  // --- stage (soft) ---
  if (isOpen(scheme.stages)) {
    results.push(evaluateCriterion('stage', 'matched', 'Open at any business stage'))
  } else if (scheme.stages.includes(profile.stage)) {
    results.push(evaluateCriterion('stage', 'matched', `Fits your business stage (${profile.stage})`))
  } else {
    results.push(
      evaluateCriterion('stage', 'failed', `Aimed at ${scheme.stages.join('/')} stage businesses`)
    )
  }

  // --- firstTime ---
  if (scheme.firstTimeOnly && !profile.firstTimeEntrepreneur) {
    results.push(evaluateCriterion('firstTime', 'failed', 'Only open to first-time entrepreneurs'))
  } else if (scheme.firstTimeOnly) {
    results.push(evaluateCriterion('firstTime', 'matched', 'You qualify as a first-time entrepreneur'))
  } else {
    results.push(evaluateCriterion('firstTime', 'matched', 'No first-time-entrepreneur requirement'))
  }

  // --- income ---
  const income = incomeLakh(profile)
  if (scheme.maxIncomeLakh == null) {
    results.push(evaluateCriterion('income', 'matched', 'No income cap for this scheme'))
  } else if (income == null) {
    results.push(
      evaluateCriterion('income', 'missing', `This scheme caps annual income at ₹${scheme.maxIncomeLakh} lakh — income not provided`)
    )
  } else if (income <= scheme.maxIncomeLakh) {
    results.push(evaluateCriterion('income', 'matched', 'Your income falls within the eligible limit'))
  } else {
    results.push(
      evaluateCriterion('income', 'failed', `Income cap for this scheme is ₹${scheme.maxIncomeLakh} lakh/year`)
    )
  }

  // --- aggregate ---
  const matchedCriteria: CriterionResult[] = []
  const missingCriteria: CriterionResult[] = []
  const failedCriteria: CriterionResult[] = []
  let earnedWeight = 0
  let missingWeight = 0

  for (const r of results) {
    const weight = MATCH_WEIGHTS[r.key]
    if (r.outcome === 'matched') {
      earnedWeight += weight
      matchedCriteria.push({ key: r.key, label: r.label })
    } else if (r.outcome === 'missing') {
      missingWeight += weight
      missingCriteria.push({ key: r.key, label: r.label })
    } else {
      failedCriteria.push({ key: r.key, label: r.label })
    }
  }

  const matchScore = Math.round((earnedWeight / TOTAL_WEIGHT) * 100)
  const hasHardFail = failedCriteria.some((f) => HARD_FAIL_KEYS.has(f.key))

  let eligibilityStatus: EligibilityStatus
  if (hasHardFail) {
    eligibilityStatus = 'Low Match'
  } else if (missingWeight / TOTAL_WEIGHT > INSUFFICIENT_INFO_MISSING_SHARE) {
    eligibilityStatus = 'Insufficient Information'
  } else if (matchScore >= SCORE_THRESHOLDS.likelyEligible) {
    eligibilityStatus = 'Likely Eligible'
  } else if (matchScore >= SCORE_THRESHOLDS.possiblyEligible) {
    eligibilityStatus = 'Possibly Eligible'
  } else {
    eligibilityStatus = 'Low Match'
  }

  return { scheme, matchScore, eligibilityStatus, matchedCriteria, missingCriteria, failedCriteria }
}

/**
 * Evaluates every scheme in the dataset and returns results sorted by
 * matchScore descending. Callers slice the top N for display — the
 * engine itself never silently drops a scheme, so the UI can always
 * explain "why not" for anything left out of the top 3.
 */
export function matchSchemes(profile: EntrepreneurProfile, schemes: Scheme[]): SchemeMatchResult[] {
  return schemes.map((scheme) => evaluateScheme(profile, scheme)).sort((a, b) => b.matchScore - a.matchScore)
}
