import * as React from 'react'

import { cn } from '@/lib/utils'

// Plain native radio inputs, styled — same reasoning as select.tsx and
// checkbox.tsx: no Radix dependency needed for a prototype form
// control. Used for small, mutually-exclusive choices (Rural/Urban,
// Yes/No) where a dropdown would be needless friction.
const RadioGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="radiogroup" className={cn('flex flex-wrap gap-4', className)} {...props} />
  )
)
RadioGroup.displayName = 'RadioGroup'

interface RadioOptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const RadioOption = React.forwardRef<HTMLInputElement, RadioOptionProps>(
  ({ className, label, id, ...props }, ref) => (
    <label htmlFor={id} className="flex min-h-11 min-w-11 cursor-pointer items-center gap-2 py-2 text-sm text-foreground">
      <input
        ref={ref}
        id={id}
        type="radio"
        className={cn(
          'h-4 w-4 shrink-0 cursor-pointer border-input text-primary transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
        {...props}
      />
      {label}
    </label>
  )
)
RadioOption.displayName = 'RadioOption'

export { RadioGroup, RadioOption }
