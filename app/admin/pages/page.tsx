import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { AdminPagesTable } from '@/components/admin/admin-pages-table'

async function checkAuth() {
  const session = await getVerifiedAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session.userId
}

export default async function AdminPages() {
  await checkAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Halaman Publik
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Kelola semua halaman publik di platform
          </p>
        </div>

        {/* Pages Table */}
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <AdminPagesTable />
        </div>
      </div>
    </DashboardLayout>
  )
}
