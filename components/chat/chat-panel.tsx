'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Send, X, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'
import { SuggestionChips } from './suggestion-chips'
import { useLanguage } from '@/lib/i18n/language-context'
import type { ChatMessage } from '@/lib/chat/types'

interface ChatPanelProps {
  messages: ChatMessage[]
  isTyping: boolean
  suggestions: string[]
  onSend: (text: string) => void
  onClose: () => void
}

export function ChatPanel({ messages, isTyping, suggestions, onSend, onClose }: ChatPanelProps) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState('')
  const scrollEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the latest message (or the typing indicator) in view, and
  // start with focus in the input so a keyboard/screen-reader user
  // lands somewhere useful the moment the panel opens.
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // The panel behaves modally on mobile (covers 85vh, sits above
  // everything) even though it isn't marked aria-modal="true" (it
  // doesn't block interaction with the header behind it on desktop) —
  // Escape-to-close is the accessibility baseline either way, matching
  // the same pattern LanguageToggle already uses for its popover.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Assistant chat"
      className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-elevated-lg sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[80vh] sm:w-[380px] sm:rounded-xl"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-foreground">{t('chat.assistantLabel')}</p>
            <p className="text-xs leading-tight text-muted-foreground">Answers from this app&apos;s own data</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 sm:h-9 sm:w-9"
          onClick={onClose}
          aria-label="Close Assistant chat"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {/* Message history */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={scrollEndRef} />
      </div>

      {/* Quick suggestions */}
      <SuggestionChips suggestions={suggestions} onSelect={onSend} disabled={isTyping} />

      {/* Input — extra bottom padding respects the home-indicator safe
          area on notched phones, where the sheet sits flush with the
          screen edge. */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about schemes, eligibility, documents…"
          aria-label="Message the Assistant"
          disabled={isTyping}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isTyping || !draft.trim()} aria-label="Send message">
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </div>
  )
}
