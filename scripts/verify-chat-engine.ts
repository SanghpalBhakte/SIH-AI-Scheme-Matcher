// Standalone verification for the chatbot's deterministic query engine
// — no test framework required, mirrors scripts/verify-matching-engine.ts.
// Run with `npm run verify:chat-engine`.
//
// Every check here is against REAL data (data/schemes.ts,
// data/demoProfiles.ts), never hardcoded scheme IDs where avoidable —
// same reasoning as the matching-engine script: if the dataset changes,
// this should still tell the truth rather than silently going stale.

import { answerQuery, FALLBACK_HELP } from '../lib/chat/engine'
import { buildChatContext, type ChatAppContext } from '../lib/chat/context-adapter'
import { classifyIntent } from '../lib/chat/intents'
import { detectSchemeName } from '../lib/chat/scheme-lookup'
import type { ChatSession } from '../lib/chat/types'
import { schemes } from '../data/schemes'
import { demoProfiles } from '../data/demoProfiles'
import type { DraftEntrepreneurProfile } from '../lib/matching/types'

let failures = 0
function assert(condition: boolean, message: string) {
  if (!condition) {
    failures++
    console.error(`  ✗ ${message}`)
  } else {
    console.log(`  ✓ ${message}`)
  }
}

const EMPTY_SESSION: ChatSession = { lastSchemeId: null, lastIntent: null }
const NO_PROFILE_CONTEXT: ChatAppContext = {
  profileComplete: false,
  completeProfile: null,
  recommendations: null,
  selectedScheme: null,
}

function draftFrom(profile: (typeof demoProfiles)[number]['profile']): DraftEntrepreneurProfile {
  // Demo profiles only carry the engine-relevant fields; pad the rest
  // with honest "not provided" values, same as loadProfile() does in
  // assessment-context.tsx.
  return {
    ...profile,
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
}

console.log('=== classifyIntent ===')
const INTENT_CASES: [string, string][] = [
  ['why was this scheme recommended?', 'recommendation_reason'],
  ['what documents do I need?', 'required_documents'],
  ['how do I apply?', 'application_steps'],
  ['what benefits do I get?', 'scheme_benefits'],
  ["what's the eligibility criteria for PMEGP?", 'scheme_eligibility'],
  ['what schemes am I eligible for?', 'eligible_schemes'],
  ['explain this scheme', 'scheme_explanation'],
  ['what should I do next?', 'next_action'],
  ['help', 'general_help'],
  ['what is the weather today', 'unknown'],
  // 2026-09-24: yes/no questions about ONE scheme
  ['Am I eligible for this scheme?', 'personal_eligibility'],
  ['am i eligible for pmegp', 'personal_eligibility'],
  ['Do I qualify for Stand-Up India?', 'personal_eligibility'],
  ['Can I apply for this?', 'personal_eligibility'],
  ['Is this scheme right for me?', 'personal_eligibility'],
  ['which schemes do I qualify for?', 'eligible_schemes'],
  ['what do I qualify for?', 'eligible_schemes'],
  ['how can I apply?', 'application_steps'],
]
for (const [text, expected] of INTENT_CASES) {
  assert(classifyIntent(text) === expected, `"${text}" -> ${expected}`)
}

console.log('\n=== detectSchemeName ===')
const pmegp = schemes.find((s) => s.id === 'pmegp')!
const standUp = schemes.find((s) => s.id === 'stand-up-india')!
assert(detectSchemeName('tell me about pmegp', schemes)?.id === 'pmegp', 'finds PMEGP by id token')
assert(detectSchemeName('what about stand-up india scheme', schemes)?.id === 'stand-up-india', 'finds Stand-Up India by name tokens')
assert(detectSchemeName('asdkjqwlekj random gibberish', schemes) === null, 'returns null for unrelated text')

// 2026-09-02 audit: after consolidating the duplicate Udyogini records,
// "udyogini" should resolve to the single surviving, correctly
// Karnataka-scoped entry rather than a removed or ambiguous one.
assert(
  detectSchemeName('what is the udyogini scheme eligibility', schemes)?.id === 'karnataka-udyogini',
  'finds the consolidated Karnataka Udyogini scheme by name'
)

// 2026-09-02 audit: a fully generic multi-scheme word ("startup")
// should no longer confidently resolve to one specific, state-
// restricted scheme out of several that share the word — the chat
// layer should ask a clarifying question instead of guessing.
assert(
  detectSchemeName('tell me about the startup scheme', schemes) === null,
  'a generic "startup scheme" query does not confidently resolve to one specific scheme'
)
assert(
  detectSchemeName('tell me about the startups scheme', schemes) === null,
  'a generic "startups scheme" query does not confidently resolve to one specific scheme either'
)
{
  const answer = answerQuery('tell me about the startup scheme', NO_PROFILE_CONTEXT, EMPTY_SESSION, schemes)
  assert(/not sure which scheme/i.test(answer.text), 'the chat layer asks a clarifying question for the ambiguous "startup scheme" query, rather than picking one')
}

console.log('\n=== answerQuery: no profile ===')
{
  const answer = answerQuery('what schemes am I eligible for?', NO_PROFILE_CONTEXT, EMPTY_SESSION, schemes)
  assert(/profile/i.test(answer.text), 'eligible_schemes with no profile explains a profile is needed')
  assert(!!answer.actions?.some((a) => a.href === '/assessment'), 'offers a "Complete assessment" action')
}

console.log('\n=== answerQuery: eligible_schemes with a complete profile ===')
for (const demo of demoProfiles) {
  const draft = draftFrom(demo.profile)
  const context = buildChatContext({ profile: draft, isHydrated: true, pathname: '/', schemes })
  assert(context.profileComplete, `${demo.id}: context reports profile complete`)
  const answer = answerQuery('what schemes am I eligible for?', context, EMPTY_SESSION, schemes)
  const strongCount = (context.recommendations ?? []).filter(
    (r) => r.eligibilityStatus === 'Likely Eligible' || r.eligibilityStatus === 'Possibly Eligible'
  ).length
  if (strongCount > 0) {
    assert(/good fit/i.test(answer.text), `${demo.id}: has strong matches -> "good fit" wording`)
    assert(!!answer.actions?.some((a) => a.href === '/recommendations'), `${demo.id}: links to /recommendations`)
  } else {
    assert(/none of the schemes.*strong match/i.test(answer.text), `${demo.id}: no strong match -> honest "none" wording`)
    assert(/closest are/i.test(answer.text), `${demo.id}: still names the closest scheme(s)`)
    assert((answer.actions?.length ?? 0) > 0, `${demo.id}: still offers at least one scheme link`)
  }
}

console.log('\n=== answerQuery: scheme-specific intents ===')
{
  const context: ChatAppContext = { ...NO_PROFILE_CONTEXT, selectedScheme: pmegp }
  const explain = answerQuery('explain this scheme', context, EMPTY_SESSION, schemes)
  assert(explain.text.includes(pmegp.summary), 'scheme_explanation includes the real summary text')
  assert(!!explain.actions?.some((a) => a.href === `/schemes/${pmegp.id}`), 'links to the scheme detail page')

  const benefits = answerQuery('what benefits do I get?', context, EMPTY_SESSION, schemes)
  assert(benefits.text.includes(pmegp.benefit), 'scheme_benefits includes the real benefit text')

  const eligibility = answerQuery("what's the eligibility criteria?", context, EMPTY_SESSION, schemes)
  assert(eligibility.text.includes(pmegp.name), 'scheme_eligibility names the scheme')
}

console.log('\n=== answerQuery: required_documents (real data vs honest fallback) ===')
{
  const withDocs = schemes.find((s) => s.requiredDocuments && s.requiredDocuments.length > 0)
  const withoutDocs = schemes.find((s) => !s.requiredDocuments || s.requiredDocuments.length === 0)
  assert(!!withDocs, 'dataset has at least one scheme with requiredDocuments (sanity check for this test)')
  assert(!!withoutDocs, 'dataset has at least one scheme without requiredDocuments (sanity check for this test)')

  if (withDocs) {
    const ctx: ChatAppContext = { ...NO_PROFILE_CONTEXT, selectedScheme: withDocs }
    const answer = answerQuery('what documents do I need?', ctx, EMPTY_SESSION, schemes)
    assert(
      withDocs.requiredDocuments!.every((d) => answer.text.includes(d)),
      `${withDocs.id}: every real required document is listed verbatim`
    )
  }
  if (withoutDocs) {
    const ctx: ChatAppContext = { ...NO_PROFILE_CONTEXT, selectedScheme: withoutDocs }
    const answer = answerQuery('what documents do I need?', ctx, EMPTY_SESSION, schemes)
    assert(/don't have a confirmed document list/i.test(answer.text), `${withoutDocs.id}: honest fallback, nothing invented`)
  }
}

console.log('\n=== answerQuery: pronoun resolution + session memory ===')
{
  const first = answerQuery('tell me about stand-up india', NO_PROFILE_CONTEXT, EMPTY_SESSION, schemes)
  assert(first.text.includes(standUp.name), 'first message resolves the named scheme')
  assert(first.nextSession.lastSchemeId === standUp.id, 'session remembers the last scheme discussed')

  const followUp = answerQuery('what documents does it need?', NO_PROFILE_CONTEXT, first.nextSession, schemes)
  assert(followUp.text.includes(standUp.name) || (followUp.actions?.some((a) => a.href === `/schemes/${standUp.id}`) ?? false), '"it" resolves back to the remembered scheme')
}

console.log('\n=== answerQuery: no active scheme -> graceful prompt ===')
{
  const answer = answerQuery('how do I apply?', NO_PROFILE_CONTEXT, EMPTY_SESSION, schemes)
  assert(/not sure which scheme/i.test(answer.text), 'asks which scheme instead of guessing')
}

console.log('\n=== answerQuery: "am I eligible for this scheme?" (2026-09-24) ===')
{
  const onPage = (profile: DraftEntrepreneurProfile, schemeId: string) => ({
    ...buildChatContext({ profile, isHydrated: true, pathname: `/schemes/${schemeId}`, schemes }),
  })
  const artisan = draftFrom(demoProfiles.find((d) => d.id === 'rural-first-time-artisan')!.profile)

  const yes = answerQuery('Am I eligible for this scheme?', onPage(artisan, standUp.id), EMPTY_SESSION, schemes)
  assert(yes.text.startsWith(`${standUp.name}: Yes, you look likely eligible`), `eligible applicant on the Stand-Up India page gets a clear "yes" (got: ${yes.text.slice(0, 80)}…)`)
  assert(/not an official decision/i.test(yes.text), 'the "yes" is caveated as a rule-based check')
  assert(!!yes.actions?.some((a) => a.href === `/schemes/${standUp.id}`), 'links to the full explanation')

  const man = { ...artisan, category: 'General' as const, gender: 'Man' as const }
  const no = answerQuery('am I eligible for stand-up india?', onPage(man, pmegp.id), EMPTY_SESSION, schemes)
  assert(no.text.startsWith(`${standUp.name}: Probably not`), 'a named scheme wins over the open page, and a General man gets "probably not" for Stand-Up India')
  assert(/women of any category/i.test(no.text), 'the "no" gives the real reason from the engine')

  const ndfdc = schemes.find((s) => s.id === 'ndfdc-disability')!
  const unknown = answerQuery('do I qualify for this?', onPage(artisan, ndfdc.id), EMPTY_SESSION, schemes)
  assert(/can't tell yet/i.test(unknown.text) && /disability status not provided/i.test(unknown.text), 'missing disability answer on NDFDC -> "can\'t tell yet" + what is missing')

  const noProfile = answerQuery('Am I eligible for this scheme?', { ...NO_PROFILE_CONTEXT, selectedScheme: standUp }, EMPTY_SESSION, schemes)
  assert(!!noProfile.actions?.some((a) => a.href === '/assessment'), 'no profile -> asks to complete the assessment')

  const noScheme = answerQuery('am I eligible?', buildChatContext({ profile: artisan, isHydrated: true, pathname: '/', schemes }), EMPTY_SESSION, schemes)
  assert(/good fit/i.test(noScheme.text) && noScheme.nextSession.lastIntent === 'eligible_schemes', 'no scheme in play -> answered as "which schemes am I eligible for", not "which scheme do you mean?"')
}

console.log('\n=== answerQuery: unknown/unclear question -> exact fallback ===')
{
  const answer = answerQuery('what is the weather today', NO_PROFILE_CONTEXT, EMPTY_SESSION, schemes)
  assert(answer.text === FALLBACK_HELP, 'text matches the required fallback exactly')
  assert(answer.actions === undefined, 'no action attached to the bare fallback')
}

console.log('\n=== answerQuery: edge cases ===')
{
  const empty = answerQuery('   ', NO_PROFILE_CONTEXT, EMPTY_SESSION, schemes)
  assert(empty.text === FALLBACK_HELP, 'blank input -> fallback, not a crash')

  const noSchemes = answerQuery('what documents do I need?', NO_PROFILE_CONTEXT, EMPTY_SESSION, [])
  assert(/hasn't loaded/i.test(noSchemes.text), 'empty scheme dataset is reported honestly, not silently')
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`)
process.exit(failures === 0 ? 0 : 1)
