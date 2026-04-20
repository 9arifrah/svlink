'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertTriangle, Trash2, Check, AlertCircle, Lock, User, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileFormProps {
  user: {
    id: string
    email: string
    display_name: string
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(user.display_name || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessageType('error')
        setMessage(data.error || 'Gagal menyimpan')
      } else {
        setMessageType('success')
        setMessage('Profil berhasil diperbarui!')
        router.refresh()
      }
    } catch {
      setMessageType('error')
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {message && (
        <div className={cn(
          'flex items-center gap-2 p-3 rounded-lg text-sm',
          messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        )}>
          {messageType === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName">Nama Tampilan</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="displayName"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="pl-10 border-slate-200"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="email"
            value={user.email}
            disabled
            className="pl-10 bg-slate-50 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {loading ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </form>
  )
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (newPassword !== confirmPassword) {
      setMessageType('error')
      setMessage('Password baru tidak cocok')
      return
    }

    if (newPassword.length < 8) {
      setMessageType('error')
      setMessage('Password minimal 8 karakter')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessageType('error')
        setMessage(data.error || 'Gagal mengubah password')
      } else {
        setMessageType('success')
        setMessage('Password berhasil diubah!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setMessageType('error')
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleChangePassword} className="space-y-4">
      {message && (
        <div className={cn(
          'flex items-center gap-2 p-3 rounded-lg text-sm',
          messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        )}>
          {messageType === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Password Lama</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="pl-10 border-slate-200"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Password Baru</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="pl-10 border-slate-200"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="pl-10 border-slate-200"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {loading ? 'Mengubah...' : 'Ubah Password'}
      </Button>
    </form>
  )
}

export function DeleteAccountForm() {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()

    if (confirmText !== 'HAPUS') {
      setMessageType('error')
      setMessage('Ketik "HAPUS" untuk konfirmasi')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setMessageType('error')
        setMessage(data.error || 'Gagal menghapus akun')
      }
    } catch {
      setMessageType('error')
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleDelete} className="space-y-4">
      {message && (
        <div className={cn(
          'flex items-center gap-2 p-3 rounded-lg text-sm',
          messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        )}>
          {messageType === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message}
        </div>
      )}

      <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-red-700 font-medium">
          <AlertTriangle className="w-5 h-5" />
          Zona Berbahaya
        </div>
        <p className="text-sm text-red-600">
          Menghapus akun akan menghapus semua data:
        </p>
        <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
          <li>Semua link dan kategori</li>
          <li>Semua halaman publik</li>
          <li>Semua data statistik</li>
        </ul>
        <p className="text-sm text-red-600 font-medium">
          Akun tidak bisa dikembalikan!
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmDelete">Ketik "HAPUS" untuk konfirmasi:</Label>
        <Input
          id="confirmDelete"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="Ketik HAPUS"
          className="border-red-200 focus:border-red-500"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || confirmText !== 'HAPUS'}
        variant="destructive"
        className="bg-red-600 hover:bg-red-700"
      >
        {loading ? 'Menghapus...' : 'Hapus Akun Permanen'}
      </Button>
    </form>
  )
}
