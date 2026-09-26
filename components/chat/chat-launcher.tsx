import { forwardRef } from 'react'
import { MessageCircle } from 'lucide-react'

interface ChatLauncherProps {
  onOpen: () => void
  ariaLabel: string
  label: string
}

/**
 * Collapsed floating launcher button — hidden while the panel is open
 * (see ChatWidget). Forwards its ref so ChatWidget can return keyboard
 * focus here once the panel closes (see ChatPanel's Escape handling).
 */
export const ChatLauncher = forwardRef<HTMLButtonElement, ChatLauncherProps>(function ChatLauncher(
  { onOpen, ariaLabel, label },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={ariaLabel}
      // Icon-only 48px circle below `sm` (same hide-the-label-on-mobile
      // pattern site-header.tsx uses for its wordmark): a real mobile
      // audit found the full labeled pill (123px wide) landing on top
      // of real content on short viewports — the hero CTA, a form
      // field, a "Save scheme" button — because at 360x640 there's no
      // scroll-free band of the screen that's reliably empty. Shrinking
      // to a corner icon (48px — comfortably above the 40px touch-target
      // minimum, small enough to keep any remaining corner overlap to a
      // sliver of whatever's underneath) keeps the launcher discoverable
      // while leaving the rest of that element reachable. Desktop keeps
      // the original labeled pill — collisions there are far less
      // likely on taller viewports, and the label helps discovery.
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-elevated-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden text-sm font-semibold sm:inline">{label}</span>
    </button>
  )
})
