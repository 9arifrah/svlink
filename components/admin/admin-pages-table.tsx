'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Layout, Trash2, ToggleLeft, ToggleRight, Loader2, ExternalLink, Search } from 'lucide-react'

type PageData = {
  id: string
  title: string
  slug: string
  user_email: string
  is_active: boolean
  created_at: string
}

export function AdminPagesTable() {
  const router = useRouter()
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPages = searchQuery
    ? pages.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (page.user_email || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pages

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages')
      const data = await response.json()
      if (data.success) {
        setPages(data.pages)
      }
    } catch (error) {
      console.error('[v0] Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const handleToggle = async (page: PageData) => {
    setTogglingId(page.id)
    try {
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !page.is_active }),
      })

      if (response.ok) {
        fetchPages()
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal mengubah status halaman')
      }
    } catch (error) {
      console.error('[v0] Error toggling page:', error)
      alert('Terjadi kesalahan saat mengubah status')
    } finally {
      setTogglingId(null)
    }
  }

  const confirmDelete = (page: PageData) => {
    setPageToDelete(page)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!pageToDelete) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/pages/${pageToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDeleteOpen(false)
        setPageToDelete(null)
        fetchPages()
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menghapus halaman')
      }
    } catch (error) {
      console.error('[v0] Error deleting page:', error)
      alert('Terjadi kesalahan saat menghapus halaman')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="shadow-soft-md border-slate-700/50 bg-slate-800/50 backdrop-blur">
        <CardHeader className="border-b border-slate-700/50 p-4 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" />
              <span className="text-white text-sm sm:text-base">
                Halaman Publik ({filteredPages.length})
              </span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari halaman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-700/50 bg-slate-700/30 p-8 sm:p-12 text-center">
              <Layout className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-slate-500" />
              <p className="text-xs sm:text-sm text-slate-400">
                {searchQuery ? 'Tidak ada hasil yang ditemukan' : 'Belum ada halaman publik'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-700/50">
                      <TableHead className="whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4 text-sm">Judul</TableHead>
                      <TableHead className="whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4 text-sm">Slug</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4 text-sm">Email Pengguna</TableHead>
                      <TableHead className="whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4 text-sm">Status</TableHead>
                      <TableHead className="hidden md:table-cell whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4 text-sm">Dibuat</TableHead>
                      <TableHead className="text-right whitespace-nowrap py-2 sm:py-3 text-sm">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.map((page) => (
                      <TableRow key={page.id} className="hover:bg-slate-700/50">
                        <TableCell className="font-medium text-white whitespace-nowrap text-sm py-2 sm:py-4 pr-2 sm:pr-4">
                          {page.title}
                        </TableCell>
                        <TableCell className="whitespace-nowrap py-2 sm:py-4 pr-2 sm:pr-4">
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline text-sm"
                          >
                            <span className="truncate max-w-[120px] sm:max-w-none">{page.slug}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-slate-400 max-w-[180px] truncate text-xs py-2 sm:py-4 pr-2 sm:pr-4">
                          {page.user_email}
                        </TableCell>
                        <TableCell className="whitespace-nowrap py-2 sm:py-4 pr-2 sm:pr-4">
                          <Badge variant={page.is_active ? 'success' : 'secondary'} className="text-xs">
                            {page.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-400 whitespace-nowrap text-xs py-2 sm:py-4 pr-2 sm:pr-4">
                          {new Date(page.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap py-2 sm:py-4">
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggle(page)}
                              disabled={togglingId === page.id}
                              className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-white hover:bg-slate-700/50"
                            >
                              {togglingId === page.id ? (
                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                              ) : page.is_active ? (
                                <ToggleRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              ) : (
                                <ToggleLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(page)}
                              className="h-8 w-8 sm:h-9 sm:w-9 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="rounded-lg border border-slate-700/50 bg-slate-700/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">
                          {page.title}
                        </div>
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-0.5"
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">/{page.slug}</span>
                        </a>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {page.user_email}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <Badge variant={page.is_active ? 'success' : 'secondary'} className="text-[10px]">
                          {page.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(page)}
                            disabled={togglingId === page.id}
                            className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                          >
                            {togglingId === page.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : page.is_active ? (
                              <ToggleRight className="h-3.5 w-3.5" />
                            ) : (
                              <ToggleLeft className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => confirmDelete(page)}
                            className="h-7 w-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Dibuat {new Date(page.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700/50 max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-base sm:text-lg">
              Hapus Halaman?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-xs sm:text-sm">
              Apakah Anda yakin ingin menghapus halaman &quot;{pageToDelete?.title}&quot;?
              Tindakan ini tidak dapat dibatalkan dan semua tautan terkait akan dilepas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
