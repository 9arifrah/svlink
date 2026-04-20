'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Check, X, AlertCircle, ImagePlus, Trash2, ArrowUp, ArrowDown, Search, Plus, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Link {
  id: string
  title: string
  url: string
  short_code: string | null
}

interface PageFormProps {
  mode: 'create' | 'edit'
  pageId?: string
  initialData?: {
    slug: string
    title: string
    description: string
    logo_url: string
    theme_color: string
    layout_style: string
    show_categories: boolean
    is_active: boolean
    selectedLinks: Link[]
  }
}

const THEME_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
]

const LAYOUT_STYLES = [
  { name: 'List', value: 'list', icon: '☰' },
  { name: 'Grid', value: 'grid', icon: '⊞' },
  { name: 'Compact', value: 'compact', icon: '≡' },
]

export function PageForm({ mode, pageId, initialData }: PageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [themeColor, setThemeColor] = useState(initialData?.theme_color || '#3b82f6')
  const [layoutStyle, setLayoutStyle] = useState(initialData?.layout_style || 'list')
  const [showCategories, setShowCategories] = useState(initialData?.show_categories ?? true)
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || '')
  
  // Links state
  const [availableLinks, setAvailableLinks] = useState<Link[]>([])
  const [selectedLinks, setSelectedLinks] = useState<Link[]>(initialData?.selectedLinks || [])
  const [linkSearch, setLinkSearch] = useState('')
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'info' | 'style' | 'links' | 'preview'>('info')
  
  // Slug validation
  const [slugValid, setSlugValid] = useState<boolean | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)

  useEffect(() => {
    if (mode === 'edit') {
      fetchLinks()
    }
  }, [mode])

  useEffect(() => {
    if (mode === 'create' && slug) {
      checkSlug()
    } else if (mode === 'edit' && slug && slug !== initialData?.slug) {
      checkSlug()
    } else {
      setSlugValid(null)
    }
  }, [slug])

  const checkSlug = async () => {
    if (!slug || slug.length < 3) {
      setSlugValid(false)
      return
    }
    
    setSlugChecking(true)
    try {
      const res = await fetch(`/api/pages/check-slug?slug=${slug}${pageId ? `&exclude=${pageId}` : ''}`)
      const data = await res.json()
      setSlugValid(!data.exists)
    } catch {
      setSlugValid(null)
    } finally {
      setSlugChecking(false)
    }
  }

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links')
      const data = await res.json()
      setAvailableLinks(data.links || [])
    } catch (error) {
      console.error('[v0] Error fetching links:', error)
    }
  }

  const addLink = (link: Link) => {
    if (!selectedLinks.find(l => l.id === link.id)) {
      setSelectedLinks([...selectedLinks, link])
    }
    setLinkSearch('')
  }

  const removeLink = (linkId: string) => {
    setSelectedLinks(selectedLinks.filter(l => l.id !== linkId))
  }

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...selectedLinks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newLinks.length) return
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]]
    setSelectedLinks(newLinks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'create' ? '/api/pages' : `/api/pages/${pageId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description: description || null,
          theme_color: themeColor,
          layout_style: layoutStyle,
          show_categories: showCategories,
          is_active: isActive,
          logo_url: logoUrl || null,
          link_ids: selectedLinks.map(l => l.id)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/pages')
        router.refresh()
      }, 1000)
    } catch (err) {
      console.error('[v0] Error saving page:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const filteredAvailableLinks = availableLinks.filter(
    link => 
      !selectedLinks.find(s => s.id === link.id) &&
      (link.title.toLowerCase().includes(linkSearch.toLowerCase()) ||
       link.url.toLowerCase().includes(linkSearch.toLowerCase()))
  )

  const tabs = [
    { id: 'info', label: 'Info', icon: '📝' },
    { id: 'style', label: 'Gaya', icon: '🎨' },
    { id: 'links', label: 'Link', icon: '🔗' },
    { id: 'preview', label: 'Preview', icon: '👁️' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Halaman</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Page Pribadi"
                required
                className="border-slate-200 focus:border-blue-400"
              />
              <p className="text-xs text-slate-500">Tampilan judul di halaman publik</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Kustom (Slug)</Label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm whitespace-nowrap">svlink.id/</span>
                <div className="relative flex-1">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="page-pribadi"
                    required
                    minLength={3}
                    className={cn(
                      'border-slate-200 focus:border-blue-400',
                      slugValid === true && 'border-green-500 bg-green-50',
                      slugValid === false && 'border-red-500 bg-red-50'
                    )}
                  />
                  {slugChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}
                  {!slugChecking && slugValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {slugValid ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              {slugValid === false && (
                <p className="text-xs text-red-500">Slug sudah digunakan atau tidak valid</p>
              )}
              {slugValid === true && (
                <p className="text-xs text-green-600">✓ Slug tersedia</p>
              )}
              <p className="text-xs text-slate-500">Huruf kecil, angka, dan strip. Min 3 karakter.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Deskripsi halaman Anda..."
                rows={3}
                className="border-slate-200 focus:border-blue-400 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label>Status</Label>
              <div className="flex gap-4">
                <label className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors flex-1',
                  isActive 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-slate-200 text-slate-600'
                )}>
                  <input
                    type="radio"
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                    className="sr-only"
                  />
                  <span className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    isActive ? 'border-green-500' : 'border-slate-300'
                  )}>
                    {isActive && <span className="w-2 h-2 rounded-full bg-green-500" />}
                  </span>
                  Aktif
                </label>
                <label className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors flex-1',
                  !isActive 
                    ? 'border-slate-400 bg-slate-50 text-slate-700' 
                    : 'border-slate-200 text-slate-400'
                )}>
                  <input
                    type="radio"
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                    className="sr-only"
                  />
                  <span className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    !isActive ? 'border-slate-400' : 'border-slate-300'
                  )}>
                    {!isActive && <span className="w-2 h-2 rounded-full bg-slate-400" />}
                  </span>
                  Nonaktif
                </label>
              </div>
              <p className="text-xs text-slate-500">
                {isActive ? 'Halaman bisa diakses publik' : 'Halaman disembunyikan sementara'}
              </p>
            </div>
          </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Logo Halaman</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative">
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="w-16 h-16 rounded-xl object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <ImagePlus className="w-6 h-6" />
                  </div>
                )}
                <Input
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="Masukkan URL logo..."
                  className="flex-1 border-slate-200"
                />
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, GIF, WebP. Max 500KB. Rekomendasi: 200x200px</p>
            </div>

            <div className="space-y-3">
              <Label>Warna Tema</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setThemeColor(themeColor)}
                  className="w-10 h-10 rounded-xl border-2 border-current flex items-center justify-center"
                  style={{ color: themeColor }}
                >
                  <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: themeColor }} />
                </button>
                <Input
                  value={themeColor}
                  onChange={e => setThemeColor(e.target.value)}
                  className="w-32 font-mono border-slate-200"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {THEME_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setThemeColor(color.value)}
                    className={cn(
                      'w-8 h-8 rounded-lg transition-transform hover:scale-110',
                      themeColor === color.value && 'ring-2 ring-offset-2 ring-slate-400'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Gaya Layout</Label>
              <div className="grid grid-cols-3 gap-3">
                {LAYOUT_STYLES.map(style => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setLayoutStyle(style.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-center transition-colors',
                      layoutStyle === style.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className="text-sm font-medium">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tampilkan Kategori</Label>
              <div className="flex gap-4">
                <label className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors flex-1',
                  showCategories 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 text-slate-600'
                )}>
                  <input
                    type="radio"
                    checked={showCategories}
                    onChange={() => setShowCategories(true)}
                    className="sr-only"
                  />
                  Ya
                </label>
                <label className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors flex-1',
                  !showCategories 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 text-slate-600'
                )}>
                  <input
                    type="radio"
                    checked={!showCategories}
                    onChange={() => setShowCategories(false)}
                    className="sr-only"
                  />
                  Tidak
                </label>
              </div>
              <p className="text-xs text-slate-500">
                {showCategories ? 'Link dikelompokkan per kategori' : 'Semua link dalam 1 list'}
              </p>
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Link Terpilih ({selectedLinks.length})</Label>
              {selectedLinks.length === 0 ? (
                <Card className="border-dashed border-slate-300">
                  <CardContent className="py-8 text-center text-slate-500">
                    <p className="mb-2">Belum ada link dipilih</p>
                    <p className="text-sm">Pilih dari daftar link di bawah</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {selectedLinks.map((link, index) => (
                    <div 
                      key={link.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border"
                    >
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{link.title}</p>
                        <p className="text-xs text-slate-500 truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLink(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(index, 'down')}
                          disabled={index === selectedLinks.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-6 space-y-3">
              <Label>Tambah Link</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={linkSearch}
                  onChange={e => setLinkSearch(e.target.value)}
                  placeholder="Cari link..."
                  className="pl-10 border-slate-200"
                />
              </div>
              
              {filteredAvailableLinks.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredAvailableLinks.slice(0, 10).map(link => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-300 cursor-pointer"
                      onClick={() => addLink(link)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate">{link.title}</p>
                        <p className="text-xs text-slate-500 truncate">{link.url}</p>
                      </div>
                      <Plus className="w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              ) : linkSearch ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Tidak ada link yang cocok
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <Label>Preview Halaman Publik</Label>
            <Card className="overflow-hidden">
              <div 
                className="p-6"
                style={{ backgroundColor: themeColor + '10' }}
              >
                {logoUrl && (
                  <div className="mb-4">
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="w-16 h-16 rounded-xl object-cover mx-auto"
                    />
                  </div>
                )}
                <h2 
                  className="text-2xl font-bold text-center mb-2"
                  style={{ color: themeColor }}
                >
                  {title || 'Judul Halaman'}
                </h2>
                {description && (
                  <p className="text-slate-600 text-center mb-6">{description}</p>
                )}
                
                <div className={cn(
                  'space-y-3',
                  layoutStyle === 'grid' && 'grid grid-cols-2 gap-3',
                  layoutStyle === 'compact' && ''
                )}>
                  {selectedLinks.length > 0 ? (
                    selectedLinks.map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all',
                          layoutStyle === 'compact' && 'p-3'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{link.title}</p>
                          <p className="text-xs text-slate-500 truncate">{link.url}</p>
                        </div>
                        <span style={{ color: themeColor }}>→</span>
                      </a>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-8">
                      Pilih link untuk preview
                    </p>
                  )}
                </div>
              </div>
            </Card>
            
            {slug && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-slate-500">svlink.id/</span>
                <span className="font-mono">{slug}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          <Check className="h-4 w-4 flex-shrink-0" />
          Berhasil! Mengalihkan...
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={loading || (slugValid === false)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {loading ? 'Menyimpan...' : mode === 'create' ? 'Buat Halaman' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  )
}
