'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Edit, Trash2, ExternalLink, Plus, Eye, Link2, LayoutGrid, List, AlignJustify } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Page {
  id: string
  slug: string
  title: string
  description: string | null
  theme_color: string
  layout_style: string
  is_active: number
  click_count: number
  link_count?: number
  created_at: string
}

interface PagesListProps {
  pages: Page[]
}

const layoutLabels: Record<string, { label: string; icon: typeof List }> = {
  list: { label: 'List', icon: List },
  grid: { label: 'Grid', icon: LayoutGrid },
  compact: { label: 'Compact', icon: AlignJustify },
}

export function PagesList({ pages }: PagesListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const pageToDelete = pages.find(p => p.id === deleteId)

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('[v0] Error deleting page:', error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  }

  if (pages.length === 0) {
    return (
      <Card className="border-slate-200/60 overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Belum ada Halaman Publik</h3>
          <p className="text-xs sm:text-sm text-slate-500 text-center mb-5 max-w-sm">
            Buat halaman publik pertama Anda untuk mengumpulkan dan membagikan link-link penting dalam satu tempat.
          </p>
          <a
            href="/dashboard/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat Page Pertama
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:gap-4">
        {pages.map((page) => {
          const layout = layoutLabels[page.layout_style] || layoutLabels.list
          const LayoutIcon = layout.icon

          return (
            <Card key={page.id} className="border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden group">
              {/* Theme color strip */}
              <div className="h-1" style={{ backgroundColor: page.theme_color }} />
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Theme-colored icon */}
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: page.theme_color + '15' }}
                    >
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: page.theme_color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                          {page.title}
                        </h3>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] sm:text-xs font-medium rounded-full shrink-0',
                            page.is_active
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-slate-50 text-slate-500 border border-slate-200'
                          )}
                        >
                          {page.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>

                      {page.description && (
                        <p className="text-xs sm:text-sm text-slate-500 mb-1.5 line-clamp-1">
                          {page.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-400">
                        <span className="font-mono truncate max-w-[120px] sm:max-w-none">/{page.slug}</span>
                        <span className="flex items-center gap-0.5">
                          <Link2 className="w-3 h-3" />
                          {page.link_count || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          {page.click_count || 0}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-0.5">
                          <LayoutIcon className="w-3 h-3" />
                          {layout.label}
                        </span>
                        <span className="hidden sm:inline">{formatDate(page.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Buka halaman publik"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={`/dashboard/pages/${page.id}/edit`}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit halaman"
                    >
                      <Edit className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setDeleteId(page.id)}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus halaman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Hapus Halaman</DialogTitle>
            <DialogDescription>
              {pageToDelete ? (
                <>
                  Apakah Anda yakin ingin menghapus halaman <strong>&ldquo;{pageToDelete.title}&rdquo;</strong>?
                  {pageToDelete.link_count && pageToDelete.link_count > 0 && (
                    <span className="block mt-1 text-amber-600">
                      Halaman ini memiliki {pageToDelete.link_count} link yang akan dilepas dari halaman (link tetap tersedia di Kelola Link).
                    </span>
                  )}
                </>
              ) : (
                'Apakah Anda yakin ingin menghapus halaman ini? Tindakan ini tidak dapat dibatalkan.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}