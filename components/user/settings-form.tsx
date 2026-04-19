'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Save, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

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
    showCategories: settings?.show_categories ?? true
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
        showCategories: settings.show_categories ?? true
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
          show_categories: formData.showCategories
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
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Profil Saya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nama Tampilan</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Nama Anda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customSlug">URL Kustom</Label>
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
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileDescription">Deskripsi Profil</Label>
              <Textarea
                id="profileDescription"
                value={formData.profileDescription}
                onChange={(e) => setFormData({ ...formData, profileDescription: e.target.value })}
                placeholder="Ceritakan sedikit tentang diri Anda..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageTitle">Judul Halaman</Label>
              <Input
                id="pageTitle"
                value={formData.pageTitle}
                onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                placeholder="Nama Link Saya"
              />
              <p className="text-xs text-slate-500">Judul yang akan ditampilkan di halaman publik Anda</p>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-start gap-4">
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
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
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
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Hapus Logo
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, GIF, WebP. Max 500KB. Rekomendasi: 200x200px</p>
                </div>
              </div>
              {logoError && (
                <p className="text-sm text-red-600">{logoError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="themeColor">Warna Tema</Label>
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

            {message && (
              <div className={`rounded-lg p-4 text-sm ${
                message.includes('berhasil') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={loading || uploadingLogo}
                className="bg-blue-600 hover:bg-blue-700"
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
    </div>
  )
}