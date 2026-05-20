'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { Link, Category } from '@/lib/supabase'
import { LinkFormDialog } from './link-form-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'

type SortKey = 'title' | 'owner' | 'category' | 'click_count' | 'status' | 'is_public'
type SortDirection = 'asc' | 'desc'

type LinksTableProps = {
  links: Link[]
  categories: Category[]
}

function SortHeader({ label, sortKey: key, currentKey, direction, onSort, className = '' }: {
  label: string
  sortKey: SortKey
  currentKey: SortKey | null
  direction: SortDirection
  onSort: (key: SortKey) => void
  className?: string
}) {
  const isActive = currentKey === key

  return (
    <th className={`pb-2 sm:pb-3 pr-2 sm:pr-4 whitespace-nowrap ${className}`}>
      <button
        type="button"
        onClick={() => onSort(key)}
        className={`inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors rounded px-1 -ml-1 ${
          isActive
            ? 'text-blue-400'
            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        {label}
        {isActive ? (
          direction === 'asc'
            ? <ArrowUp className="h-3.5 w-3.5 text-blue-400" />
            : <ArrowDown className="h-3.5 w-3.5 text-blue-400" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 opacity-40" />
        )}
      </button>
    </th>
  )
}

export function LinksTable({ links, categories }: LinksTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [deletingLink, setDeletingLink] = useState<Link | null>(null)
  const [deletePageCount, setDeletePageCount] = useState<number | undefined>(undefined)

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const filteredLinks = searchQuery
    ? links.filter((link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : links

  // Compare function for sorting
  const compareLinks = (a: any, b: any, key: SortKey, dir: SortDirection): number => {
    const multiplier = dir === 'asc' ? 1 : -1
    let valA: string | number, valB: string | number

    switch (key) {
      case 'title':
        valA = (a.title || '').toLowerCase()
        valB = (b.title || '').toLowerCase()
        return multiplier * (valA as string).localeCompare(valB as string)
      case 'owner':
        valA = (a.user?.display_name || a.user?.email || '').toLowerCase()
        valB = (b.user?.display_name || b.user?.email || '').toLowerCase()
        return multiplier * (valA as string).localeCompare(valB as string)
      case 'category':
        valA = (a.category?.name || '').toLowerCase()
        valB = (b.category?.name || '').toLowerCase()
        return multiplier * (valA as string).localeCompare(valB as string)
      case 'click_count':
        valA = a.click_count || 0
        valB = b.click_count || 0
        return multiplier * ((valA as number) - (valB as number))
      case 'status':
        valA = a.is_active ? 1 : 0
        valB = b.is_active ? 1 : 0
        return multiplier * ((valA as number) - (valB as number))
      case 'is_public':
        valA = a.is_public ? 1 : 0
        valB = b.is_public ? 1 : 0
        return multiplier * ((valA as number) - (valB as number))
      default:
        return 0
    }
  }

  // Sort handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  // Apply sort after filter
  const sortedLinks = sortKey
    ? [...filteredLinks].sort((a, b) => compareLinks(a, b, sortKey, sortDirection))
    : filteredLinks

  const handleDeleteClick = async (link: Link) => {
    try {
      const response = await fetch(`/api/admin/links?id=${link.id}`)
      if (response.ok) {
        const data = await response.json()
        setDeletePageCount(data.pageCount)
      } else {
        setDeletePageCount(undefined)
      }
    } catch (error) {
      console.error('[v0] Error fetching page count:', error)
      setDeletePageCount(undefined)
    }
    setDeletingLink(link)
  }

  const handleDelete = async (linkId: string) => {
    try {
      const response = await fetch('/api/admin/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: linkId })
      })

      if (response.ok) {
        router.refresh()
        setDeletingLink(null)
      }
    } catch (error) {
      console.error('[v0] Error deleting link:', error)
    }
  }

  return (
    <Card className="shadow-soft-md border-slate-700/50 bg-slate-800/50 backdrop-blur">
      <CardHeader className="border-b border-slate-700/50 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-white">Daftar Semua Link</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Link Baru
          </Button>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            placeholder="Cari link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-300 focus:bg-slate-700/70 focus:border-slate-500/50"
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 text-left text-sm font-medium text-slate-300">
                <SortHeader label="Judul Link" sortKey="title" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="Pemilik" sortKey="owner" currentKey={sortKey} direction={sortDirection} onSort={handleSort} className="hidden sm:table-cell" />
                <SortHeader label="Kategori" sortKey="category" currentKey={sortKey} direction={sortDirection} onSort={handleSort} className="hidden md:table-cell" />
                <SortHeader label="Klik" sortKey="click_count" currentKey={sortKey} direction={sortDirection} onSort={handleSort} className="hidden sm:table-cell" />
                <SortHeader label="Status" sortKey="status" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortHeader label="Publik" sortKey="is_public" currentKey={sortKey} direction={sortDirection} onSort={handleSort} className="hidden md:table-cell" />
                <th className="pb-2 sm:pb-3 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {sortedLinks.map((link: any) => (
                <tr key={link.id} className="text-sm hover:bg-slate-700/50">
                  <td className="py-2 sm:py-4 pr-2 sm:pr-4 min-w-[140px] sm:min-w-[180px]">
                    <div>
                      <div className="font-medium text-white text-xs sm:text-sm">{link.title}</div>
                      <div className="text-[10px] sm:text-xs text-slate-300 truncate max-w-[120px] sm:max-w-[180px]" title={link.url}>
                        {link.url}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell py-2 sm:py-4 pr-2 sm:pr-4 min-w-[100px]">
                    <div className="text-slate-300 truncate text-[10px] sm:text-xs" title={link.user?.display_name || link.user?.email || 'Admin'}>
                      {link.user?.display_name || link.user?.email || 'Admin'}
                    </div>
                  </td>
                  <td className="hidden md:table-cell py-2 sm:py-4 pr-2 sm:pr-4 whitespace-nowrap">
                    <Badge variant="category" className="text-[10px] sm:text-xs">{link.category?.name || 'N/A'}</Badge>
                  </td>
                  <td className="hidden sm:table-cell py-2 sm:py-4 pr-2 sm:pr-4 text-slate-300 whitespace-nowrap text-[10px] sm:text-xs">
                    {link.click_count || 0}
                  </td>
                  <td className="py-2 sm:py-4 pr-2 sm:pr-4 whitespace-nowrap">
                    <Badge variant={link.is_active ? 'success' : 'warning'} className="text-[10px] sm:text-xs">
                      {link.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="hidden md:table-cell py-2 sm:py-4 pr-2 sm:pr-4 whitespace-nowrap">
                    <Badge variant={link.is_public ? 'info' : 'warning'} className="text-[10px] sm:text-xs">
                      {link.is_public ? 'Ya' : 'Tidak'}
                    </Badge>
                  </td>
                  <td className="py-2 sm:py-4 whitespace-nowrap">
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingLink(link)}
                        className="h-8 w-8 sm:h-9 sm:w-9 bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:text-white hover:border-slate-500/50"
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteClick(link)}
                        className="h-8 w-8 sm:h-9 sm:w-9 bg-slate-700/50 border-slate-600/50 text-red-400 hover:bg-red-900/30 hover:text-red-300 hover:border-red-700/50"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedLinks.length === 0 && (
            <div className="py-12 text-center text-slate-300 min-w-[350px] text-xs sm:text-sm">
              {searchQuery ? 'Tidak ada hasil yang ditemukan' : 'Belum ada link'}
            </div>
          )}
        </div>
      </CardContent>

      <LinkFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
      />

      <LinkFormDialog
        open={!!editingLink}
        onOpenChange={(open) => !open && setEditingLink(null)}
        link={editingLink || undefined}
        categories={categories}
      />

      <DeleteConfirmDialog
        open={!!deletingLink}
        onOpenChange={(open) => !open && setDeletingLink(null)}
        onConfirm={() => deletingLink && handleDelete(deletingLink.id)}
        title={deletingLink?.title || ''}
        pageCount={deletePageCount}
      />
    </Card>
  )
}