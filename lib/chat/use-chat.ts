'use client'

// Chat state hook — the only place that owns the widget's React state
// (open/closed, message history, session memory). Mounted once at the
// root layout (see components/chat/chat-widget.tsx), so this state
// naturally survives client-side navigation between pages without any
// extra plumbing: Next.js's App Router keeps a layout's component tree
// mounted across route changes within it.
//
// Message history and session memory ALSO survive a full page reload,
// via the same isHydrated-safe localStorage pattern used by
// lib/assessment/assessment-context.tsx and
// lib/schemes/saved-schemes-context.tsx: server render and the client's
// first paint always show just the welcome message (so there's no
// hydration mismatch), and a useEffect restores the real stored
// conversation a moment later. `isOpen` is deliberately NOT persisted —
// the widget should always start closed on a fresh visit.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

import { useAssessment } from '@/lib/assessment/assessment-context'
import { useSchemes } from '@/lib/schemes/live-schemes'
import { buildChatContext } from './context-adapter'
import { answerQuery } from './engine'
import { getQuickSuggestions } from './suggestions'
import type { ChatMessage, ChatSession } from './types'

const MESSAGES_STORAGE_KEY = 'sih26092.chatMessages'
const SESSION_STORAGE_KEY = 'sih26092.chatSession'
// Bounds how much conversation localStorage keeps — a long session
// shouldn't grow the stored payload without limit.
const MAX_STORED_MESSAGES = 50

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text:
    "Hi! I'm SchemeSetu's Assistant. Ask me about schemes, eligibility, required documents or how to apply. " +
    "I only use information already in this app, and I'll tell you when something isn't in it.",
  timestamp: 0,
}

// A visible reply delay purely as a UI affordance (so an instant local
// lookup doesn't feel jarring) — never a real network or model call.
const RESPONSE_DELAY_MS = 450

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const m = value as Partial<ChatMessage>
  return typeof m.id === 'string' && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string'
}

function loadMessages(): ChatMessage[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(MESSAGES_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const valid = parsed.filter(isChatMessage)
    return valid.length > 0 ? valid : null
  } catch {
    return null
  }
}

function persistMessages(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)))
  } catch {
    // storage full/unavailable — history just won't survive a reload
  }
}

function loadSession(): ChatSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const { lastSchemeId, lastIntent } = parsed as Partial<ChatSession>
    return {
      lastSchemeId: typeof lastSchemeId === 'string' ? lastSchemeId : null,
      lastIntent: typeof lastIntent === 'string' ? (lastIntent as ChatSession['lastIntent']) : null,
    }
  } catch {
    return null
  }
}

function persistSession(session: ChatSession): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // non-fatal — session memory just won't survive a reload
  }
}

export function useChat() {
  const { profile, isHydrated: profileHydrated } = useAssessment()
  const pathname = usePathname()
  const schemes = useSchemes()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [isTyping, setIsTyping] = useState(false)
  const [session, setSession] = useState<ChatSession>({ lastSchemeId: null, lastIntent: null })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const storedMessages = loadMessages()
    const storedSession = loadSession()
    if (storedMessages) setMessages(storedMessages)
    if (storedSession) setSession(storedSession)
    setIsHydrated(true)
  }, [])

  // Persist on change, but only once hydration has actually run —
  // otherwise this fires on the very first render (still holding the
  // lone welcome message) and overwrites real stored history before
  // the effect above gets a chance to read it.
  useEffect(() => {
    if (!isHydrated) return
    persistMessages(messages)
  }, [messages, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    persistSession(session)
  }, [session, isHydrated])

  const context = useMemo(
    () => buildChatContext({ profile, isHydrated: profileHydrated, pathname: pathname ?? '', schemes }),
    [profile, profileHydrated, pathname, schemes]
  )

  const suggestions = useMemo(() => getQuickSuggestions(context, session), [context, session])

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      const userMessage: ChatMessage = { id: makeId(), role: 'user', text: trimmed, timestamp: Date.now() }
      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      window.setTimeout(() => {
        const { text: replyText, actions, nextSession } = answerQuery(trimmed, context, session, schemes)
        setSession(nextSession)
        setMessages((prev) => [...prev, { id: makeId(), role: 'bot', text: replyText, actions, timestamp: Date.now() }])
        setIsTyping(false)
      }, RESPONSE_DELAY_MS)
    },
    [context, session, isTyping, schemes]
  )

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
    messages,
    isTyping,
    send,
    suggestions,
  }
}
