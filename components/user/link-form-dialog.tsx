'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Link, Category } from '@/lib/supabase'
import { LinkStatusSegmentedControl, linkStatusToFlags, flagsToLinkStatus } from './link-status-segmented-control'
import { Link2, Settings2, Globe } from 'lucide-react'

type LinkStatus = 'public' | 'private' | 'draft'

type LinkFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: Link
  categories: Category[]
  userId: string
}

export function LinkFormDialog({ open, onOpenChange, link, categories, userId }: LinkFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shortCodeError, setShortCodeError] = useState('')
  const [generatingShortCode, setGeneratingShortCode] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category_id: '',
    status: 'public' as LinkStatus,
    short_code: ''
  })

  useEffect(() => {
    if (open) {
      setShortCodeError('')
    }
  }, [open])

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        url: link.url,
        category_id: link.category_id,
        status: flagsToLinkStatus(link.is_public, link.is_active),
        short_code: link.short_code || ''
      })
    } else {
      setFormData({
        title: '',
        url: '',
        category_id: categories[0]?.id || '',
        status: 'public',
        short_code: ''
      })
    }
  }, [link, categories])

  const handleGenerateShortCode = async () => {
    setGeneratingShortCode(true)
    setShortCodeError('')

    try {
      const response = await fetch('/api/links/generate-short-code', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, short_code: data.short_code })
      } else {
        const error = await response.json()
        setShortCodeError(error.error || 'Gagal generate short code')
      }
    } catch (error) {
      console.error('[v0] Error generating short code:', error)
      setShortCodeError('Gagal generate short code')
    } finally {
      setGeneratingShortCode(false)
    }
  }

  const handleShortCodeChange = async (value: string) => {
    setFormData({ ...formData, short_code: value })
    setShortCodeError('')

    if (!value) return

    // Basic client-side validation
    if (!/^[a-z0-9-]+$/.test(value)) {
      setShortCodeError('Hanya huruf kecil, angka, dan -')
      return
    }

    if (value.length < 3) {
      setShortCodeError('Minimal 3 karakter')
      return
    }

    // Check reserved words
    const { RESERVED_SHORT_CODES } = await import('@/lib/validation')
    if (RESERVED_SHORT_CODES.includes(value)) {
      setShortCodeError('Short code ini sudah digunakan oleh sistem')
      return
    }

    // Check duplicate (debounced)
    const timeoutId = setTimeout(async () => {
      try {
        const excludeLinkId = link?.id
        const response = await fetch(`/api/links/check-short-code?code=${value}&exclude=${excludeLinkId || ''}`)

        if (!response.ok) {
          const error = await response.json()
          setShortCodeError(error.error || 'Short code sudah digunakan')
        }
      } catch (error) {
        console.error('[v0] Error checking short code:', error)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = link ? `/api/links/${link.id}` : '/api/links'
      const method = link ? 'PATCH' : 'POST'

      // Convert status to flags
      const { is_public, is_active } = linkStatusToFlags(formData.status)

      // Build body data, excluding empty short_code and empty category_id
      const bodyData: Record<string, any> = {
        title: formData.title,
        url: formData.url,
        category_id: formData.category_id || undefined,
        is_public,
        is_active,
        short_code: formData.short_code || undefined
      }

      if (link) {
        bodyData.id = link.id
      } else {
        bodyData.user_id = userId
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
      } else {
        const data = await response.json()
        console.error('[v0] Error saving link:', data.error)
        alert(data.error || 'Terjadi kesalahan saat menyimpan')
      }
    } catch (error) {
      console.error('[v0] Error saving link:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600" />
            {link ? 'Edit Link' : 'Tambah Link Baru'}
          </DialogTitle>
          <DialogDescription>
            {link ? 'Ubah detail link di bawah ini.' : 'Kelola link dan atur visibilitasnya.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info Section */}
          <div className="space-y-4">
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
          </div>

          <div className="border-t border-slate-100" />

          {/* Short Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="short_code">Short Code (Opsional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateShortCode}
                disabled={generatingShortCode}
                className="h-7 text-xs"
              >
                {generatingShortCode ? '...' : '🔄 Auto-generate'}
              </Button>
            </div>
            <Input
              id="short_code"
              placeholder="Biarkan kosong untuk auto-generate"
              value={formData.short_code}
              onChange={(e) => handleShortCodeChange(e.target.value)}
            />
            {formData.short_code && (
              <p className="text-xs text-slate-500">
                Short link: <span className="font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/{formData.short_code}</span>
              </p>
            )}
            {shortCodeError && (
              <p className="text-xs text-red-500">{shortCodeError}</p>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Category Section */}
          <div className="space-y-2">
            <Label htmlFor="category">Pilih Kategori</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-slate-100" />

          {/* Status Section */}
          <div className="flex items-start gap-2">
            <Settings2 className="h-4 w-4 text-slate-500 mt-0.5" />
            <div className="flex-1">
              <LinkStatusSegmentedControl
                value={formData.status}
                onChange={(status) => setFormData({ ...formData, status })}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Menyimpan...' : 'Simpan Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}