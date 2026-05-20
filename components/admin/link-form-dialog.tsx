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
import { LinkStatusSegmentedControl, linkStatusToFlags, flagsToLinkStatus } from '@/components/user/link-status-segmented-control'
import { Link2, Settings2, PlusCircle, Check, X } from 'lucide-react'
import { IconPicker } from '@/components/shared/icon-picker'

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

  // Quick category create state
  const [quickCategoryOpen, setQuickCategoryOpen] = useState(false)
  const [quickCategoryName, setQuickCategoryName] = useState('')
  const [quickCategoryIcon, setQuickCategoryIcon] = useState('📁')
  const [quickCategoryLoading, setQuickCategoryLoading] = useState(false)
  const [localCategories, setLocalCategories] = useState<Category[]>([])

  // Sync local categories from props when dialog opens
  useEffect(() => {
    if (open) {
      setLocalCategories([...categories])
    }
  }, [open, categories])

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

  const handleQuickCreateCategory = async () => {
    if (!quickCategoryName.trim()) return
    setQuickCategoryLoading(true)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickCategoryName.trim(),
          icon: quickCategoryIcon
        })
      })

      if (res.ok) {
        const data = await res.json()
        const created = data.category || data
        setLocalCategories(prev => [...prev, created])
        setFormData(prev => ({ ...prev, category_id: created.id }))
        setQuickCategoryOpen(false)
        setQuickCategoryName('')
        setQuickCategoryIcon('📁')
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal membuat kategori')
      }
    } catch (error) {
      console.error('[v0] Quick create category error:', error)
      alert('Gagal membuat kategori')
    } finally {
      setQuickCategoryLoading(false)
    }
  }

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            {link ? 'Edit Link' : 'Tambah Link Baru'}
          </DialogTitle>
          <DialogDescription>
            {link ? 'Ubah detail link pengguna ini.' : 'Buat link baru untuk pengguna.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 py-4">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
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

            <div className="space-y-2">
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

          <div className="border-t border-slate-100" />

          {/* Category Section */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category" className="text-xs sm:text-sm">Pilih Kategori</Label>
              {!quickCategoryOpen && (
                <button
                  type="button"
                  onClick={() => setQuickCategoryOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-md px-2 py-1 -mr-2 transition-all duration-150"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Baru
                </button>
              )}
            </div>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger id="category" className="text-sm">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {localCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Inline Quick Create Category */}
            {quickCategoryOpen && (
              <div className="rounded-lg border border-blue-200/80 bg-gradient-to-b from-blue-50/80 to-blue-50/30 p-3 space-y-2.5 animate-fade-in shadow-sm">
                <div className="flex items-center gap-2">
                  <IconPicker value={quickCategoryIcon} onChange={setQuickCategoryIcon} />
                  <Input
                    autoFocus
                    placeholder="Nama kategori baru..."
                    value={quickCategoryName}
                    onChange={(e) => setQuickCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickCreateCategory() } }}
                    className="h-8 text-sm border-blue-200/60 focus-visible:ring-blue-400"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuickCategoryOpen(false)
                      setQuickCategoryName('')
                      setQuickCategoryIcon('📁')
                    }}
                    disabled={quickCategoryLoading}
                    className="h-7 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Batal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleQuickCreateCategory}
                    disabled={quickCategoryLoading || !quickCategoryName.trim()}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    {quickCategoryLoading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          <div className="flex items-start gap-2">
            <Settings2 className="h-4 w-4 text-slate-300 mt-0.5" />
            <div className="flex-1">
              <LinkStatusSegmentedControl
                value={formData.status}
                onChange={(status) => setFormData({ ...formData, status })}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              {loading ? 'Menyimpan...' : 'Simpan Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}