'use client'

import { useState, useMemo } from 'react'
import { ExternalLink, QrCode } from 'lucide-react'
import type { Link } from '@/lib/supabase'
import { ariaLabels } from '@/lib/accessibility'
import { cn } from '@/lib/utils'
import { QRCodeModal } from '@/components/shared/qr-code-modal'

type LinkCardProps = {
  link: Link
  themeColor?: string
  variant?: 'default' | 'grid' | 'compact'
}

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

export function LinkCard({ link, themeColor = '#3b82f6', variant = 'default' }: LinkCardProps) {
  const [isClicked, setIsClicked] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [faviconError, setFaviconError] = useState(false)

  const isCompact = variant === 'compact'
  const isGrid = variant === 'grid'

  const domain = useMemo(() => getDomain(link.url), [link.url])
  const faviconUrl = domain ? getFaviconUrl(domain) : null
  const showFavicon = faviconUrl && !faviconError

  const handleClick = async () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 200)

    // Track click
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id })
      })
    } catch (error) {
      console.error('[v0] Error tracking click:', error)
    }

    // Open link
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          "group relative w-full rounded-xl border bg-white text-left",
          "border-l-4 transition-all duration-200",
          "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
          "overflow-hidden",
          isCompact ? "p-2 sm:p-3" : isGrid ? "p-3 sm:p-4" : "p-4 sm:p-5"
        )}
        style={{
          borderLeftColor: themeColor,
          borderTopColor: `${themeColor}30`,
          borderRightColor: `${themeColor}30`,
          borderBottomColor: `${themeColor}30`,
        }}
        aria-label={`${ariaLabels.linkOpensExternal}. ${link.title}. ${link.url}`}
        rel="noopener noreferrer"
      >
        {/* Gradient border overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}05 100%)`,
          }}
        />

        {/* Content */}
        <div className="relative flex items-start gap-3">
          {/* Favicon */}
          {showFavicon && (
            <img
              src={faviconUrl}
              alt=""
              className="w-5 h-5 rounded flex-shrink-0 mt-0.5"
              onError={() => setFaviconError(true)}
              loading="lazy"
            />
          )}

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold text-slate-900 transition-colors duration-200 truncate",
                isCompact ? "text-sm" : "text-base sm:text-base"
              )}
              style={{
                color: isClicked ? themeColor : undefined,
              }}
              title={link.title}
              id={`link-title-${link.id}`}
            >
              {link.title}
            </h3>

            {/* Description */}
            {!isCompact && link.description && (
              <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">
                {link.description}
              </p>
            )}

            {/* Short code */}
            {!isCompact && !link.description && link.short_code && (
              <p
                className="mt-1 font-mono text-slate-500 truncate transition-all duration-200 group-hover:translate-x-1 text-xs sm:text-sm"
                title={`${typeof window !== 'undefined' ? window.location.origin : ''}/${link.short_code}`}
              >
                {typeof window !== 'undefined' ? window.location.origin : ''}/{link.short_code}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {link.qr_code && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowQrModal(true)
                }}
                className={cn(
                  "transition-all duration-200",
                  "text-slate-400 hover:scale-110 hover:text-slate-600",
                  "h-4 w-4 sm:h-5 sm:w-5"
                )}
                title="Lihat QR Code"
                aria-label="Lihat QR Code untuk link ini"
              >
                <QrCode
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  style={{
                    color: isClicked ? themeColor : undefined,
                  }}
                />
              </button>
            )}
            <ExternalLink
              className={cn(
                "transition-all duration-200",
                "text-slate-400 group-hover:text-slate-600",
                "h-4 w-4 sm:h-5 sm:w-5"
              )}
              style={{
                color: isClicked ? themeColor : undefined,
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </button>

      <QRCodeModal
        open={showQrModal}
        onOpenChange={setShowQrModal}
        link={{
          title: link.title,
          url: link.url,
          qr_code: link.qr_code || null,
          short_code: link.short_code || null
        }}
      />
    </>
  )
}
