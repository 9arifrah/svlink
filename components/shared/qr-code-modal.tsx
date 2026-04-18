'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, QrCode, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { downloadDataUri } from '@/lib/qr-code'

type QRCodeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: {
    title: string
    url: string
    qr_code: string | null
    short_code?: string | null
  }
}

export function QRCodeModal({ open, onOpenChange, link }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    if (!link.qr_code) return

    try {
      const sanitizedTitle = link.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      downloadDataUri(link.qr_code, `qr-${sanitizedTitle}.png`)
    } catch (error) {
      console.error('[QR Code Modal] Download failed:', error)
    }
  }

  const handleCopyShortLink = async () => {
    if (!link.short_code) return
    const shortLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${link.short_code}`
    try {
      await navigator.clipboard.writeText(shortLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('[QR Code Modal] Copy failed:', error)
    }
  }

  if (!link.qr_code) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              QR Code - {link.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-slate-500">
            QR code tidak tersedia untuk link ini.
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const shortLink = link.short_code
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${link.short_code}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            QR Code - {link.title}
          </DialogTitle>
          <DialogDescription>
            Scan QR code atau gunakan short link di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <img
                src={link.qr_code}
                alt={`QR Code untuk ${link.title}`}
                className="h-48 w-48"
              />
            </div>
          </div>

          {/* Short Link */}
          {shortLink && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Copy className="h-3.5 w-3.5" />
                Short Link
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 truncate">
                  {shortLink}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyShortLink}
                  className={copied ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-50' : ''}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
