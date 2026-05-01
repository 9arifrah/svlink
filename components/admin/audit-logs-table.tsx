'use client'

import { useState, useEffect } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Search } from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  user_email: string
  user_display_name: string
  action: string
  entity_type: string
  entity_id: string | null
  details: string | null
  ip_address: string | null
  created_at: string
}

interface AuditLogsTableProps {
  initialLogs: AuditLog[]
  total: number
}

export function AuditLogsTable({ initialLogs, total }: AuditLogsTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 20

  const filteredLogs = searchQuery
    ? logs.filter(log =>
        (log.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user_display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs

  useEffect(() => {
    fetchLogs(page)
  }, [page])

  const fetchLogs = async (pageNum: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (pageNum * pageSize).toString(),
      })
      const res = await fetch(`/api/admin/audit-logs?${params}`)
      const data = await res.json()
      setLogs(data.logs)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return 'destructive'
    if (action.includes('suspend')) return 'warning'
    if (action.includes('create')) return 'success'
    return 'secondary'
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Cari audit log..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
          className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-800/80">
              <TableHead className="whitespace-nowrap text-xs sm:text-sm">Waktu</TableHead>
              <TableHead className="whitespace-nowrap text-xs sm:text-sm">Admin</TableHead>
              <TableHead className="whitespace-nowrap text-xs sm:text-sm">Aksi</TableHead>
              <TableHead className="hidden sm:table-cell whitespace-nowrap text-xs sm:text-sm">Entity</TableHead>
              <TableHead className="hidden lg:table-cell whitespace-nowrap text-xs sm:text-sm">IP</TableHead>
              <TableHead className="hidden md:table-cell whitespace-nowrap text-xs sm:text-sm">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  {searchQuery ? 'Tidak ada hasil yang ditemukan' : 'Belum ada audit logs'}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-700/30">
                  <TableCell className="whitespace-nowrap text-[10px] sm:text-xs">
                    {format(new Date(log.created_at.replace(' ', 'T')), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-xs sm:text-sm text-white">{log.user_display_name || log.user_email}</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[140px]">{log.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionColor(log.action)} className="text-[10px] sm:text-xs">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="text-xs sm:text-sm">
                      <span className="font-mono text-[10px] sm:text-xs bg-slate-700 px-2 py-1 rounded text-emerald-400">
                        {log.entity_type}
                      </span>
                      {log.entity_id && (
                        <span className="ml-2 text-slate-400 text-[10px] sm:text-xs">{log.entity_id.slice(0, 8)}...</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs">
                    {log.ip_address || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate text-xs text-slate-400">
                    {log.details ? (() => { try { return JSON.parse(log.details).reason || '-'; } catch { return '-'; } })() : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-slate-400">
          Total: {total} logs
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-xs sm:text-sm border border-slate-600 rounded disabled:opacity-50 text-slate-300 hover:bg-slate-700/50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-xs sm:text-sm text-slate-300">
            Page {page + 1}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={logs.length < pageSize}
            className="px-3 py-1 text-xs sm:text-sm border border-slate-600 rounded disabled:opacity-50 text-slate-300 hover:bg-slate-700/50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
