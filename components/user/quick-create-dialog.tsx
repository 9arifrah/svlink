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
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Link2, QrCode, Loader2 } from 'lucide-react'
import type { Link } from '@/lib/supabase'

type QuickCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (link: Link) => void
}

export function QuickCreateDialog({ open, onOpenChange, onSuccess }: QuickCreateDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: ''
  })

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Plus className="h-5 w-5 text-blue-600" />
            Quick Create
          </DialogTitle>
          <DialogDescription>
            Buat link dengan cepat. Short link dan QR code akan otomatis di-generate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 py-4">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">Judul Link</Label>
              <Input
                id="title"
                placeholder="Contoh: Grup WhatsApp Peserta"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="url" className="text-xs sm:text-sm">URL Tujuan</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                className="text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Link2 className="h-4 w-4 shrink-0" />
              <span>Short link akan otomatis di-generate</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <QrCode className="h-4 w-4 shrink-0" />
              <span>QR code juga akan otomatis di-generate</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Link
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}