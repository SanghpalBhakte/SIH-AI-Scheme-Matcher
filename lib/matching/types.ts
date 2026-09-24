// Core data model for the recommendation engine.
// Keep this the single source of truth for shapes shared between
// the matching engine, the mock data, and the UI.

export type Category = 'General' | 'OBC' | 'SC' | 'ST'
export type Gender = 'Woman' | 'Man' | 'Transgender'
export type BusinessStage = 'Idea' | 'Early' | 'Growth' | 'Established'
export type IncomeRange = '' | 'below-1l' | '1-3l' | '3-5l' | '5-8l' | 'above-8l'

/**
 * Eligibility dimensions that some schemes' OWN official eligibility
 * lists define ALONGSIDE caste category — e.g. Delhi's Composite Loan
 * Scheme, whose eligible-groups list is "SC/ST/OBC/Minorities/Persons
 * with Disabilities." These are deliberately a SEPARATE field from
 * `Category` rather than new values added to it: a person's caste
 * category (General/OBC/SC/ST) and their minority/disability status are
 * independent, non-exclusive facts about them (e.g. a General-category
 * applicant can also be a religious minority), so folding them into one
 * mutually-exclusive enum would force a false either/or choice. See
 * `Scheme.additionalEligibleGroups` and `EntrepreneurProfile.specialGroups`.
 */
export type SpecialGroup = 'Minority' | 'PwD'

// --- Additional intake fields (collected, not yet consumed by the engine) ---
// These back the fuller Basic Profile / Business Information / Financial
// Information / Business Needs sections of the assessment. None of them
// feed lib/matching/engine.ts today — see the doc comment on
// AdditionalProfileDetails below for why, and DraftEntrepreneurProfile
// for how they're combined with the fields the engine does consume.
export type LocationType = 'Rural' | 'Urban'
export type YesNo = 'Yes' | 'No'
export type EducationLevel = 'Below 10th' | '10th Pass' | '12th Pass' | 'Diploma' | 'Graduate' | 'Postgraduate' | 'Other'
export type BusinessType =
  | 'Sole Proprietorship'
  | 'Partnership'
  | 'LLP'
  | 'Private Limited Company'
  | 'Self-Help Group (SHG)'
  | 'Cooperative'
  | 'Not registered yet'
export type RegistrationStatus = 'Not Registered' | 'Applied / In Process' | 'Registered (Udyam)' | 'Registered (Other)'
export type BusinessNeed =
  | 'Startup funding'
  | 'Business expansion'
  | 'Working capital'
  | 'Equipment purchase'
  | 'Skill development'
  | 'Training'
  | 'Market access'
  | 'Women entrepreneurship support'
  | 'Rural entrepreneurship support'
  | 'Technology adoption'
  | 'Employment generation'
  | 'Loan/subsidy support'

export interface EntrepreneurProfile {
  category: Category
  gender: Gender
  state: string
  sector: string
  stage: BusinessStage
  firstTimeEntrepreneur: boolean
  /** Optional. Empty string = "prefer not to say" / unknown. */
  annualIncomeRange: IncomeRange
  /**
   * Self-identified special-group memberships (see `SpecialGroup`),
   * relevant only to schemes that define eligibility via
   * `Scheme.additionalEligibleGroups` alongside `categories`. Optional
   * and backward-compatible: omitted/undefined means "none indicated,"
   * never a negative claim, and a scheme with neither
   * `additionalEligibleGroups` nor `requiredSpecialGroups` never reads
   * this field at all — so every
   * existing caller that doesn't set it (all 3 demo profiles, every
   * existing test fixture) behaves exactly as before. Use
   * `deriveSpecialGroups()` to build this from the assessment's
   * `disabilityStatus`/`minorityStatus` answers rather than setting it
   * by hand.
   */
  specialGroups?: SpecialGroup[]
  /**
   * Special groups the applicant explicitly said do NOT apply to them
   * (answered "No"). Lets a scheme with `requiredSpecialGroups` tell
   * "said no" (a real fail) apart from "didn't answer" (missing info,
   * never an assumed no). Build with `deriveDeclinedSpecialGroups()`.
   */
  declinedSpecialGroups?: SpecialGroup[]
}

/**
 * Fields collected by the fuller assessment form (Basic Profile /
 * Business Information / Financial Information / Business Needs).
 *
 * Most of these are collected honestly for the record and for a future
 * scoring/guidance phase, but do NOT influence matchScore or
 * eligibilityStatus today — wiring one of them into scoring without a
 * reviewed weighting/criteria change would be fake eligibility logic
 * dressed up as a form field. Every field here is optional to advance
 * the wizard: `''` / `[]` / `null` all mean "not provided," which is a
 * legitimate, honest answer for a field the engine never required.
 *
 * EXCEPTION: `disabilityStatus` and `minorityStatus` ARE consumed by
 * the engine, via `deriveSpecialGroups()` → `EntrepreneurProfile.
 * specialGroups` — see that type's doc comment. They're still declared
 * here (not on `EntrepreneurProfile` directly) because the Yes/No
 * question the assessment asks and the boolean-ish flag the engine
 * scores against are different shapes; `deriveSpecialGroups()` is the
 * one place that maps between them.
 */
export interface AdditionalProfileDetails {
  // Step 1 — Basic Profile (category/gender/state live on the engine
  // fields below; this is everything else in that section).
  fullName: string
  age: number | ''
  district: string
  locationType: LocationType | ''
  disabilityStatus: YesNo | ''
  /** Self-identified religious/linguistic minority status. See `deriveSpecialGroups()`. */
  minorityStatus: YesNo | ''
  educationLevel: EducationLevel | ''

  // Step 2 — Business Information (sector/stage live on the engine
  // fields below; this is everything else in that section).
  businessName: string
  businessType: BusinessType | ''
  yearsInOperation: number | ''
  numberOfEmployees: number | ''
  annualTurnoverLakh: number | ''
  businessLocation: string
  registrationStatus: RegistrationStatus | ''

  // Step 3 — Financial Information (annualIncomeRange lives on the
  // engine fields below; this is everything else in that section).
  investmentRequiredLakh: number | ''
  existingLoan: YesNo | ''
  fundingRequirementLakh: number | ''
  creditRequirement: YesNo | ''
  subsidyRequirement: YesNo | ''

  // Step 4 — Business Needs (multi-select; no gating, empty = none selected yet).
  businessNeeds: BusinessNeed[]
}

/**
 * The in-progress profile held by the assessment wizard: every
 * eligibility-affecting field the engine consumes (category, gender,
 * state, sector, stage, firstTimeEntrepreneur) starts unselected
 * (`''` / `null`) — no silent defaults, because a scheme match computed
 * from a value the user never actually chose would be misleading —
 * plus every additional field the fuller assessment form collects
 * (see AdditionalProfileDetails), none of which gate the wizard.
 *
 * `annualIncomeRange` is the one engine field that's an exception:
 * `''` there is a real, honest answer ("prefer not to say"), not a
 * placeholder for "unset".
 *
 * Use `isProfileComplete()` to narrow this down before handing it to
 * the matching engine.
 */
export interface DraftEntrepreneurProfile extends AdditionalProfileDetails {
  category: Category | ''
  gender: Gender | ''
  state: string
  sector: string
  stage: BusinessStage | ''
  /** null = not yet explicitly answered (neither "yes" nor "no"). */
  firstTimeEntrepreneur: boolean | null
  annualIncomeRange: IncomeRange
}

/**
 * A DraftEntrepreneurProfile once every engine-relevant field has been
 * explicitly answered. Used (rather than EntrepreneurProfile directly)
 * as the isProfileComplete() predicate type so the narrowing stays
 * structurally valid — it's the same shape as DraftEntrepreneurProfile
 * with the engine fields narrowed to their completed types, so it's
 * still assignable to EntrepreneurProfile and can be passed straight
 * into matchSchemes().
 */
export type CompleteAssessmentProfile = AdditionalProfileDetails & EntrepreneurProfile

/**
 * True only once every eligibility-affecting field has been
 * explicitly set. Doubles as a type guard: once this returns true,
 * TypeScript narrows the draft to a `CompleteAssessmentProfile`
 * (structurally an `EntrepreneurProfile` plus the additional,
 * engine-independent fields).
 */
export function isProfileComplete(draft: DraftEntrepreneurProfile): draft is CompleteAssessmentProfile {
  return (
    draft.category !== '' &&
    draft.gender !== '' &&
    draft.state !== '' &&
    draft.sector !== '' &&
    draft.stage !== '' &&
    draft.firstTimeEntrepreneur !== null
  )
}

/**
 * Builds `EntrepreneurProfile.specialGroups` from the assessment's two
 * Yes/No intake questions. `'Yes'` is the only value that adds a group;
 * `''` (not answered) and `'No'` both mean "not indicated" — same
 * honest-by-default rule as every other optional field in this file,
 * never assumed. App code should call `toEngineProfile()` (below),
 * which applies this plus `deriveDeclinedSpecialGroups()`.
 */
export function deriveSpecialGroups(profile: {
  disabilityStatus: YesNo | ''
  minorityStatus: YesNo | ''
}): SpecialGroup[] {
  const groups: SpecialGroup[] = []
  if (profile.minorityStatus === 'Yes') groups.push('Minority')
  if (profile.disabilityStatus === 'Yes') groups.push('PwD')
  return groups
}

/** Groups explicitly answered "No" — `''` (not answered) is never treated as a no. */
export function deriveDeclinedSpecialGroups(profile: {
  disabilityStatus: YesNo | ''
  minorityStatus: YesNo | ''
}): SpecialGroup[] {
  const groups: SpecialGroup[] = []
  if (profile.minorityStatus === 'No') groups.push('Minority')
  if (profile.disabilityStatus === 'No') groups.push('PwD')
  return groups
}

/**
 * The one way the app turns a complete assessment into the engine's
 * input — every scoring call site (recommendations, dashboard, scheme
 * details, chat) goes through this so none can forget a derived field.
 */
export function toEngineProfile<P extends EntrepreneurProfile & { disabilityStatus: YesNo | ''; minorityStatus: YesNo | '' }>(
  profile: P
): P {
  return { ...profile, specialGroups: deriveSpecialGroups(profile), declinedSpecialGroups: deriveDeclinedSpecialGroups(profile) }
}

/**
 * A government scheme in the dataset.
 *
 * IMPORTANT (product rule): every real scheme must carry a real,
 * identifiable `officialUrl`. `isDemo: true` is reserved for
 * placeholder schemes that are NOT real government programs — those
 * must be labelled "DEMO SCHEME — NOT AN OFFICIAL GOVERNMENT SCHEME"
 * everywhere they're shown. The bundled dataset currently contains
 * only real, sourced schemes (isDemo: false throughout).
 */
export interface Scheme {
  id: string
  name: string
  isDemo: boolean
  /**
   * Administering ministry/department, when there's one clean, citable
   * answer. Display-only — never used by the matching engine. Left
   * undefined rather than guessed for schemes implemented by state
   * governments or multiple agencies, so the UI can honestly show "if
   * available" instead of a fabricated attribution.
   */
  ministry?: string
  /** Category codes this scheme targets, or ['Any'] if unrestricted. */
  categories: string[]
  /**
   * Additional eligibility groups this scheme's OWN official material
   * lists ALONGSIDE `categories` — e.g. Delhi's Composite Loan Scheme,
   * whose eligibility list is "SC/ST/OBC/Minorities/Persons with
   * Disabilities." An applicant matches the category criterion if they
   * match `categories` OR any group here (see
   * `EntrepreneurProfile.specialGroups`). Undefined/empty for every
   * scheme that doesn't need this — the vast majority — with engine
   * behavior for those schemes completely unchanged.
   */
  additionalEligibleGroups?: SpecialGroup[]
  /**
   * Genders that satisfy the category criterion ON THEIR OWN, alongside
   * `categories` — an OR, exactly like `additionalEligibleGroups`. For
   * schemes whose official rule mixes caste category and gender in one
   * gate, e.g. Stand-Up India: "SC/ST and/or woman entrepreneurs"
   * (standupmitra.in). Keeps `categories` limited to real Category
   * codes — a gender value in `categories` can never match, because
   * the engine compares it to `profile.category`.
   */
  additionalEligibleGenders?: Gender[]
  /**
   * Special groups an applicant MUST belong to (at least one) — an AND
   * on top of the category criterion, unlike the OR of
   * `additionalEligibleGroups`. For schemes that exist only for that
   * group, e.g. NDFDC loans: "Any Indian citizen with 40% or more
   * disability". Applicant said "No" → hard fail; didn't answer →
   * missing information (never an assumed no).
   */
  requiredSpecialGroups?: SpecialGroup[]
  /** Genders this scheme targets, or ['Any'] if unrestricted. */
  genders: string[]
  /** States this scheme is available in, or ['All'] if nationwide. */
  states: string[]
  /** Business sectors this scheme targets, or ['Any'] if unrestricted. */
  sectors: string[]
  /** Business stages this scheme targets, or ['Any'] if unrestricted. */
  stages: string[]
  firstTimeOnly: boolean
  /** Max eligible annual income in lakh INR, or null if uncapped. */
  maxIncomeLakh: number | null
  benefit: string
  summary: string
  /**
   * Optional, purely informational notes about ENHANCED support this
   * scheme offers to specific groups WITHOUT restricting base
   * eligibility to only those groups — e.g. a higher benefit tier for
   * women/minority/PwD/SC/ST founders under a scheme that's otherwise
   * open to everyone (`categories`/`genders` stay `['Any']`). NEVER
   * read by the matching engine, by design: this can never cause a
   * false hard-fail or misrepresent "extra support for X" as
   * "exclusive to X." Surfaced only as display text (see
   * `lib/schemes/describe-audience.ts`).
   */
  enhancedSupportFor?: { group: string; detail: string }[]
  /**
   * Optional, purely informational "data confidence" caveat — set only
   * for a scheme whose OWN sourcing comment in data/schemes.ts already
   * flags a genuine limitation (an unresolved figure, a tier not
   * separately stated, a primary source that couldn't be independently
   * verified). Never invented for a scheme that doesn't already carry
   * one. NEVER read by the matching engine, by design (see
   * `enhancedSupportFor` above for the same guarantee) — this can never
   * affect `matchScore` or `eligibilityStatus`. Surfaced only as a
   * small note via `components/schemes/data-confidence-note.tsx`.
   * Undefined (the default) for every scheme without a flagged caveat.
   */
  dataConfidenceNote?: string
  /** Required unless isDemo is true. */
  officialUrl: string | null
  /**
   * Real, sourced document/step lists, populated only for a small,
   * deliberately curated set of schemes (see data/schemes.ts) where an
   * official government source explicitly stated them — never
   * inferred or guessed. Undefined for every other scheme; the UI
   * (components/schemes/application-checklist.tsx) shows an honest
   * "not yet available" fallback rather than treating undefined as
   * "this scheme has no documents/steps."
   */
  requiredDocuments?: string[]
  applicationSteps?: string[]
  /**
   * ISO date (YYYY-MM-DD) requiredDocuments/applicationSteps were last
   * checked against sourceUrl. Set only alongside those two fields —
   * display-only metadata, never used by the matching engine.
   */
  lastVerified?: string
  /**
   * The specific official page/document requiredDocuments and/or
   * applicationSteps were verified against — may differ from
   * officialUrl (the general application/homepage link), since the
   * source that documents the process is sometimes a guidelines PDF
   * or a press release rather than the portal's homepage.
   */
  sourceUrl?: string
  /**
   * A direct link to the scheme's OWN official document-checklist file
   * (e.g. a portal's "Downloads" page), used only when SchemeSetu has
   * confirmed the file genuinely exists and is officially hosted, but
   * could not itself read/transcribe its contents (e.g. a bot-blocked
   * .docx) — so requiredDocuments is left unset rather than guessed,
   * and the UI links straight to the real file instead of generating a
   * PDF from unverified content. In practice mutually exclusive with
   * requiredDocuments: either the documents are known and cited, or the
   * source that has them is linked directly.
   */
  officialChecklistUrl?: string
}

export type EligibilityStatus =
  | 'Likely Eligible'
  | 'Possibly Eligible'
  | 'Low Match'
  | 'Insufficient Information'

export interface CriterionResult {
  key: 'category' | 'gender' | 'state' | 'sector' | 'stage' | 'firstTime' | 'income'
  label: string
}

export interface SchemeMatchResult {
  scheme: Scheme
  /** 0-100, deterministic weighted score. */
  matchScore: number
  eligibilityStatus: EligibilityStatus
  matchedCriteria: CriterionResult[]
  missingCriteria: CriterionResult[]
  failedCriteria: CriterionResult[]
}

export const CATEGORY_OPTIONS: Category[] = ['General', 'OBC', 'SC', 'ST']
export const GENDER_OPTIONS: Gender[] = ['Woman', 'Man', 'Transgender']
export const STAGE_OPTIONS: BusinessStage[] = ['Idea', 'Early', 'Growth', 'Established']

// `state` and `sector` are plain strings on EntrepreneurProfile (not
// literal unions) since the dataset may grow this list over time —
// these are just the options offered in the assessment form's selects.
export const STATE_OPTIONS: string[] = [
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Uttar Pradesh',
  'West Bengal',
  'Other',
]
export const SECTOR_OPTIONS: string[] = [
  'Manufacturing',
  'Services',
  'Trading',
  'Agriculture',
  'Food Processing',
  'Handicrafts',
  'Technology',
]
export const INCOME_RANGE_OPTIONS: { value: IncomeRange; label: string; representativeLakh: number | null }[] = [
  { value: '', label: 'Prefer not to say', representativeLakh: null },
  { value: 'below-1l', label: 'Below ₹1 lakh / year', representativeLakh: 0.5 },
  { value: '1-3l', label: '₹1 – 3 lakh / year', representativeLakh: 2 },
  { value: '3-5l', label: '₹3 – 5 lakh / year', representativeLakh: 4 },
  { value: '5-8l', label: '₹5 – 8 lakh / year', representativeLakh: 6.5 },
  { value: 'above-8l', label: 'Above ₹8 lakh / year', representativeLakh: 10 },
]

// --- Option lists for the additional (engine-independent) intake fields ---
export const LOCATION_TYPE_OPTIONS: LocationType[] = ['Rural', 'Urban']
export const YES_NO_OPTIONS: YesNo[] = ['Yes', 'No']
export const EDUCATION_LEVEL_OPTIONS: EducationLevel[] = [
  'Below 10th',
  '10th Pass',
  '12th Pass',
  'Diploma',
  'Graduate',
  'Postgraduate',
  'Other',
]
export const BUSINESS_TYPE_OPTIONS: BusinessType[] = [
  'Sole Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited Company',
  'Self-Help Group (SHG)',
  'Cooperative',
  'Not registered yet',
]
export const REGISTRATION_STATUS_OPTIONS: RegistrationStatus[] = [
  'Not Registered',
  'Applied / In Process',
  'Registered (Udyam)',
  'Registered (Other)',
]
export const BUSINESS_NEED_OPTIONS: BusinessNeed[] = [
  'Startup funding',
  'Business expansion',
  'Working capital',
  'Equipment purchase',
  'Skill development',
  'Training',
  'Market access',
  'Women entrepreneurship support',
  'Rural entrepreneurship support',
  'Technology adoption',
  'Employment generation',
  'Loan/subsidy support',
]
