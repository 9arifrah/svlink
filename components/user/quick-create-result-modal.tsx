'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CheckCircle, Copy, Download, ExternalLink, Link2, QrCode } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Link } from '@/lib/supabase'
import { downloadDataUri } from '@/lib/qr-code'

type QuickCreateResultModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: Link | null
}

export function QuickCreateResultModal({ open, onOpenChange, link }: QuickCreateResultModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!link) return null

  const shortLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/${link.short_code}` 
    : `/${link.short_code}`

  const handleCopyShortLink = async () => {
    try {
      await navigator.clipboard.writeText(shortLink)
      setCopied(true)
      toast({
        title: 'Berhasil!',
        description: 'Short link telah disalin ke clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('[v0] Error copying short link:', error)
      toast({
        title: 'Gagal menyalin',
        description: 'Terjadi kesalahan saat menyalin link',
        variant: 'destructive'
      })
    }
  }

  const handleDownloadQR = () => {
    if (!link.qr_code) {
      toast({
        title: 'QR Code tidak tersedia',
        description: 'QR code belum di-generate untuk link ini',
        variant: 'destructive'
      })
      return
    }

    try {
      const sanitizedTitle = link.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      downloadDataUri(link.qr_code, `qr-${sanitizedTitle}.png`)
      toast({
        title: 'Berhasil!',
        description: 'QR code berhasil di-download',
      })
    } catch (error) {
      console.error('[v0] Error downloading QR code:', error)
      toast({
        title: 'Gagal mendownload',
        description: 'Terjadi kesalahan saat mendownload QR code',
        variant: 'destructive'
      })
    }
  }

  const handleViewInLinks = () => {
    onOpenChange(false)
    router.push('/dashboard/links')
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[520px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="overflow-hidden">
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
            <span className="truncate">Link Berhasil Dibuat!</span>
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Short link dan QR code Anda sudah siap digunakan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2 w-full min-w-0">
          {/* Link Info Card */}
          <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-3 sm:p-4 space-y-3 overflow-hidden">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Judul</p>
              <p className="text-sm text-slate-900 font-semibold mt-0.5 break-words">{link.title}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">URL Tujuan</p>
              <div className="overflow-hidden">
                <p className="text-sm text-slate-600 mt-0.5 truncate" title={link.url}>
                  {link.url}
                </p>
              </div>
            </div>
          </div>

          {/* Short Link Card */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Short Link
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 truncate min-w-0">
                {shortLink}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyShortLink}
                className={`w-full sm:w-auto ${copied ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-50' : ''}`}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-2">{copied ? 'Tersalin' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* QR Code Card */}
          {link.qr_code && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5" />
                QR Code
              </p>
              <div className="rounded-lg border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col items-center gap-4">
                <div className="rounded-lg border border-slate-100 bg-white p-2 sm:p-3">
                  <img
                    src={link.qr_code}
                    alt={`QR Code untuk ${link.title}`}
                    className="h-32 w-32 sm:h-40 sm:w-40"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Tutup
          </Button>
          <Button
            onClick={handleViewInLinks}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Lihat di Link Saya
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}