// Quick-reply suggestion chips, adapted to what's actually useful given
// current app state — a different set before vs. after the assessment
// is complete, and a scheme-specific set while a scheme's page is open.

import type { ChatAppContext } from './context-adapter'
import type { ChatSession } from './types'

const DEFAULT_SUGGESTIONS = [
  'What schemes am I eligible for?',
  'Why was this scheme recommended?',
  'Explain this scheme',
  'What documents do I need?',
  'How do I apply?',
  'What should I do next?',
]

export function getQuickSuggestions(context: ChatAppContext, _session: ChatSession): string[] {
  if (!context.profileComplete) {
    return ['What can you help with?', 'How do I apply for a scheme?', 'What should I do next?']
  }

  if (context.selectedScheme) {
    return ['Am I eligible for this scheme?', 'Why was this scheme recommended?', 'Explain this scheme', 'What documents do I need?', 'How do I apply?']
  }

  if (context.recommendations && context.recommendations.length > 0) {
    return ['What schemes am I eligible for?', 'Why was this scheme recommended?', 'What should I do next?']
  }

  return DEFAULT_SUGGESTIONS
}
