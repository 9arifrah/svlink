'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Edit, Trash2, ExternalLink, Plus } from 'lucide-react'
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

export function PagesList({ pages }: PagesListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  if (pages.length === 0) {
    return (
      <Card className="border-slate-200/60">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Belum ada Halaman Publik</h3>
          <p className="text-slate-600 text-center mb-6 max-w-sm">
            Buat halaman publik pertama Anda dan bagikan link-link penting ke dunia!
          </p>
          <a
            href="/dashboard/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
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
      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.id} className="border-slate-200/60 hover:border-slate-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: page.theme_color + '20' }}
                  >
                    <FileText className="w-6 h-6" style={{ color: page.theme_color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{page.title}</h3>
                      <span 
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          page.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {page.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2 truncate">
                      {page.description || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="font-mono">/{page.slug}</span>
                      <span>{page.link_count || 0} link{page.link_count === 1 ? '' : 's'}</span>
                      <span>{page.click_count || 0} klik</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Buka di Tab Baru"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={`/dashboard/pages/${page.id}/edit`}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setDeleteId(page.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Halaman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus halaman ini? Tindakan ini tidak dapat dibatalkan.
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
