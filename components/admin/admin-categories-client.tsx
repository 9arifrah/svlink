'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { IconPicker } from '@/components/shared/icon-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit2, Trash2, Loader2, Search, FolderTree } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  description?: string
  sort_order: number
  created_at: string
}

interface AdminCategoriesClientProps {
  initialCategories: Category[]
}

export function AdminCategoriesClient({ initialCategories }: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    description: '',
    sort_order: 0,
  })

  const filteredCategories = searchQuery
    ? categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('[v0] Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingId(category.id)
      setFormData({
        name: category.name,
        icon: category.icon,
        description: category.description || '',
        sort_order: category.sort_order,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        icon: '📁',
        description: '',
        sort_order: 0,
      })
    }
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId ? { ...formData, id: editingId } : formData
        ),
      })

      const data = await response.json()

      if (data.success) {
        const getResponse = await fetch('/api/admin/categories')
        const getData = await getResponse.json()
        if (getData.success) {
          setCategories(getData.categories)
        }
        setOpen(false)
      } else {
        alert(data.error || 'Gagal menyimpan kategori')
      }
    } catch (error) {
      console.error('[v0] Error saving category:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (data.success) {
        setCategories(categories.filter(c => c.id !== id))
        setDeleteConfirm(null)
      } else {
        alert(data.error || 'Gagal menghapus kategori')
      }
    } catch (error) {
      console.error('[v0] Error deleting category:', error)
      alert('Terjadi kesalahan saat menghapus')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Kategori</h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Kelola kategori untuk mengorganisir link
          </p>
        </div>

        {/* Categories Table Card */}
        <Card className="shadow-soft-md border-slate-700/50 bg-slate-800/50 backdrop-blur animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="border-b border-slate-700/50 p-4 sm:p-6">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" />
                <span className="text-white text-sm sm:text-base">
                  Kategori ({filteredCategories.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Cari kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 w-full sm:w-56 text-xs sm:text-sm"
                  />
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleOpenDialog()}
                      className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm whitespace-nowrap"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Tambah Kategori</span>
                      <span className="inline sm:hidden">Tambah</span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">
                        {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingId
                          ? 'Ubah informasi kategori'
                          : 'Buat kategori baru untuk mengorganisir link'}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Icon
                        </label>
                        <IconPicker
                          value={formData.icon}
                          onChange={(icon) =>
                            setFormData({ ...formData, icon })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Nama Kategori
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Contoh: Media Sosial"
                          required
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:bg-slate-700/70 focus:border-slate-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Deskripsi (Opsional)
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Jelaskan kategori ini..."
                          rows={3}
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:bg-slate-700/70 focus:border-slate-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Urutan
                        </label>
                        <Input
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sort_order: parseInt(e.target.value),
                            })
                          }
                          placeholder="0"
                          className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:bg-slate-700/70 focus:border-slate-500/50"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setOpen(false)}
                          className="bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:text-white hover:border-slate-500/50"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {submitting && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          {editingId ? 'Perbarui' : 'Buat'} Kategori
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-slate-700/50 bg-slate-700/30 p-8 sm:p-12 text-center">
                <FolderTree className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-slate-500" />
                <p className="text-xs sm:text-sm text-slate-400">
                  {searchQuery ? 'Tidak ada hasil yang ditemukan' : 'Belum ada kategori'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 mt-4"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Kategori Pertama
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur overflow-hidden overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-700/50">
                        <TableHead className="whitespace-nowrap text-sm">Icon</TableHead>
                        <TableHead className="whitespace-nowrap text-sm">Nama Kategori</TableHead>
                        <TableHead className="hidden md:table-cell whitespace-nowrap text-sm">Deskripsi</TableHead>
                        <TableHead className="hidden sm:table-cell whitespace-nowrap text-sm text-right">Urutan</TableHead>
                        <TableHead className="whitespace-nowrap text-sm text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow key={category.id} className="hover:bg-slate-700/50">
                          <TableCell className="text-2xl whitespace-nowrap">{category.icon}</TableCell>
                          <TableCell className="font-medium text-white whitespace-nowrap text-sm">
                            {category.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-400 max-w-xs truncate text-xs">
                            {category.description || '-'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-right text-slate-400 whitespace-nowrap text-xs">
                            {category.sort_order}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(category)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 h-9 w-9"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirm(category.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 h-9 w-9"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card view */}
                <div className="sm:hidden space-y-2">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-lg border border-slate-700/50 bg-slate-700/30 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{category.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm truncate">
                            {category.name}
                          </div>
                          {category.description && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {category.description}
                            </p>
                          )}
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Urutan: {category.sort_order}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenDialog(category)}
                            className="h-7 w-7 flex items-center justify-center rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(category.id)}
                            className="h-7 w-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700/50 max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-base sm:text-lg">
              Hapus Kategori?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-xs sm:text-sm">
              Apakah Anda yakin ingin menghapus kategori ini?
              Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada link
              yang menggunakan kategori ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm!)}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
