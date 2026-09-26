import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ChatMessage } from '@/lib/chat/types'

/**
 * One chat bubble. Bot replies can be multi-line (bullet lists,
 * numbered steps) — whitespace-pre-line renders the engine's literal
 * "\n" line breaks without needing a markdown renderer. Optional
 * `actions` (see lib/chat/types.ts) render as real buttons below the
 * text — an internal route navigates with next/link, an external one
 * (only ever a scheme's own officialUrl from the dataset) opens in a
 * new tab like every other outbound link in this app.
 */
export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex w-full flex-col gap-1.5', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-line break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-soft',
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm border border-border bg-card text-card-foreground'
        )}
      >
        {message.text}
      </div>

      {message.actions && message.actions.length > 0 && (
        <div className="flex max-w-[85%] flex-wrap gap-1.5">
          {message.actions.map((action) =>
            action.external ? (
              <Button key={action.href + action.label} asChild variant="outline" size="sm" className="h-9 px-3 text-xs sm:h-7 sm:px-2.5">
                <a href={action.href} target="_blank" rel="noreferrer">
                  {action.label}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </Button>
            ) : (
              <Button key={action.href + action.label} asChild variant="outline" size="sm" className="h-9 px-3 text-xs sm:h-7 sm:px-2.5">
                <Link href={action.href}>
                  {action.label}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}
