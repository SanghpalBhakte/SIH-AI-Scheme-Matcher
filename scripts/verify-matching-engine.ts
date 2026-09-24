// Standalone verification for the matching engine — no test framework
// required yet. Run with `npm run verify:engine`.
//
// This is how we "verify before claiming it works" per the delivery
// rules: it exercises the engine against the 3 demo profiles and the
// full scheme dataset, and sanity-checks structural invariants.

import { evaluateScheme, matchSchemes } from '../lib/matching/engine'
import type { Scheme } from '../lib/matching/types'
import { CATEGORY_OPTIONS, GENDER_OPTIONS, toEngineProfile } from '../lib/matching/types'
import { schemes } from '../data/schemes'
import { demoProfiles } from '../data/demoProfiles'
import { TOTAL_WEIGHT } from '../lib/matching/weights'
import { describeAudience } from '../lib/schemes/describe-audience'

let failures = 0

function assert(condition: boolean, message: string) {
  if (!condition) {
    failures++
    console.error(`  ✗ ${message}`)
  } else {
    console.log(`  ✓ ${message}`)
  }
}

console.log(`Dataset: ${schemes.length} schemes, all isDemo=false: ${schemes.every((s) => !s.isDemo)}`)
console.log(`Every real scheme has an officialUrl: ${schemes.every((s) => s.isDemo || !!s.officialUrl)}`)
console.log(`TOTAL_WEIGHT = ${TOTAL_WEIGHT} (should be 100)\n`)

for (const demo of demoProfiles) {
  console.log(`\n=== ${demo.label} (${demo.id}) ===`)
  const results = matchSchemes(demo.profile, schemes)

  assert(results.length === schemes.length, 'engine returns a result for every scheme (never silently drops one)')

  const sorted = results.every((r, i) => i === 0 || results[i - 1].matchScore >= r.matchScore)
  assert(sorted, 'results are sorted by matchScore descending')

  const scoresInRange = results.every((r) => r.matchScore >= 0 && r.matchScore <= 100)
  assert(scoresInRange, 'every matchScore is within 0-100')

  const criteriaAccountedFor = results.every(
    (r) =>
      r.matchedCriteria.length + r.missingCriteria.length + r.failedCriteria.length === 7 // 7 evaluated criteria
  )
  assert(criteriaAccountedFor, 'every scheme has exactly 7 criteria accounted for (matched+missing+failed)')

  const HARD_FAIL_KEYS = new Set(['category', 'gender', 'state', 'firstTime', 'income'])
  const lowMatchHasFailReason = results
    .filter((r) => r.failedCriteria.some((c) => HARD_FAIL_KEYS.has(c.key)))
    .every((r) => r.eligibilityStatus === 'Low Match')
  assert(lowMatchHasFailReason, 'any scheme with a failed hard-criterion (category/gender/state/firstTime/income) is labelled "Low Match"')

  console.log('\nTop 3 recommendations:')
  for (const r of results.slice(0, 3)) {
    console.log(`  - ${r.scheme.name}`)
    console.log(`      matchScore: ${r.matchScore}  status: ${r.eligibilityStatus}`)
    console.log(`      matched:  ${r.matchedCriteria.map((c) => c.label).join(' | ')}`)
    if (r.missingCriteria.length) console.log(`      missing:  ${r.missingCriteria.map((c) => c.label).join(' | ')}`)
    if (r.failedCriteria.length) console.log(`      failed:   ${r.failedCriteria.map((c) => c.label).join(' | ')}`)
  }
}

// Sanity check (informational, not a strict requirement): which of the
// 4 eligibility statuses actually occur across the demo profiles.
const allStatuses = new Set<string>()
for (const demo of demoProfiles) {
  for (const r of matchSchemes(demo.profile, schemes)) allStatuses.add(r.eligibilityStatus)
}
console.log('\nStatuses observed across the 3 demo profiles:', [...allStatuses].join(', '))
console.log(
  '(none of the bundled demo profiles happen to leave income blank against an unrestricted,\n' +
    ' income-capped scheme, so "Insufficient Information" never appears above — verified directly below instead.)'
)

// Direct check: "Insufficient Information" is reachable in principle.
// (It requires income left blank against a scheme that caps income but
// is otherwise unrestricted — none of the 3 demo profiles hit this
// combination, since every income-capped scheme in the dataset also
// restricts by category/gender/first-time.)
console.log('\n=== Direct check: Insufficient Information path ===')
const syntheticScheme: Scheme = {
  id: 'synthetic-income-capped',
  name: 'Synthetic income-capped scheme (test fixture, not real)',
  isDemo: true,
  categories: ['Any'],
  genders: ['Any'],
  states: ['All'],
  sectors: ['Any'],
  stages: ['Any'],
  firstTimeOnly: false,
  maxIncomeLakh: 3,
  benefit: 'n/a',
  summary: 'n/a',
  officialUrl: null,
}
const syntheticResult = evaluateScheme(
  { category: 'General', gender: 'Man', state: 'Delhi', sector: 'Services', stage: 'Early', firstTimeEntrepreneur: false, annualIncomeRange: '' },
  syntheticScheme
)
console.log(`  status: ${syntheticResult.eligibilityStatus} (score ${syntheticResult.matchScore})`)
assert(
  syntheticResult.eligibilityStatus === 'Insufficient Information',
  '"Insufficient Information" is produced when income is unknown against an otherwise-open, income-capped scheme'
)

// Direct check: the Gujarat "Scheme for Assistance for Startups /
// Innovation" scheme is state-scoped correctly — a Gujarat early-stage
// applicant should see it as a real state match, while an applicant
// from any other state should get a hard state-fail (Low Match), never
// a silent drop. Uses the real dataset entry, not a synthetic fixture,
// since this is checking a specific scheme's actual state list.
console.log('\n=== Direct check: Gujarat scheme is state-scoped correctly ===')
const gujaratScheme = schemes.find((s) => s.id === 'gujarat-scheme-for-assistance-startups')
if (!gujaratScheme) {
  failures++
  console.error('  ✗ gujarat-scheme-for-assistance-startups exists in the dataset')
} else {
  console.log('  ✓ gujarat-scheme-for-assistance-startups exists in the dataset')

  const gujaratApplicant = evaluateScheme(
    { category: 'General', gender: 'Woman', state: 'Gujarat', sector: 'Technology', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: '' },
    gujaratScheme
  )
  assert(
    gujaratApplicant.matchedCriteria.some((c) => c.key === 'state'),
    'a Gujarat early-stage applicant gets a real state match on the Gujarat scheme'
  )
  assert(
    gujaratApplicant.eligibilityStatus !== 'Low Match',
    'a Gujarat early-stage applicant is not hard-failed on the Gujarat scheme'
  )

  const otherStateApplicant = evaluateScheme(
    { category: 'General', gender: 'Woman', state: 'Kerala', sector: 'Technology', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: '' },
    gujaratScheme
  )
  assert(
    otherStateApplicant.failedCriteria.some((c) => c.key === 'state'),
    'a non-Gujarat applicant gets a hard state-fail on the Gujarat scheme (never silently matched)'
  )
  assert(
    otherStateApplicant.eligibilityStatus === 'Low Match',
    'a non-Gujarat applicant is correctly labelled "Low Match" on the Gujarat scheme, not silently dropped'
  )
}

// Direct check: the Delhi "Composite Loan Scheme" is income-capped and
// category-scoped correctly — a low-income SC applicant from Delhi should
// see a real category+income match, while a General-category applicant
// (not in the scheme's SC/ST/OBC list) gets a hard category-fail, and a
// high-income SC applicant from Delhi gets a hard income-fail. Uses the
// real dataset entry, since this checks that specific scheme's actual
// category list and income cap.
console.log('\n=== Direct check: Delhi Composite Loan Scheme is category/income-scoped correctly ===')
const delhiScheme = schemes.find((s) => s.id === 'delhi-composite-loan-scheme')
if (!delhiScheme) {
  failures++
  console.error('  ✗ delhi-composite-loan-scheme exists in the dataset')
} else {
  console.log('  ✓ delhi-composite-loan-scheme exists in the dataset')

  const eligibleApplicant = evaluateScheme(
    { category: 'SC', gender: 'Woman', state: 'Delhi', sector: 'Services', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: 'below-1l' },
    delhiScheme
  )
  assert(
    eligibleApplicant.matchedCriteria.some((c) => c.key === 'category') &&
      eligibleApplicant.matchedCriteria.some((c) => c.key === 'income'),
    'a low-income SC applicant from Delhi gets a real category+income match on the Composite Loan Scheme'
  )

  const generalCategoryApplicant = evaluateScheme(
    { category: 'General', gender: 'Man', state: 'Delhi', sector: 'Services', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: 'below-1l' },
    delhiScheme
  )
  assert(
    generalCategoryApplicant.failedCriteria.some((c) => c.key === 'category') &&
      generalCategoryApplicant.eligibilityStatus === 'Low Match',
    'a General-category applicant gets a hard category-fail ("Low Match") on the Composite Loan Scheme, not a silent drop'
  )

  // A General-category applicant who indicates Minority status should
  // still pass the category criterion — Delhi's scheme accepts
  // Minority applicants via additionalEligibleGroups even though
  // "Minority" isn't a value of the Category type. This is the schema
  // gap this pass closes: before, this exact applicant would have been
  // wrongly hard-failed.
  const minorityApplicant = evaluateScheme(
    {
      category: 'General',
      gender: 'Woman',
      state: 'Delhi',
      sector: 'Services',
      stage: 'Early',
      firstTimeEntrepreneur: true,
      annualIncomeRange: 'below-1l',
      specialGroups: ['Minority'],
    },
    delhiScheme
  )
  assert(
    minorityApplicant.matchedCriteria.some((c) => c.key === 'category') &&
      minorityApplicant.eligibilityStatus !== 'Low Match',
    'a General-category applicant who indicates Minority status gets a real category match on the Composite Loan Scheme (not hard-failed)'
  )

  // Same check for PwD status — a General-category, non-minority
  // applicant who indicates a disability should also pass via
  // additionalEligibleGroups.
  const pwdApplicant = evaluateScheme(
    {
      category: 'General',
      gender: 'Man',
      state: 'Delhi',
      sector: 'Services',
      stage: 'Early',
      firstTimeEntrepreneur: true,
      annualIncomeRange: 'below-1l',
      specialGroups: ['PwD'],
    },
    delhiScheme
  )
  assert(
    pwdApplicant.matchedCriteria.some((c) => c.key === 'category') &&
      pwdApplicant.eligibilityStatus !== 'Low Match',
    'a General-category applicant who indicates PwD status gets a real category match on the Composite Loan Scheme (not hard-failed)'
  )

  // A General-category applicant who claims NEITHER Minority nor PwD
  // status must still hard-fail — additionalEligibleGroups only helps
  // applicants who actually indicate one of those groups, never
  // everyone by default. Guards against the widened category check
  // accidentally becoming an open door.
  const unclaimedApplicant = evaluateScheme(
    {
      category: 'General',
      gender: 'Man',
      state: 'Delhi',
      sector: 'Services',
      stage: 'Early',
      firstTimeEntrepreneur: true,
      annualIncomeRange: 'below-1l',
      specialGroups: [],
    },
    delhiScheme
  )
  assert(
    unclaimedApplicant.failedCriteria.some((c) => c.key === 'category') &&
      unclaimedApplicant.eligibilityStatus === 'Low Match',
    'a General-category applicant with specialGroups explicitly empty still gets a hard category-fail (no free pass)'
  )

  // Regression guard (2026-09-02 audit): app/schemes/[id]/page.tsx was
  // found calling evaluateScheme(profile, scheme) WITHOUT spreading
  // specialGroups: deriveSpecialGroups(profile) — unlike dashboard and
  // recommendations, which both do. A Minority/PwD applicant therefore
  // saw a real match on /recommendations but "Low Match" on the
  // scheme's own detail page for the exact same profile. This asserts
  // the failure mode directly: a profile with specialGroups simply
  // omitted (exactly what `profile` looks like straight from
  // useAssessment(), before deriveSpecialGroups() is applied) MUST
  // still hard-fail here — proving that spreading deriveSpecialGroups()
  // in is not optional at any of the 4 call sites, and giving future
  // changes something concrete to break if a 5th call site ever misses
  // it again.
  const specialGroupsOmittedApplicant = evaluateScheme(
    { category: 'General', gender: 'Woman', state: 'Delhi', sector: 'Services', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: 'below-1l' },
    delhiScheme
  )
  assert(
    specialGroupsOmittedApplicant.failedCriteria.some((c) => c.key === 'category') &&
      specialGroupsOmittedApplicant.eligibilityStatus === 'Low Match',
    'a Minority/PwD-eligible profile with specialGroups left unset (the exact shape of a raw, un-derived assessment profile) hard-fails — documents why every evaluateScheme() call site must spread deriveSpecialGroups(profile)'
  )
}

// Direct check: enhancedSupportFor (Gujarat, AP) is purely informational
// — it must never cause a general applicant to be hard-blocked, and the
// UI-facing "who's this for" text must surface it without narrowing
// eligibility. This is the "extra support for women, not exclusive to
// women" requirement.
console.log('\n=== Direct check: enhancedSupportFor never blocks a general applicant ===')
const gujaratSchemeForEnhanced = schemes.find((s) => s.id === 'gujarat-scheme-for-assistance-startups')
const apScheme = schemes.find((s) => s.id === 'andhra-pradesh-innovation-startup-grant')
if (!gujaratSchemeForEnhanced || !apScheme) {
  failures++
  console.error('  ✗ both gujarat-scheme-for-assistance-startups and andhra-pradesh-innovation-startup-grant exist in the dataset')
} else {
  assert(
    (gujaratSchemeForEnhanced.enhancedSupportFor?.length ?? 0) > 0 && (apScheme.enhancedSupportFor?.length ?? 0) > 0,
    'both schemes carry a structured enhancedSupportFor entry describing their higher-tier support'
  )

  const generalManApplicant = evaluateScheme(
    { category: 'General', gender: 'Man', state: 'Gujarat', sector: 'Technology', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: '' },
    gujaratSchemeForEnhanced
  )
  assert(
    generalManApplicant.matchedCriteria.some((c) => c.key === 'gender') && generalManApplicant.eligibilityStatus !== 'Low Match',
    'a General-category Man still gets a real gender match on the Gujarat scheme — the women-only enhancedSupportFor tier does not narrow base eligibility'
  )

  const generalManApplicantAP = evaluateScheme(
    { category: 'General', gender: 'Man', state: 'Andhra Pradesh', sector: 'Technology', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: '' },
    apScheme
  )
  assert(
    generalManApplicantAP.eligibilityStatus !== 'Low Match',
    'a General-category Man still matches the AP Startup Grant — the underrepresented-founder enhancedSupportFor tier does not narrow base eligibility'
  )

  const audienceLines = describeAudience(gujaratSchemeForEnhanced)
  assert(
    audienceLines.some((l) => l.includes('Enhanced support') && l.includes('Women')),
    'describeAudience() surfaces the enhanced-support note for the Gujarat scheme without changing the eligibility lines above it'
  )
}

// Direct check: Maharashtra CMEGP is state-scoped and first-time-scoped
// correctly. Uses the real dataset entry, since this checks that
// specific scheme's actual state list and firstTimeOnly setting.
console.log('\n=== Direct check: Maharashtra CMEGP is state/first-time-scoped correctly ===')
const cmegpScheme = schemes.find((s) => s.id === 'maharashtra-cmegp')
if (!cmegpScheme) {
  failures++
  console.error('  ✗ maharashtra-cmegp exists in the dataset')
} else {
  console.log('  ✓ maharashtra-cmegp exists in the dataset')

  // An eligible Maharashtra applicant (any category — CMEGP is open,
  // not category-restricted) gets a real match, not hard-failed.
  const eligibleMaharashtraApplicant = evaluateScheme(
    { category: 'General', gender: 'Man', state: 'Maharashtra', sector: 'Manufacturing', stage: 'Idea', firstTimeEntrepreneur: true, annualIncomeRange: '' },
    cmegpScheme
  )
  assert(
    eligibleMaharashtraApplicant.matchedCriteria.some((c) => c.key === 'state') &&
      eligibleMaharashtraApplicant.eligibilityStatus !== 'Low Match',
    'a first-time Maharashtra applicant gets a real state match on CMEGP and is not hard-failed'
  )

  // A second eligible Maharashtra applicant from the enhanced-support
  // tier (SC, woman) also gets a real match — confirms enhancedSupportFor
  // groups remain fully eligible, not just tolerated.
  const enhancedTierApplicant = evaluateScheme(
    { category: 'SC', gender: 'Woman', state: 'Maharashtra', sector: 'Services', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: '' },
    cmegpScheme
  )
  assert(
    enhancedTierApplicant.matchedCriteria.some((c) => c.key === 'category') &&
      enhancedTierApplicant.eligibilityStatus !== 'Low Match',
    'an SC woman applicant from Maharashtra (the enhanced-support tier) also gets a real category match on CMEGP'
  )

  // A non-Maharashtra applicant must hard-fail state, never silently
  // matched or dropped.
  const nonMaharashtraApplicant = evaluateScheme(
    { category: 'General', gender: 'Man', state: 'Kerala', sector: 'Manufacturing', stage: 'Idea', firstTimeEntrepreneur: true, annualIncomeRange: '' },
    cmegpScheme
  )
  assert(
    nonMaharashtraApplicant.failedCriteria.some((c) => c.key === 'state') &&
      nonMaharashtraApplicant.eligibilityStatus === 'Low Match',
    'a non-Maharashtra applicant gets a hard state-fail on CMEGP, correctly labelled "Low Match"'
  )

  // A Maharashtra applicant who is NOT first-time (evidenced restriction:
  // "should not have availed subsidy of any Central or State Government
  // scheme") must hard-fail firstTime — the engine must not fabricate
  // eligibility for a profile condition the official source doesn't
  // support.
  const repeatApplicant = evaluateScheme(
    { category: 'General', gender: 'Man', state: 'Maharashtra', sector: 'Manufacturing', stage: 'Idea', firstTimeEntrepreneur: false, annualIncomeRange: '' },
    cmegpScheme
  )
  assert(
    repeatApplicant.failedCriteria.some((c) => c.key === 'firstTime') && repeatApplicant.eligibilityStatus === 'Low Match',
    'a non-first-time Maharashtra applicant gets a hard firstTime-fail on CMEGP, not fabricated eligibility'
  )

  // Sector is SOFT for this scheme (only state/firstTime/category/gender/
  // income are hard-fail keys) — a Maharashtra applicant in an
  // unsupported sector (e.g. Agriculture, not Manufacturing/Services)
  // should see a failed sector criterion WITHOUT being hard-blocked to
  // "Low Match" on that basis alone, and without any income-related
  // claim being fabricated (CMEGP states no income cap).
  const unsupportedSectorApplicant = evaluateScheme(
    { category: 'General', gender: 'Man', state: 'Maharashtra', sector: 'Agriculture', stage: 'Idea', firstTimeEntrepreneur: true, annualIncomeRange: '' },
    cmegpScheme
  )
  assert(
    unsupportedSectorApplicant.failedCriteria.some((c) => c.key === 'sector') &&
      !unsupportedSectorApplicant.failedCriteria.some((c) => c.key === 'income') &&
      unsupportedSectorApplicant.matchedCriteria.some((c) => c.key === 'income'),
    "an unsupported-sector Maharashtra applicant gets an honest sector fail (soft, doesn't force Low Match) with no fabricated income restriction"
  )
}

console.log('\n=== Direct check: no duplicate scheme records (2026-09-02 audit) ===')
{
  // General safeguard, not just Udyogini-specific: two dataset entries
  // with the IDENTICAL name (not just a shared officialUrl — several
  // legitimately distinct schemes, like the 3 MUDRA loan tranches,
  // correctly share one portal URL) mean the same real-world scheme was
  // entered twice — exactly the bug found this audit (two "Udyogini
  // Scheme" entries, one wrongly marked nationwide). Catch any
  // recurrence automatically.
  const nameCounts = new Map<string, string[]>()
  for (const s of schemes) {
    nameCounts.set(s.name, [...(nameCounts.get(s.name) ?? []), s.id])
  }
  const duplicateNames = [...nameCounts.entries()].filter(([, ids]) => ids.length > 1)
  assert(duplicateNames.length === 0, `no two schemes share an identical name (found: ${JSON.stringify(duplicateNames)})`)

  assert(schemes.length === 34, `dataset has exactly 34 schemes after the Udyogini consolidation (got ${schemes.length})`)
  assert(schemes.find((s) => s.id === 'udyogini') === undefined, 'the old nationwide-mismarked "udyogini" id no longer exists')

  const karnatakaUdyogini = schemes.find((s) => s.id === 'karnataka-udyogini')
  assert(!!karnatakaUdyogini, 'karnataka-udyogini exists as the single canonical Udyogini entry')
  assert(
    JSON.stringify(karnatakaUdyogini?.states) === JSON.stringify(['Karnataka']),
    'karnataka-udyogini is correctly state-scoped to Karnataka only (not nationwide)'
  )

  if (karnatakaUdyogini) {
    const karnatakaApplicant = evaluateScheme(
      { category: 'General', gender: 'Woman', state: 'Karnataka', sector: 'Trading', stage: 'Idea', firstTimeEntrepreneur: false, annualIncomeRange: 'below-1l' },
      karnatakaUdyogini
    )
    assert(
      karnatakaApplicant.matchedCriteria.some((c) => c.key === 'state' && c.label === 'Available in Karnataka'),
      'a Karnataka woman applicant gets a real, honestly-labelled state match on karnataka-udyogini (not "available nationwide")'
    )

    const nonKarnatakaApplicant = evaluateScheme(
      { category: 'General', gender: 'Woman', state: 'Bihar', sector: 'Trading', stage: 'Idea', firstTimeEntrepreneur: false, annualIncomeRange: 'below-1l' },
      karnatakaUdyogini
    )
    assert(
      nonKarnatakaApplicant.failedCriteria.some((c) => c.key === 'state') && nonKarnatakaApplicant.eligibilityStatus === 'Low Match',
      'a non-Karnataka applicant correctly hard-fails state on karnataka-udyogini — proves the false nationwide match is gone'
    )
  }
}

console.log('\n=== Direct check: dataset uses only valid category/gender codes (2026-09-24 scan) ===')
{
  const validCategories = new Set<string>([...CATEGORY_OPTIONS, 'Any'])
  const validGenders = new Set<string>([...GENDER_OPTIONS, 'Any'])
  const badCategories = schemes.flatMap((s) => s.categories.filter((c) => !validCategories.has(c)).map((c) => `${s.id}:${c}`))
  const badGenders = schemes.flatMap((s) =>
    [...s.genders, ...(s.additionalEligibleGenders ?? [])].filter((g) => !validGenders.has(g)).map((g) => `${s.id}:${g}`)
  )
  assert(badCategories.length === 0, `every scheme.categories value is a real Category code or 'Any' (bad: ${JSON.stringify(badCategories)})`)
  assert(badGenders.length === 0, `every scheme gender value is a real Gender or 'Any' (bad: ${JSON.stringify(badGenders)})`)
}

console.log('\n=== Direct check: Stand-Up India is "SC/ST and/or women" (2026-09-24 scan) ===')
{
  const standUp = schemes.find((s) => s.id === 'stand-up-india')
  assert(!!standUp, 'stand-up-india exists in the dataset')
  if (standUp) {
    const base = { state: 'Bihar', sector: 'Services', stage: 'Idea' as const, firstTimeEntrepreneur: true, annualIncomeRange: '1-3l' as const }
    for (const category of ['General', 'OBC', 'SC', 'ST'] as const) {
      const r = evaluateScheme({ ...base, category, gender: 'Woman' }, standUp)
      assert(
        r.matchedCriteria.some((c) => c.key === 'category') && r.eligibilityStatus === 'Likely Eligible',
        `a first-time ${category} woman is Likely Eligible for Stand-Up India (got ${r.eligibilityStatus})`
      )
    }
    for (const category of ['SC', 'ST'] as const) {
      const r = evaluateScheme({ ...base, category, gender: 'Man' }, standUp)
      assert(
        r.matchedCriteria.some((c) => c.key === 'category') && r.eligibilityStatus === 'Likely Eligible',
        `a first-time ${category} man is Likely Eligible for Stand-Up India (got ${r.eligibilityStatus})`
      )
    }
    for (const category of ['General', 'OBC'] as const) {
      const r = evaluateScheme({ ...base, category, gender: 'Man' }, standUp)
      assert(
        r.failedCriteria.some((c) => c.key === 'category' && c.label.includes('women of any category')) &&
          r.eligibilityStatus === 'Low Match',
        `a ${category} man hard-fails Stand-Up India with an honest "SC/ST or women" reason`
      )
    }
    assert(
      describeAudience(standUp).some((line) => line.includes('women entrepreneurs of any category')),
      'describeAudience() tells users Stand-Up India is open to women of any category'
    )
  }
}

console.log('\n=== Direct check: NDFDC is only for persons with disabilities (2026-09-24 scan) ===')
{
  const ndfdc = schemes.find((s) => s.id === 'ndfdc-disability')
  assert(!!ndfdc, 'ndfdc-disability exists in the dataset')
  if (ndfdc) {
    const base = {
      category: 'General' as const,
      gender: 'Woman' as const,
      state: 'Bihar',
      sector: 'Trading',
      stage: 'Idea' as const,
      firstTimeEntrepreneur: false,
      annualIncomeRange: '' as const,
      minorityStatus: '' as const,
    }
    const yes = evaluateScheme(toEngineProfile({ ...base, disabilityStatus: 'Yes' }), ndfdc)
    assert(
      yes.matchedCriteria.some((c) => c.key === 'category' && c.label.includes('persons with disabilities')) &&
        yes.eligibilityStatus === 'Likely Eligible',
      `an applicant who answered Yes to disability is Likely Eligible for NDFDC (got ${yes.eligibilityStatus})`
    )
    const no = evaluateScheme(toEngineProfile({ ...base, disabilityStatus: 'No' }), ndfdc)
    assert(
      no.failedCriteria.some((c) => c.key === 'category') && no.eligibilityStatus === 'Low Match',
      `an applicant who answered No to disability hard-fails NDFDC (got ${no.eligibilityStatus})`
    )
    const unanswered = evaluateScheme(toEngineProfile({ ...base, disabilityStatus: '' }), ndfdc)
    assert(
      unanswered.missingCriteria.some((c) => c.key === 'category') &&
        unanswered.eligibilityStatus === 'Insufficient Information',
      `an applicant who skipped the disability question gets "Insufficient Information", never an assumed yes/no (got ${unanswered.eligibilityStatus})`
    )
    const bare = evaluateScheme({ ...base }, ndfdc)
    assert(bare.eligibilityStatus !== 'Likely Eligible', 'a profile with no special-group info at all (e.g. a demo profile) is never "Likely Eligible" for NDFDC')
    assert(
      describeAudience(ndfdc).some((line) => line.includes('Only for persons with disabilities')),
      'describeAudience() says NDFDC is only for persons with disabilities'
    )
    for (const r of [yes, no, unanswered]) {
      assert(r.matchedCriteria.length + r.missingCriteria.length + r.failedCriteria.length === 7, 'the PwD gate keeps exactly 7 criteria')
    }
  }
  // Delhi's OR rule (additionalEligibleGroups) must be untouched by the new AND gate.
  const delhi = schemes.find((s) => s.id === 'delhi-composite-loan-scheme')!
  const delhiPwd = evaluateScheme(
    toEngineProfile({ category: 'General', gender: 'Man', state: 'Delhi', sector: 'Services', stage: 'Early', firstTimeEntrepreneur: true, annualIncomeRange: 'below-1l', disabilityStatus: 'Yes', minorityStatus: 'No' }),
    delhi
  )
  assert(delhiPwd.matchedCriteria.some((c) => c.key === 'category'), 'Delhi Composite Loan still matches a General-category PwD applicant (OR rule intact)')
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`)
process.exit(failures === 0 ? 0 : 1)
