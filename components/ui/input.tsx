import * as React from 'react'

import { cn } from '@/lib/utils'

// Plain native text/number input, styled to match select.tsx — same
// reasoning: no extra dependency needed for a prototype form control.
// text-base (16px), not text-sm: iOS Safari auto-zooms the whole page
// on focus for any text input under 16px, which on this assessment
// form (many inputs, one per step) would mean the page visibly jumps
// in and out of zoom every time someone taps a field — 16px is the
// documented threshold that keeps it from firing.
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-150 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-10 sm:text-sm',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
