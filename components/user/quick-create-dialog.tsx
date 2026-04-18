'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Link2, QrCode, Loader2 } from 'lucide-react'
import type { Link } from '@/lib/supabase'

type QuickCreateMode = 'shortlink' | 'qrcode'

type QuickCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: QuickCreateMode
  onSuccess?: (link: Link) => void
}

export function QuickCreateDialog({ open, onOpenChange, mode, onSuccess }: QuickCreateDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: ''
  })

  const isShortLinkMode = mode === 'shortlink'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          url: formData.url,
          is_public: true,
          is_active: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Reset form
        setFormData({ title: '', url: '' })
        
        // Call onSuccess callback with the created link data
        if (onSuccess && data.link) {
          onSuccess(data.link)
        }

        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: 'Gagal membuat link',
          description: error.error || 'Terjadi kesalahan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('[v0] Error creating link:', error)
      toast({
        title: 'Gagal membuat link',
        description: 'Terjadi kesalahan saat membuat link',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', url: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isShortLinkMode ? (
              <Link2 className="h-5 w-5 text-blue-600" />
            ) : (
              <QrCode className="h-5 w-5 text-blue-600" />
            )}
            {isShortLinkMode ? 'Quick Create Short Link' : 'Quick Create QR Code'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Link</Label>
            <Input
              id="title"
              placeholder="Contoh: Grup WhatsApp Peserta"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL Tujuan</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
            {isShortLinkMode ? (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Link2 className="h-4 w-4" />
                  <span>Short code akan otomatis di-generate</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <QrCode className="h-4 w-4" />
                  <span>QR code juga akan di-generate otomatis</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <QrCode className="h-4 w-4" />
                  <span>QR code akan otomatis di-generate</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Link2 className="h-4 w-4" />
                  <span>Short link juga akan otomatis di-generate</span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : isShortLinkMode ? (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Buat Short Link
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Buat QR Code
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}