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
import { User, Shield, KeyRound } from 'lucide-react'

type User = {
  id: string
  email: string
  display_name?: string
  custom_slug?: string
  is_admin?: boolean
  created_at: string
}

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    display_name: '',
    custom_slug: '',
    is_admin: false
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        confirmPassword: '',
        display_name: user.display_name || '',
        custom_slug: user.custom_slug || '',
        is_admin: user.is_admin ?? false
      })
    } else {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        display_name: '',
        custom_slug: '',
        is_admin: false
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate password match for new users or when password is being changed
    if (!user && formData.password !== formData.confirmPassword) {
      alert('Password tidak cocok!')
      setLoading(false)
      return
    }

    if (user && formData.password && formData.password !== formData.confirmPassword) {
      alert('Password tidak cocok!')
      setLoading(false)
      return
    }

    try {
      const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users'
      const method = user ? 'PUT' : 'POST'
      
      // For editing, only include password if it's provided
      const bodyData = user 
        ? { 
            email: formData.email,
            display_name: formData.display_name || undefined,
            custom_slug: formData.custom_slug || undefined,
            is_admin: formData.is_admin,
            ...(formData.password ? { password: formData.password } : {})
          }
        : { 
            email: formData.email,
            password: formData.password,
            display_name: formData.display_name || undefined,
            custom_slug: formData.custom_slug || undefined,
            is_admin: formData.is_admin
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      const data = await response.json()

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
        // Also refresh the parent page
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else {
        alert(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('[v0] Error saving user:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            {user ? 'Edit User' : 'Tambah User Baru'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Ubah detail pengguna di bawah ini.' : 'Buat akun pengguna baru untuk platform.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 py-4">
          {/* Profile Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Contoh: admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-xs sm:text-sm">Nama Tampilan</Label>
              <Input
                id="display_name"
                type="text"
                placeholder="Contoh: John Doe"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_slug" className="text-xs sm:text-sm">Custom Slug (opsional)</Label>
              <Input
                id="custom_slug"
                type="text"
                placeholder="Contoh: john-doe"
                value={formData.custom_slug}
                onChange={(e) => setFormData({ ...formData, custom_slug: e.target.value })}
                className="text-sm"
              />
              <p className="text-[10px] sm:text-xs text-slate-500">
                Digunakan untuk URL publik (misal: /u/john-doe)
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Admin Access */}
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-slate-500 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={formData.is_admin}
                  onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <Label htmlFor="is_admin" className="cursor-pointer">
                  Berikan akses admin
                </Label>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 ml-6">
                Pengguna dengan akses admin dapat mengelola semua pengguna dan link.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Password Section */}
          <div className="flex items-start gap-2">
            <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 mt-0.5" />
            <div className="space-y-4 sm:space-y-6 flex-1">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm">
                  {user ? 'Password Baru (opsional)' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={user ? 'Biarkan kosong jika tidak ingin mengubah' : 'Masukkan password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!user}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">
                  {user ? 'Konfirmasi Password Baru' : 'Konfirmasi Password'}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={user ? 'Ulangi password baru' : 'Ulangi password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required={!user || formData.password.length > 0}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
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
              {loading ? 'Menyimpan...' : user ? 'Update User' : 'Buat User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}