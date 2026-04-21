'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Save, Upload, X, Image as ImageIcon, Loader2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 500 * 1024 // 500KB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

type SettingsFormProps = {
  user: any
  settings: any
  userId: string
}

export function SettingsForm({ user, settings, userId }: SettingsFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [deleteLogo, setDeleteLogo] = useState(false)
  
  const [formData, setFormData] = useState({
    displayName: user?.display_name || '',
    customSlug: user?.custom_slug || '',
    profileDescription: settings?.profile_description || '',
    pageTitle: settings?.page_title || '',
    logoUrl: settings?.logo_url || '',
    themeColor: settings?.theme_color || '#3b82f6',
    showCategories: settings?.show_categories ?? true,
    layoutStyle: settings?.layout_style || 'list'
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.display_name || '',
        customSlug: user.custom_slug || ''
      }))
    }
    if (settings) {
      setFormData(prev => ({
        ...prev,
        profileDescription: settings.profile_description || '',
        pageTitle: settings.page_title || '',
        logoUrl: settings.logo_url || '',
        themeColor: settings.theme_color || '#3b82f6',
        showCategories: settings.show_categories ?? true,
        layoutStyle: settings.layout_style || 'list'
      }))
      if (settings.logo_url) {
        setLogoPreview(settings.logo_url)
      }
    }
  }, [user, settings])

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
    setDeleteLogo(false)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleDeleteLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
    setDeleteLogo(true)
    setLogoError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let finalLogoUrl = formData.logoUrl

      // Handle logo deletion
      if (deleteLogo && formData.logoUrl) {
        await fetch('/api/upload-logo', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoUrl: formData.logoUrl })
        })
        finalLogoUrl = ''
      }

      // Handle logo upload
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

      // Update user profile
      if (formData.displayName || formData.customSlug) {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: formData.displayName,
            custom_slug: formData.customSlug || null
          })
        })
      }

      // Update settings
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_description: formData.profileDescription,
          page_title: formData.pageTitle,
          logo_url: finalLogoUrl || null,
          theme_color: formData.themeColor,
          show_categories: formData.showCategories,
          layout_style: formData.layoutStyle
        })
      })

      if (response.ok) {
        setMessage('Pengaturan berhasil disimpan!')
        setLogoFile(null)
        setDeleteLogo(false)
        setLogoError('')
        setTimeout(() => setMessage(''), 3000)
        router.refresh()
      } else {
        const data = await response.json()
        setMessage(data.error || 'Gagal menyimpan pengaturan')
      }
    } catch (error) {
      console.error('[v0] Error saving settings:', error)
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const publicUrl = formData.customSlug
    ? `${window.location.origin}/${formData.customSlug}`
    : `${window.location.origin}/[belum diatur]`

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Profil Saya
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="displayName" className="text-xs sm:text-sm">Nama Tampilan</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Nama Anda"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="customSlug" className="text-xs sm:text-sm">URL Kustom</Label>
              <Input
                id="customSlug"
                value={formData.customSlug}
                onChange={(e) => setFormData({ ...formData, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="nama-anda"
              />
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Halaman publik Anda:</span>
                <a 
                  href={publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {publicUrl}
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Halaman Publik</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="profileDescription" className="text-xs sm:text-sm">Deskripsi Profil</Label>
              <Textarea
                id="profileDescription"
                value={formData.profileDescription}
                onChange={(e) => setFormData({ ...formData, profileDescription: e.target.value })}
                placeholder="Ceritakan sedikit tentang diri Anda..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="pageTitle" className="text-xs sm:text-sm">Judul Halaman</Label>
              <Input
                id="pageTitle"
                value={formData.pageTitle}
                onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                placeholder="Nama Link Saya"
              />
              <p className="text-[10px] sm:text-xs text-slate-500">Judul yang akan ditampilkan di halaman publik Anda</p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Logo</Label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="h-20 w-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Pilih Gambar
                    </Button>
                    {(logoPreview || formData.logoUrl) && !deleteLogo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteLogo}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Hapus Logo
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500">PNG, JPG, GIF, WebP. Max 500KB. Rekomendasi: 200x200px</p>
                </div>
              </div>
              {logoError && (
                <p className="text-sm text-red-600">{logoError}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="themeColor" className="text-xs sm:text-sm">Warna Tema</Label>
              <div className="flex gap-3">
                <Input
                  id="themeColor"
                  type="color"
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="showCategories" className="text-base">Tampilkan Kategori</Label>
                <div className="text-sm text-slate-500">
                  {formData.showCategories ? 'Kategori akan ditampilkan' : 'Kategori disembunyikan'}
                </div>
              </div>
              <Switch
                id="showCategories"
                checked={formData.showCategories}
                onCheckedChange={(checked) => setFormData({ ...formData, showCategories: checked })}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Gaya Layout</Label>
              <p className="text-sm text-slate-500">Pilih tampilan link di halaman publik Anda</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: 'list',
                    label: 'List',
                    desc: 'Vertikal',
                    preview: (
                      <div className="flex flex-col gap-1 w-full px-2">
                        <div className="h-2 rounded-sm w-full" style={{ backgroundColor: `${formData.themeColor}40` }} />
                        <div className="h-2 rounded-sm w-full" style={{ backgroundColor: `${formData.themeColor}40` }} />
                        <div className="h-2 rounded-sm w-full" style={{ backgroundColor: `${formData.themeColor}40` }} />
                      </div>
                    )
                  },
                  {
                    value: 'grid',
                    label: 'Grid',
                    desc: '2 Kolom',
                    preview: (
                      <div className="grid grid-cols-2 gap-1 w-full px-2">
                        <div className="h-4 rounded-sm" style={{ backgroundColor: `${formData.themeColor}40` }} />
                        <div className="h-4 rounded-sm" style={{ backgroundColor: `${formData.themeColor}40` }} />
                        <div className="h-4 rounded-sm" style={{ backgroundColor: `${formData.themeColor}40` }} />
                        <div className="h-4 rounded-sm" style={{ backgroundColor: `${formData.themeColor}40` }} />
                      </div>
                    )
                  },
                  {
                    value: 'compact',
                    label: 'Compact',
                    desc: 'Ringkas',
                    preview: (
                      <div className="flex flex-col gap-0.5 w-full px-2">
                        <div className="h-1.5 rounded-sm w-full" style={{ backgroundColor: `${formData.themeColor}40` }} />
                        <div className="h-1.5 rounded-sm w-full" style={{ backgroundColor: `${formData.themeColor}40` }} />
                        <div className="h-1.5 rounded-sm w-full" style={{ backgroundColor: `${formData.themeColor}40` }} />
                        <div className="h-1.5 rounded-sm w-full" style={{ backgroundColor: `${formData.themeColor}40` }} />
                      </div>
                    )
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, layoutStyle: option.value })}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      formData.layoutStyle === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-center h-10">
                      {option.preview}
                    </div>
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-slate-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <div className={`rounded-lg p-4 text-sm ${
                message.includes('berhasil') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                type="submit" 
                disabled={loading || uploadingLogo}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {(loading || uploadingLogo) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Pengaturan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview Halaman Publik
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 overflow-hidden">
            {/* Mini public page preview */}
            <div className="mx-auto max-w-md">
              {/* Header */}
              <div className="mb-8 text-center">
                {logoPreview ? (
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow border border-white/50 overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl shadow border border-white/50"
                    style={{ backgroundColor: formData.themeColor }}
                  >
                    <ExternalLink className="h-8 w-8 text-white" />
                  </div>
                )}
                <h1 className="mb-2 text-xl font-bold text-slate-900">
                  {formData.pageTitle || formData.displayName || 'Nama Halaman'}
                </h1>
                {formData.profileDescription && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {formData.profileDescription}
                  </p>
                )}
              </div>

              {/* Sample link cards — adapts to layout style */}
              <div className={cn(
                formData.layoutStyle === 'grid'
                  ? 'grid grid-cols-2 gap-3'
                  : formData.layoutStyle === 'compact'
                  ? 'space-y-2'
                  : 'space-y-3'
              )}>
                {['Contoh Link 1', 'Contoh Link 2', 'Contoh Link 3'].map((title, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg border bg-white shadow-sm",
                      "border-l-4",
                      formData.layoutStyle === 'compact' ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
                    )}
                    style={{
                      borderLeftColor: formData.themeColor,
                      borderTopColor: `${formData.themeColor}30`,
                      borderRightColor: `${formData.themeColor}30`,
                      borderBottomColor: `${formData.themeColor}30`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-semibold text-slate-900 truncate",
                          formData.layoutStyle === 'compact' ? 'text-sm' : 'text-sm'
                        )}>
                          {title}
                        </h3>
                        {formData.layoutStyle !== 'compact' && (
                          <p className="mt-0.5 text-xs text-slate-500 truncate">
                            Deskripsi singkat link ini
                          </p>
                        )}
                      </div>
                      <ExternalLink
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: formData.themeColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Theme color indicator */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <div
                  className="h-3 w-3 rounded-full border border-white shadow"
                  style={{ backgroundColor: formData.themeColor }}
                />
                <span>Warna tema: {formData.themeColor}</span>
              </div>
            </div>
          </div>

          {/* View public page button */}
          {formData.customSlug && (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <a
                  href={`/${formData.customSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Lihat Halaman Publik
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}