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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security & Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold">{stats.totalActions || 0}</div>
        <div className="text-sm text-slate-500">actions in last 7 days</div>
        
        {stats.actionsByType && stats.actionsByType.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium">Top Actions:</div>
            {stats.actionsByType.slice(0, 5).map(action => (
              <div key={action.action} className="flex justify-between text-sm">
                <span>{action.action}</span>
                <span className="font-mono">{action.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
