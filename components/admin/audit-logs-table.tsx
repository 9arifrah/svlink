'use client'

import { useState, useEffect } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

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
  const pageSize = 20

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                Belum ada audit logs
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                    locale: id,
                  })}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{log.user_display_name || log.user_email}</div>
                    <div className="text-xs text-slate-500">{log.user_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getActionColor(log.action)}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                      {log.entity_type}
                    </span>
                    {log.entity_id && (
                      <span className="ml-2 text-slate-500">{log.entity_id.slice(0, 8)}...</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.ip_address || '-'}
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs">
                  {log.details ? JSON.parse(log.details).reason || '-' : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Total: {total} logs
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page + 1}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={logs.length < pageSize}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
