'use client'

import React from "react"

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
import { LinkStatusSegmentedControl, linkStatusToFlags, flagsToLinkStatus } from '@/components/user/link-status-segmented-control'
import { Link2, Settings2 } from 'lucide-react'

type LinkStatus = 'public' | 'private' | 'draft'

type LinkFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: Link
  categories: Category[]
}

export function LinkFormDialog({ open, onOpenChange, link, categories }: LinkFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category_id: '',
    status: 'public' as LinkStatus
  })

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        url: link.url,
        category_id: link.category_id,
        status: flagsToLinkStatus(link.is_public, link.is_active)
      })
    } else {
      setFormData({
        title: '',
        url: '',
        category_id: categories[0]?.id || '',
        status: 'public'
      })
    }
  }, [link, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { is_public, is_active } = linkStatusToFlags(formData.status)

      const bodyData: Record<string, any> = {
        title: formData.title,
        url: formData.url,
        category_id: formData.category_id || undefined,
        is_public,
        is_active
      }

      if (link) {
        bodyData.id = link.id
      }

      const response = await fetch('/api/admin/links', {
        method: link ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      console.error('[v0] Error saving link:', error)
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
            {link ? 'Ubah detail link pengguna ini.' : 'Buat link baru untuk pengguna.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="flex items-start gap-2">
            <Settings2 className="h-4 w-4 text-slate-500 mt-0.5" />
            <div className="flex-1">
              <LinkStatusSegmentedControl
                value={formData.status}
                onChange={(status) => setFormData({ ...formData, status })}
              />
            </div>
          </div>

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