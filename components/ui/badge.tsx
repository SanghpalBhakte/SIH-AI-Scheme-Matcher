import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// `inline-block` (not `inline-flex`) is deliberate: no Badge usage in this
// codebase nests an icon next to its text, so there's nothing that needs
// flex row alignment. `inline-flex` was forcing every Badge's text onto one
// unbroken line even inside a `flex-wrap` parent (a flex item's default
// min-width:auto keeps its own text from wrapping) -- on /institutions,
// long scheme-name badges like "AP Innovation & Startup Policy 4.0 --
// Startup Grant" ran straight off the edge of the screen at phone widths
// instead of wrapping onto a second line. `inline-block` lets the text wrap
// normally while still shrinking to content width for short badges.
const badgeVariants = cva(
  'inline-block max-w-full whitespace-normal break-words rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
