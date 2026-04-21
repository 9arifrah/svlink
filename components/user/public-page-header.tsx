'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type PublicPageHeaderProps = {
  displayName: string
  settings: {
    logo_url?: string
    page_title?: string
    profile_description?: string
    theme_color?: string
  }
}

export function PublicPageHeader({ displayName, settings }: PublicPageHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const themeColor = settings.theme_color || '#3b82f6'
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleShare = async () => {
    if (!mounted) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: settings.page_title || `${displayName}'s Links`,
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Berhasil!",
        description: "Link telah disalin ke clipboard",
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 mb-8 sm:mb-12 text-center">
      {settings.logo_url && (
        <div className="mb-3 sm:mb-4 inline-flex w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 transition-all duration-300 hover:scale-105">
          <img
            src={settings.logo_url}
            alt="Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl object-cover"
          />
        </div>
      )}
      {!settings.logo_url && (
        <div
          className="mb-3 sm:mb-4 inline-flex w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 items-center justify-center rounded-2xl text-xl sm:text-2xl lg:text-3xl shadow-xl border border-white/50 transition-all hover:scale-105 animate-float"
          style={{ backgroundColor: themeColor }}
        >
          <ExternalLink className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
        </div>
      )}
      <h1 className="mb-2 text-balance text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
        {settings.page_title || `${displayName}'s Links`}
      </h1>
      {settings.profile_description && (
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed">
          {settings.profile_description}
        </p>
      )}
      <Button
        onClick={handleShare}
        variant="outline"
        className="mx-auto h-11 px-6 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        style={{ borderColor: `${themeColor}60`, color: themeColor }}
      >
        <Share2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Bagikan Halaman Ini
      </Button>
    </div>
  )
}