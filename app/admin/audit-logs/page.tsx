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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-slate-500">Track semua aktivitas admin di platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              {total.toLocaleString()} total actions recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuditLogsTable initialLogs={logs} total={total} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
