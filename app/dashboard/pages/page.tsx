import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { PagesList } from '@/components/user/pages-list'
import { Plus } from 'lucide-react'

async function checkAuth() {
  const session = await getUserSession()

  if (!session) {
    redirect('/login')
  }

  return session.userId
}

async function getPages(userId: string) {
  try {
    return await db.getPublicPages(userId)
  } catch (error) {
    console.error('[v0] Error fetching public pages:', error)
    return []
  }
}

export default async function UserPages() {
  const userId = await checkAuth()
  const pages = await getPages(userId)

  const activePages = pages.filter((p: any) => p.is_active).length
  const totalClicks = pages.reduce((sum: number, p: any) => sum + (p.click_count || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Halaman Publik</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Kelola halaman publik Anda
              {pages.length > 0 && (
                <span className="ml-2 text-slate-400">
                  {pages.length} halaman · {activePages} aktif · {totalClicks} klik
                </span>
              )}
            </p>
          </div>
          <a
            href="/dashboard/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Buat Page
          </a>
        </div>

        <PagesList pages={pages} />
      </div>
    </DashboardLayout>
  )
}