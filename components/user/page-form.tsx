'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, AlertCircle, ImagePlus, Trash2, ArrowUp, ArrowDown, Search, Plus, FileText, Link2, Palette, Loader2, Upload, Smartphone, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 500 * 1024 // 500KB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Visual layout preview SVGs
function ListLayoutIcon() {
  return (
    <svg viewBox="0 0 48 36" className="w-full h-auto" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="44" height="6" rx="2" className="stroke-current opacity-50" />
      <rect x="2" y="14" width="44" height="6" rx="2" className="stroke-current opacity-50" />
      <rect x="2" y="24" width="44" height="6" rx="2" className="stroke-current opacity-50" />
    </svg>
  )
}

function GridLayoutIcon() {
  return (
    <svg viewBox="0 0 48 36" className="w-full h-auto" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="15" rx="2" className="stroke-current opacity-50" />
      <rect x="26" y="2" width="20" height="15" rx="2" className="stroke-current opacity-50" />
      <rect x="2" y="20" width="20" height="15" rx="2" className="stroke-current opacity-50" />
      <rect x="26" y="20" width="20" height="15" rx="2" className="stroke-current opacity-50" />
    </svg>
  )
}

function CompactLayoutIcon() {
  return (
    <svg viewBox="0 0 48 36" className="w-full h-auto" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="44" height="4" rx="1" className="stroke-current opacity-50" />
      <rect x="2" y="11" width="44" height="4" rx="1" className="stroke-current opacity-50" />
      <rect x="2" y="19" width="44" height="4" rx="1" className="stroke-current opacity-50" />
      <rect x="2" y="27" width="44" height="4" rx="1" className="stroke-current opacity-50" />
    </svg>
  )
}

function PhoneFrame({ children, themeColor }: { children: React.ReactNode; themeColor: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mx-auto w-[280px] sm:w-[300px]">
        {/* Phone outer shell */}
        <div className="rounded-[2.5rem] border-[3px] border-slate-700 bg-slate-700 p-1.5 shadow-2xl">
          {/* Screen area */}
          <div className="rounded-[2rem] overflow-hidden bg-white min-h-[420px] sm:min-h-[480px]">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-1.5 pb-0.5 bg-slate-50">
              <span className="text-[9px] font-semibold text-slate-500">9:41</span>
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-1.5 rounded-sm border border-slate-400">
                  <div className="h-full bg-slate-400 rounded-sm" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
            {/* Notch */}
            <div className="flex justify-center -mt-1">
              <div className="w-16 h-4 bg-slate-700 rounded-b-2xl" />
            </div>
            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              {children}
            </div>
          </div>
        </div>
        {/* Home bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-400 rounded-full" />
      </div>
    </div>
  )
}

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
  
  // Logo upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(initialData?.logo_url || '')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState('')
  
  // Auto-slug tracking
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit')
  
  // Links state
  const [availableLinks, setAvailableLinks] = useState<Link[]>([])
  const [selectedLinks, setSelectedLinks] = useState<Link[]>(initialData?.selectedLinks || [])
  const [linkSearch, setLinkSearch] = useState('')
  
  // Tab state — no more "preview" tab
  const [activeTab, setActiveTab] = useState<'info' | 'style' | 'links'>('info')
  
  // Slug validation
  const [slugValid, setSlugValid] = useState<boolean | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)

  // Unsaved changes tracking
  const isDirty = useRef(false)
  const initialValues = useRef({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    themeColor: initialData?.theme_color || '#3b82f6',
    layoutStyle: initialData?.layout_style || 'list',
    showCategories: initialData?.show_categories ?? true,
    isActive: initialData?.is_active ?? true,
    logoUrl: initialData?.logo_url || '',
    selectedLinkIds: (initialData?.selectedLinks || []).map(l => l.id).join(','),
  })

  // Check if form has unsaved changes
  const checkDirty = useCallback(() => {
    const current = {
      title,
      slug,
      description,
      themeColor,
      layoutStyle,
      showCategories,
      isActive,
      logoUrl,
      selectedLinkIds: selectedLinks.map(l => l.id).join(','),
    }
    const init = initialValues.current
    isDirty.current = (
      current.title !== init.title ||
      current.slug !== init.slug ||
      current.description !== init.description ||
      current.themeColor !== init.themeColor ||
      current.layoutStyle !== init.layoutStyle ||
      current.showCategories !== init.showCategories ||
      current.isActive !== init.isActive ||
      current.logoUrl !== init.logoUrl ||
      current.selectedLinkIds !== init.selectedLinkIds ||
      !!logoFile
    )
  }, [title, slug, description, themeColor, layoutStyle, showCategories, isActive, logoUrl, selectedLinks, logoFile])

  // Auto-slug: generate from title unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      const generated = slugify(title)
      if (generated !== slug) {
        setSlug(generated)
      }
    }
  }, [title, slugManuallyEdited])

  // Track unsaved changes
  useEffect(() => {
    checkDirty()
  }, [checkDirty])

  // Browser beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty.current && !success) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [success])

  useEffect(() => {
    fetchLinks()
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
      setSlugValid(data.available)
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

  // Logo upload handlers
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoError('')

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLogoError('Format file tidak didukung. Gunakan PNG, JPG, GIF, atau WebP')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setLogoError('File terlalu besar (max 500KB)')
      return
    }

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setLogoUrl('') // Will be set after upload
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
    setLogoUrl('')
    setLogoError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
    ;[newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]]
    setSelectedLinks(newLinks)
  }

  const handleCancel = () => {
    if (isDirty.current && !success) {
      const confirmed = window.confirm('Perubahan belum disimpan. Yakin ingin keluar?')
      if (!confirmed) return
    }
    router.back()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Upload logo file if selected
      let finalLogoUrl = logoUrl
      if (logoFile) {
        setUploadingLogo(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', logoFile)

        const uploadResponse = await fetch('/api/upload-logo', {
          method: 'POST',
          body: uploadFormData
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          setLogoError(errorData.error || 'Gagal mengupload logo')
          setUploadingLogo(false)
          setLoading(false)
          return
        }

        const uploadData = await uploadResponse.json()
        finalLogoUrl = uploadData.url
        setUploadingLogo(false)
      }

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
          logo_url: finalLogoUrl || null,
          link_ids: selectedLinks.map(l => l.id)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan')
        return
      }

      isDirty.current = false
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
    { id: 'info' as const, label: 'Info', icon: FileText },
    { id: 'links' as const, label: 'Link', icon: Link2 },
    { id: 'style' as const, label: 'Gaya', icon: Palette },
  ]

  // Preview content rendered inside PhoneFrame — shared between Style tab and potential standalone use
  const previewContent = (
    <div
      className="min-h-full"
      style={{ backgroundColor: themeColor + '08' }}
    >
      <div className="relative overflow-hidden px-4 py-8">
        <div
          className="absolute top-10 right-0 w-48 h-48 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          style={{ backgroundColor: themeColor }}
        />
        <div
          className="absolute bottom-10 left-0 w-48 h-48 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative">
          {logoPreview ? (
            <div className="mb-3 text-center">
              <img
                src={logoPreview}
                alt="Logo"
                className="w-10 h-10 rounded-xl object-cover mx-auto border border-white/50 shadow-sm"
              />
            </div>
          ) : (
            <div className="mb-3 text-center">
              <div
                className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          <h2
            className="text-base font-bold text-center mb-1"
            style={{ color: themeColor }}
          >
            {title || 'Judul Halaman'}
          </h2>
          {description && (
            <p className="text-[10px] text-slate-500 text-center mb-4 line-clamp-2">
              {description}
            </p>
          )}

          <div className={cn(
            layoutStyle === 'grid' ? 'grid grid-cols-2 gap-1.5' : layoutStyle === 'compact' ? 'space-y-1' : 'space-y-1.5'
          )}>
            {selectedLinks.length > 0 ? (
              selectedLinks.slice(0, 5).map(link => (
                <div
                  key={link.id}
                  className="flex items-center gap-1.5 bg-white rounded-lg border cursor-default"
                  style={{
                    padding: layoutStyle === 'compact' ? '4px 8px' : '6px 10px',
                    borderLeftWidth: '3px',
                    borderLeftColor: themeColor,
                    borderTopColor: `${themeColor}20`,
                    borderRightColor: `${themeColor}20`,
                    borderBottomColor: `${themeColor}20`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate text-[11px] leading-tight">{link.title}</p>
                    {layoutStyle !== 'compact' && (
                      <p className="text-[9px] text-slate-400 truncate">{link.url}</p>
                    )}
                  </div>
                  <span style={{ color: themeColor }} className="text-xs">→</span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-6 text-[10px]">
                Pilih link di tab Link
              </p>
            )}
            {selectedLinks.length > 5 && (
              <p className="text-center text-[10px] text-slate-400">
                +{selectedLinks.length - 5} link lainnya
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-[8px] text-slate-400 mt-6">
          Powered by svlink
        </p>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex gap-0.5 sm:gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px] sm:min-h-[400px]">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">Judul Halaman</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Page Pribadi"
                required
                className="border-slate-200 focus:border-blue-400 text-sm"
              />
              <p className="text-[10px] sm:text-xs text-slate-500">Tampilan judul di halaman publik</p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug" className="text-xs sm:text-sm">URL Kustom (Slug)</Label>
                {slugManuallyEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlugManuallyEdited(false)
                      if (title) setSlug(slugify(title))
                    }}
                    className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700"
                  >
                    Reset otomatis dari judul
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-[10px] sm:text-sm text-slate-500 whitespace-nowrap">svlink.id/</span>
                <div className="relative flex-1">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={e => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                      setSlugManuallyEdited(true)
                    }}
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
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-slate-400" />
                    </div>
                  )}
                  {!slugChecking && slugValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {slugValid ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              {slugValid === false && (
                <p className="text-[10px] sm:text-xs text-red-500">Slug sudah digunakan atau tidak valid</p>
              )}
              {slugValid === true && (
                <p className="text-[10px] sm:text-xs text-green-600">✓ Slug tersedia</p>
              )}
              <p className="text-[10px] sm:text-xs text-slate-500">
                {slugManuallyEdited
                  ? 'Huruf kecil, angka, dan strip. Min 3 karakter.'
                  : 'Slug otomatis dibuat dari judul. Edit untuk mengubah manual.'}
              </p>
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
              <Label className="text-xs sm:text-sm">Status Halaman</Label>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 sm:p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {isActive ? 'Aktif' : 'Nonaktif'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    {isActive ? 'Halaman bisa diakses publik' : 'Halaman disembunyikan sementara'}
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm">Link Terpilih ({selectedLinks.length})</Label>
              {selectedLinks.length === 0 ? (
                <Card className="border-dashed border-slate-300">
                  <CardContent className="py-6 sm:py-8 text-center text-slate-500">
                    <Link2 className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="mb-1 text-sm sm:text-base font-medium">Belum ada link dipilih</p>
                    <p className="text-xs sm:text-sm mb-3">Pilih dari daftar link di bawah</p>
                    {availableLinks.length === 0 && (
                      <a
                        href="/dashboard/links"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Buat link baru terlebih dahulu
                      </a>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-1.5">
                  {selectedLinks.map((link, index) => (
                    <div 
                      key={link.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group"
                    >
                      <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-slate-100 text-[10px] sm:text-xs font-medium text-slate-500 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate text-sm">{link.title}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveLink(index, 'up')}
                          disabled={index === 0}
                          className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-20 transition-colors"
                          title="Pindah ke atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(index, 'down')}
                          disabled={index === selectedLinks.length - 1}
                          className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-20 transition-colors"
                          title="Pindah ke bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="p-1 sm:p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 sm:pt-6 space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm">Tambah Link</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <Input
                  value={linkSearch}
                  onChange={e => setLinkSearch(e.target.value)}
                  placeholder="Cari link..."
                  className="pl-10 border-slate-200 text-sm"
                />
              </div>
              
              {filteredAvailableLinks.length > 0 ? (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {filteredAvailableLinks.slice(0, 15).map(link => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border hover:border-blue-300 cursor-pointer group transition-colors"
                      onClick={() => addLink(link)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate text-sm">{link.title}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{link.url}</p>
                      </div>
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  ))}
                  {filteredAvailableLinks.length > 15 && (
                    <p className="text-center text-xs text-slate-400 py-1">
                      Dan {filteredAvailableLinks.length - 15} link lainnya — gunakan pencarian untuk memfilter
                    </p>
                  )}
                </div>
              ) : linkSearch ? (
                <p className="text-xs sm:text-sm text-slate-500 text-center py-3 sm:py-4">
                  Tidak ada link yang cocok
                </p>
              ) : availableLinks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500 mb-2">Belum ada link yang tersedia</p>
                  <a
                    href="/dashboard/links"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Buat link baru
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Style Tab — with inline preview */}
        {activeTab === 'style' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Controls + Preview: side-by-side on desktop, stacked on mobile */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              {/* Left: Style controls */}
              <div className="space-y-5 sm:space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm">Logo Halaman</Label>
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="relative group/logo shrink-0">
                      {logoPreview ? (
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-xl"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                        >
                          <ImagePlus className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400 mb-1" />
                          <span className="text-[9px] sm:text-[10px] text-slate-400">Upload</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleLogoSelect}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="text-xs"
                        >
                          {uploadingLogo ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Mengupload...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-1.5 h-3.5 w-3.5" />
                              Pilih File
                            </>
                          )}
                        </Button>
                        {(logoPreview || logoUrl) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveLogo}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Hapus
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        PNG, JPG, GIF, WebP. Max 500KB. Rekomendasi: 200x200px
                      </p>
                      {logoError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {logoError}
                        </p>
                      )}
                      <details className="mt-1">
                        <summary className="text-[10px] sm:text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                          Atau masukkan URL logo
                        </summary>
                        <Input
                          value={logoUrl}
                          onChange={e => {
                            setLogoUrl(e.target.value)
                            setLogoPreview(e.target.value)
                            setLogoFile(null)
                          }}
                          placeholder="https://example.com/logo.png"
                          className="mt-1.5 border-slate-200 text-xs h-8"
                        />
                      </details>
                    </div>
                  </div>
                </div>

                {/* Theme Color */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm">Warna Tema</Label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={themeColor}
                        onChange={e => setThemeColor(e.target.value)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                        title="Pilih warna kustom"
                      />
                    </div>
                    <Input
                      value={themeColor}
                      onChange={e => setThemeColor(e.target.value)}
                      className="w-24 sm:w-32 font-mono text-xs sm:text-sm border-slate-200"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {THEME_COLORS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setThemeColor(color.value)}
                        className={cn(
                          'w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-transform hover:scale-110',
                          themeColor === color.value && 'ring-2 ring-offset-2 ring-slate-400'
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Layout Style */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm">Gaya Layout</Label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setLayoutStyle('list')}
                      className={cn(
                        'p-3 sm:p-4 rounded-xl border-2 text-center transition-colors',
                        layoutStyle === 'list'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className={cn(
                        'mx-auto w-10 sm:w-12 mb-1.5',
                        layoutStyle === 'list' ? 'text-blue-600' : 'text-slate-400'
                      )}>
                        <ListLayoutIcon />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">List</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutStyle('grid')}
                      className={cn(
                        'p-3 sm:p-4 rounded-xl border-2 text-center transition-colors',
                        layoutStyle === 'grid'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className={cn(
                        'mx-auto w-10 sm:w-12 mb-1.5',
                        layoutStyle === 'grid' ? 'text-blue-600' : 'text-slate-400'
                      )}>
                        <GridLayoutIcon />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">Grid</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutStyle('compact')}
                      className={cn(
                        'p-3 sm:p-4 rounded-xl border-2 text-center transition-colors',
                        layoutStyle === 'compact'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className={cn(
                        'mx-auto w-10 sm:w-12 mb-1.5',
                        layoutStyle === 'compact' ? 'text-blue-600' : 'text-slate-400'
                      )}>
                        <CompactLayoutIcon />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">Compact</div>
                    </button>
                  </div>
                </div>

                {/* Show Categories */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm">Tampilkan Kategori</Label>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 sm:p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {showCategories ? 'Dikelompokkan per kategori' : 'Semua link dalam 1 list'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        {showCategories ? 'Link ditampilkan berdasarkan kategori' : 'Semua link ditampilkan tanpa pengelompokan'}
                      </p>
                    </div>
                    <Switch
                      checked={showCategories}
                      onCheckedChange={setShowCategories}
                    />
                  </div>
                </div>
              </div>

              {/* Right: Live Preview (hidden on mobile, shown on lg+) */}
              <div className="hidden lg:block">
                <div className="sticky top-6">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Preview Langsung</Label>
                    {slug && slugValid !== false && (
                      <a
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Buka halaman
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <PhoneFrame themeColor={themeColor}>
                    {previewContent}
                  </PhoneFrame>
                  {slug && (
                    <div className="flex items-center justify-center gap-1.5 text-xs mt-3">
                      <span className="text-slate-500">svlink.id/</span>
                      <span className="font-mono font-medium">{slug}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile preview: shown below controls on smaller screens */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm font-medium">Preview</Label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    <Smartphone className="w-3 h-3" />
                    Mobile
                  </span>
                </div>
                {slug && slugValid !== false && (
                  <a
                    href={`/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Buka halaman
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <PhoneFrame themeColor={themeColor}>
                {previewContent}
              </PhoneFrame>
              {slug && (
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  <span className="text-slate-500">svlink.id/</span>
                  <span className="font-mono font-medium">{slug}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm">
          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          Berhasil! Mengalihkan...
        </div>
      )}

      {/* Submit Buttons — sticky on mobile */}
      <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-t sm:border-slate-200">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading || uploadingLogo || (slugValid === false)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading || uploadingLogo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadingLogo ? 'Mengupload logo...' : 'Menyimpan...'}
              </>
            ) : mode === 'create' ? 'Buat Halaman' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </form>
  )
}