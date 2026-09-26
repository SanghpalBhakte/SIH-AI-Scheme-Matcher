'use client'

import { Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/language-context'
import { buildSchemeWhatsAppUrl } from '@/lib/schemes/whatsapp-share'
import { cn } from '@/lib/utils'
import type { Scheme } from '@/lib/matching/types'

interface WhatsAppShareButtonProps {
  scheme: Scheme
  /** 'icon' for a compact icon-only button (cards); 'label' shows text too (scheme details page). */
  variant?: 'icon' | 'label'
  className?: string
}

/**
 * One-tap share to WhatsApp — mirrors SaveSchemeButton's icon/label
 * pattern so the two sit naturally side by side wherever a scheme is
 * shown. Built for this app's specific user base: documented research
 * on how marginalized/first-time entrepreneurs actually decide on a
 * scheme points to consulting a trusted family member or community
 * worker before applying, more than reading a government portal alone
 * — this makes that a single tap instead of a manual copy-paste. See
 * lib/schemes/whatsapp-share.ts for exactly what's in the message.
 */
export function WhatsAppShareButton({ scheme, variant = 'icon', className }: WhatsAppShareButtonProps) {
  const { t } = useLanguage()

  function handleShare() {
    const detailUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/schemes/${scheme.id}` : `/schemes/${scheme.id}`
    window.open(buildSchemeWhatsAppUrl(scheme, detailUrl), '_blank', 'noopener,noreferrer')
  }

  if (variant === 'label') {
    return (
      <Button type="button" variant="outline" onClick={handleShare} className={cn('gap-1.5', className)}>
        <Share2 className="h-4 w-4" aria-hidden />
        {t('common.shareWhatsApp')}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleShare}
      aria-label={t('common.shareWhatsApp')}
      className={cn('shrink-0 text-muted-foreground hover:text-success', className)}
    >
      <Share2 className="h-4 w-4" aria-hidden />
    </Button>
  )
}
