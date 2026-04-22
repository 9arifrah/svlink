'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({ title: '', message: '', is_active: true })

  async function fetchAnnouncements() {
    try {
      const res = await fetch('/api/admin/announcements', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setAnnouncements(data)
      } else {
        setError(data.error || 'Gagal memuat pengumuman')
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const url = editing
        ? `/api/admin/announcements?id=${editing.id}`
        : '/api/admin/announcements'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess(editing ? 'Pengumuman berhasil diperbarui' : 'Pengumuman berhasil dibuat')
        setOpen(false)
        setEditing(null)
        setFormData({ title: '', message: '', is_active: true })
        await fetchAnnouncements()
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus pengumuman ini?')) return
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setSuccess('Pengumuman berhasil dihapus')
        await fetchAnnouncements()
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal menghapus')
      }
    } catch {
      setError('Gagal terhubung ke server')
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
        credentials: 'include',
      })
      if (res.ok) {
        await fetchAnnouncements()
      }
    } catch {
      setError('Gagal terhubung ke server')
    }
  }

  function openEdit(announcement: Announcement) {
    setEditing(announcement)
    setFormData({
      title: announcement.title,
      message: announcement.message,
      is_active: announcement.is_active,
    })
    setOpen(true)
  }

  function openNew() {
    setEditing(null)
    setFormData({ title: '', message: '', is_active: true })
    setOpen(true)
  }

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur p-4 sm:p-6 shadow-soft-md">
      <div className="mb-4 sm:mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-cyan-600">
          <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Pengumuman Platform</h2>
          <p className="text-xs sm:text-sm text-slate-400">Kelola pengumuman untuk pengguna</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setFormData({ title: '', message: '', is_active: true }) } }}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Judul</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Pesan</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 mt-1 min-h-[100px]"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">Aktif</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600">
                  Batal
                </Button>
                <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editing ? 'Simpan' : 'Buat'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-700/50 bg-red-900/20 p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md border border-green-700/50 bg-green-900/20 p-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-center text-slate-400 py-8">Belum ada pengumuman</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-md border border-slate-700/50 bg-slate-700/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate">{a.title}</h3>
                    {a.is_active ? (
                      <Badge className="bg-green-900/30 text-green-400 border-green-700/50 text-xs">Aktif</Badge>
                    ) : (
                      <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/50 text-xs">Draft</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2">{a.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(a.id, a.is_active)}
                    className="p-2 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 transition-colors"
                    title={a.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {a.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(a)}
                    className="p-2 rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
