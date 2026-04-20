import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { PagesList } from '@/components/user/pages-list'

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-900">Halaman Publik</h1>
            <p className="text-slate-600">Kelola halaman publik Anda</p>
          </div>
          <a
            href="/dashboard/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Page
          </a>
        </div>

        <PagesList pages={pages} />
      </div>
    </DashboardLayout>
  )
}
