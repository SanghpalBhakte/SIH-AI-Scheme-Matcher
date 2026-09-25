// The deterministic query/response engine. Pure function: same
// (input, context, session, schemes) always produces the same reply —
// no randomness, no external call, nothing invented that isn't already
// in the local scheme data, the profile, or the matching results.
//
// It deliberately reuses the app's existing explanation helpers rather
// than re-deriving that logic:
//   - lib/matching/engine.ts (evaluateScheme)  → the one scoring source
//   - lib/recommendations/explain.ts (summarizeMatch) → plain-language
//     "why this matched" text, already used on the scheme detail page
//   - lib/schemes/describe-audience.ts (describeAudience) → the
//     scheme's own stated eligibility rules, already used there too
//   - lib/schemes/checklist.ts (GENERIC_CHECKLIST_STEPS) → the same
//     generic application path shown in ApplicationChecklist

import type { Scheme } from '@/lib/matching/types'
import { evaluateScheme } from '@/lib/matching/engine'
import { summarizeMatch } from '@/lib/recommendations/explain'
import { deriveMatchReasons } from '@/lib/recommendations/reasoning'
import type { SchemeMatchResult } from '@/lib/matching/types'
import { describeAudience } from '@/lib/schemes/describe-audience'
import { GENERIC_CHECKLIST_STEPS } from '@/lib/schemes/checklist'
import type { ChatAppContext } from './context-adapter'
import type { ChatAction, ChatSession } from './types'
import { classifyIntent } from './intents'
import { detectSchemeName, referencesActiveScheme } from './scheme-lookup'

/** Exact fallback text required for unclear/unsupported questions. */
export const FALLBACK_HELP =
  'I can help with questions about government schemes, your recommendations, eligibility, required documents, and application steps.'

export interface ChatAnswer {
  text: string
  actions?: ChatAction[]
  nextSession: ChatSession
}

function lowercaseFirst(text: string): string {
  return text.length === 0 ? text : text[0].toLowerCase() + text.slice(1)
}

/**
 * A direct yes / possibly / not-yet / probably-not answer to "am I
 * eligible for this scheme?", worded straight from the engine's own
 * criterion labels (never invented) and never claiming more certainty
 * than eligibilityStatus has.
 */
function eligibilityVerdict(result: SchemeMatchResult): string {
  const reasons = deriveMatchReasons(result).slice(0, 2).map(lowercaseFirst).join('; ')
  const failed = result.failedCriteria.map((c) => lowercaseFirst(c.label)).join('; ')
  const missing = result.missingCriteria.map((c) => lowercaseFirst(c.label)).join('; ')
  const score = `${result.matchScore}% match`
  switch (result.eligibilityStatus) {
    case 'Likely Eligible':
      return (
        `Yes, you look likely eligible (${score}): ${reasons}.` +
        (failed ? ` One thing doesn't line up: ${failed}.` : '') +
        " This is a rule-based check, not an official decision; final approval depends on the scheme's own verification."
      )
    case 'Possibly Eligible':
      return `Possibly (${score}): ${reasons}. But not everything lines up: ${failed}. Check the official rules before applying.`
    case 'Insufficient Information':
      return `I can't tell yet (${score} on what I know). ${result.missingCriteria.length === 1 ? 'One detail is' : 'Some details are'} missing: ${missing}. Add it in the assessment and ask again.`
    case 'Low Match':
    default:
      return `Probably not, based on your profile (${score}): ${failed || missing}. The Recommendations page shows schemes that fit you better.`
  }
}

function askWhichScheme(schemes: Scheme[]): string {
  const example = schemes[0]?.name ?? 'a scheme'
  return `I'm not sure which scheme you mean. Try naming one, for example "${example}", or open a scheme's page first and then ask me about it.`
}

/** The two links every scheme-specific reply can offer: its detail page here, and its real official source (never fabricated — only when the dataset actually has one). */
function schemeActions(scheme: Scheme, label = 'Open scheme page'): ChatAction[] {
  const actions: ChatAction[] = [{ label, href: `/schemes/${scheme.id}` }]
  if (scheme.officialUrl) {
    actions.push({ label: 'Official portal', href: scheme.officialUrl, external: true })
  }
  return actions
}

/**
 * Decides which scheme (if any) the question is about: an explicitly
 * named scheme wins; otherwise a pronoun ("this scheme", "it") falls
 * back to whichever scheme is open on screen, then to the last scheme
 * discussed this session; with no scheme named and no pronoun, the
 * currently open scheme (if any) still applies so "what documents do I
 * need" works without repeating the name on a scheme's own page.
 */
function resolveActiveScheme(
  input: string,
  context: ChatAppContext,
  session: ChatSession,
  schemes: Scheme[]
): Scheme | null {
  const named = detectSchemeName(input, schemes)
  if (named) return named

  if (referencesActiveScheme(input) && session.lastSchemeId) {
    const remembered = schemes.find((s) => s.id === session.lastSchemeId)
    if (remembered) return remembered
  }

  if (context.selectedScheme) return context.selectedScheme

  if (session.lastSchemeId) {
    return schemes.find((s) => s.id === session.lastSchemeId) ?? null
  }

  return null
}

export function answerQuery(rawInput: string, context: ChatAppContext, session: ChatSession, schemes: Scheme[]): ChatAnswer {
  const input = rawInput.trim()
  if (!input) {
    return { text: FALLBACK_HELP, nextSession: session }
  }

  if (schemes.length === 0) {
    return {
      text: "The scheme list hasn't loaded, so I can't look anything up right now. Please try again in a moment.",
      nextSession: session,
    }
  }

  const classified = classifyIntent(input)
  const activeScheme = resolveActiveScheme(input, context, session, schemes)
  // "Am I eligible?" with no scheme named, open or remembered is really
  // "which schemes am I eligible for?" — answer it that way, never with
  // "which scheme do you mean?".
  const intent = classified === 'personal_eligibility' && !activeScheme ? 'eligible_schemes' : classified

  let nextSession: ChatSession = { ...session, lastIntent: intent }
  if (activeScheme) nextSession = { ...nextSession, lastSchemeId: activeScheme.id }

  switch (intent) {
    case 'eligible_schemes': {
      if (!context.profileComplete) {
        return {
          text:
            "I don't have your profile yet, so I can't tell you which schemes you're eligible for. " +
            'Complete the assessment (category, gender, state, sector, stage, and first-time status) and I\'ll be able to check.',
          actions: [{ label: 'Complete assessment', href: '/assessment' }],
          nextSession,
        }
      }
      const results = context.recommendations ?? []
      const strong = results.filter(
        (r) => r.eligibilityStatus === 'Likely Eligible' || r.eligibilityStatus === 'Possibly Eligible'
      )
      if (strong.length === 0) {
        // Honest, not empty-handed: the closest scheme(s) by score are
        // still named, just clearly caveated as not a strong fit —
        // never invented, straight from the same matchSchemes() output
        // the Recommendations page uses.
        const closest = results.slice(0, 2)
        if (closest.length === 0) {
          return { text: 'None of the schemes in this dataset could be scored against your profile.', nextSession }
        }
        const lines = closest.map((r) => `• ${r.scheme.name}: ${r.matchScore}% match (${r.eligibilityStatus})`)
        return {
          text:
            "Based on your profile, none of the schemes in this dataset are a strong match right now. " +
            `The closest are:\n${lines.join('\n')}\n\nThey're still worth a look even with a lower score, because eligibility rules sometimes have exceptions this prototype doesn't cover.`,
          actions: closest.map((r) => ({ label: r.scheme.name, href: `/schemes/${r.scheme.id}` })),
          nextSession,
        }
      }
      const top = strong.slice(0, 3)
      const lines = top.map((r) => `• ${r.scheme.name}: ${r.matchScore}% match (${r.eligibilityStatus})`)
      return {
        text:
          `Based on your profile, here's what looks like a good fit:\n${lines.join('\n')}\n\n` +
          `Open the Recommendations page for the full explanation, or ask me "why was ${top[0].scheme.name} recommended?"`,
        actions: [{ label: 'View recommendations', href: '/recommendations' }],
        nextSession,
      }
    }

    case 'recommendation_reason': {
      if (!activeScheme) return { text: askWhichScheme(schemes), nextSession }
      if (!context.completeProfile) {
        return {
          text: `I can explain why ${activeScheme.name} would or wouldn't match you once your profile is complete, so finish the assessment first.`,
          actions: [{ label: 'Complete assessment', href: '/assessment' }],
          nextSession,
        }
      }
      const result = evaluateScheme(context.completeProfile, activeScheme)
      return {
        text: `${activeScheme.name}: ${summarizeMatch(result)}`,
        actions: schemeActions(activeScheme, 'View full explanation'),
        nextSession,
      }
    }

    case 'personal_eligibility': {
      if (!activeScheme) return { text: askWhichScheme(schemes), nextSession } // unreachable, see `intent` above
      if (!context.completeProfile) {
        return {
          text: `I can check whether you're eligible for ${activeScheme.name} once your profile is complete, so finish the assessment first (it takes a few minutes).`,
          actions: [{ label: 'Complete assessment', href: '/assessment' }],
          nextSession,
        }
      }
      const result = evaluateScheme(context.completeProfile, activeScheme)
      return {
        text: `${activeScheme.name}: ${eligibilityVerdict(result)}`,
        actions: schemeActions(activeScheme, 'View full explanation'),
        nextSession,
      }
    }

    case 'scheme_explanation': {
      if (!activeScheme) return { text: askWhichScheme(schemes), nextSession }
      const ministry = activeScheme.ministry ? ` It's administered by ${activeScheme.ministry}.` : ''
      return {
        text: `${activeScheme.name}: ${activeScheme.summary}${ministry} Benefit: ${activeScheme.benefit}.`,
        actions: schemeActions(activeScheme),
        nextSession,
      }
    }

    case 'scheme_benefits': {
      if (!activeScheme) return { text: askWhichScheme(schemes), nextSession }
      return {
        text: `${activeScheme.name} offers: ${activeScheme.benefit}.`,
        actions: schemeActions(activeScheme),
        nextSession,
      }
    }

    case 'scheme_eligibility': {
      if (!activeScheme) return { text: askWhichScheme(schemes), nextSession }
      const lines = describeAudience(activeScheme).map((l) => `• ${l}`)
      return {
        text:
          `${activeScheme.name}'s own stated eligibility rules:\n${lines.join('\n')}\n\n` +
          'This is the scheme\'s general criteria, not a check against your own profile. Ask "why was this recommended?" for that.',
        actions: schemeActions(activeScheme),
        nextSession,
      }
    }

    case 'required_documents': {
      if (!activeScheme) return { text: askWhichScheme(schemes), nextSession }
      if (activeScheme.requiredDocuments && activeScheme.requiredDocuments.length > 0) {
        const lines = activeScheme.requiredDocuments.map((d) => `• ${d}`)
        return {
          text: `Documents ${activeScheme.name} asks for:\n${lines.join('\n')}`,
          actions: schemeActions(activeScheme),
          nextSession,
        }
      }
      return {
        text:
          `I don't have a confirmed document list for ${activeScheme.name} in the dataset` +
          `${activeScheme.officialUrl ? `, so check ${activeScheme.officialUrl} directly` : ''}. ` +
          'In general, government schemes ask for ID proof, address proof, a category/caste certificate (if relevant) and business details, but confirm the exact list on the official portal before applying.',
        actions: schemeActions(activeScheme),
        nextSession,
      }
    }

    case 'application_steps': {
      if (!activeScheme) return { text: askWhichScheme(schemes), nextSession }
      if (activeScheme.applicationSteps && activeScheme.applicationSteps.length > 0) {
        const lines = activeScheme.applicationSteps.map((s, i) => `${i + 1}. ${s}`)
        return {
          text: `How to apply for ${activeScheme.name}:\n${lines.join('\n')}`,
          actions: schemeActions(activeScheme),
          nextSession,
        }
      }
      const generic = GENERIC_CHECKLIST_STEPS.map((s, i) => `${i + 1}. ${s.label}`)
      return {
        text: `I don't have ${activeScheme.name}'s exact application steps yet, but the general path is:\n${generic.join('\n')}`,
        actions: schemeActions(activeScheme),
        nextSession,
      }
    }

    case 'next_action': {
      if (!context.profileComplete) {
        return {
          text: 'Your best next step is to finish the assessment. It takes a few minutes and then you’ll see the schemes that fit you.',
          actions: [{ label: 'Complete assessment', href: '/assessment' }],
          nextSession,
        }
      }
      if (activeScheme) {
        return {
          text: `For ${activeScheme.name}, go through the application checklist on this page: check eligibility, prepare documents, then go to the official portal.`,
          actions: schemeActions(activeScheme, 'Open checklist'),
          nextSession,
        }
      }
      const results = context.recommendations ?? []
      if (results.length > 0) {
        return {
          text: `Your profile is complete. Take a look at your top match, ${results[0].scheme.name}, on the Recommendations page and open it for the full checklist.`,
          actions: [
            { label: 'View recommendations', href: '/recommendations' },
            { label: results[0].scheme.name, href: `/schemes/${results[0].scheme.id}` },
          ],
          nextSession,
        }
      }
      return { text: FALLBACK_HELP, nextSession }
    }

    case 'general_help':
      return {
        text:
          'I can help you understand government schemes. Ask me things like "what schemes am I eligible for", "am I eligible for this scheme", ' +
          '"why was this scheme recommended", "what documents do I need", or "how do I apply". ' +
          "I only use information already in this app, so I'll tell you when something isn't in it.",
        actions: [{ label: 'Browse all schemes', href: '/schemes' }],
        nextSession,
      }

    case 'unknown':
    default:
      // Exact required fallback text, text-only — no action attached,
      // so acceptance-criterion wording stays untouched.
      return { text: FALLBACK_HELP, nextSession }
  }
}
