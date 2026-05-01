'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export function AuditStatsWidget() {
  const [stats, setStats] = useState<{
    totalActions: number
    actionsByType: Array<{ action: string; count: number }>
  } | null>(null)

  useEffect(() => {
    fetch('/api/admin/audit-logs/stats?days=7')
      .then(res => res.json())
      .then(data => {
        // Handle API error responses
        if (data.error) {
          console.error('Audit stats error:', data.error)
          setStats(null)
        } else {
          setStats({
            totalActions: data.totalActions || 0,
            actionsByType: Array.isArray(data.actionsByType) ? data.actionsByType : []
          })
        }
      })
      .catch(console.error)
  }, [])

  if (!stats) return null

  return (
    <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur shadow-soft-md">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          Security & Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
        <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalActions || 0}</div>
        <div className="text-xs sm:text-sm text-slate-400">actions in last 7 days</div>
        
        {stats.actionsByType && stats.actionsByType.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-300">Top Actions:</div>
            {stats.actionsByType.slice(0, 5).map(action => (
              <div key={action.action} className="flex justify-between text-xs sm:text-sm text-slate-300">
                <span className="truncate">{action.action}</span>
                <span className="font-mono ml-2">{action.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
