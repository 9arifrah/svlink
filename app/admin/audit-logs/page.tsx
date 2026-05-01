import { redirect } from 'next/navigation'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { AuditLogsTable } from '@/components/admin/audit-logs-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export default async function AuditLogsPage() {
  const session = await getVerifiedAdminSession()
  if (!session) {
    redirect('/login')
  }

  const { logs, total } = await db.getAuditLogs({ limit: 20, offset: 0 })

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-xs sm:text-sm text-slate-400">Track semua aktivitas admin di platform</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur shadow-soft-md">
          <CardHeader className="p-4 sm:p-6 border-b border-slate-700/50">
            <CardTitle className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              Activity Log
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-400">
              {total.toLocaleString()} total actions recorded
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
            <AuditLogsTable initialLogs={logs} total={total} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
