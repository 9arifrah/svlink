import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { AutoRefreshStats } from '@/components/user/auto-refresh-stats'
import { QuickActions } from '@/components/user/quick-actions'
import { EmptyStateOnboarding } from '@/components/user/empty-state-onboarding'
import { RecentLinks } from '@/components/user/recent-links'
import { ClicksMiniChart } from '@/components/user/clicks-mini-chart'
import { TopLinks } from '@/components/user/top-links'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function getSampleClickData() {
  const days = 7
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      clicks: Math.floor(Math.random() * 41) + 10,
    })
  }
  return data
}

async function checkAuth() {
  const session = await getUserSession()

  if (!session) {
    redirect('/login')
  }

  return session.userId
}

async function getStats(userId: string) {
  try {
    return await db.getUserStats(userId)
  } catch (error) {
    console.error('[v0] Error fetching user stats:', error)
    return {
      totalLinks: 0,
      publicLinks: 0,
      totalClicks: 0,
      totalCategories: 0
    }
  }
}

async function getRecentLinks(userId: string) {
  try {
    const links = await db.getLinks(userId)
    return links.slice(0, 5).map((link: any) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      click_count: link.click_count ?? 0,
      is_public: link.is_public ?? false,
      created_at: link.created_at
    }))
  } catch (error) {
    console.error('[v0] Error fetching recent links:', error)
    return []
  }
}

async function getTopLinks(userId: string) {
  try {
    const links = await db.getLinks(userId)
    return [...links]
      .sort((a: any, b: any) => (b.click_count ?? 0) - (a.click_count ?? 0))
      .slice(0, 5)
      .map((link: any) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        click_count: link.click_count ?? 0,
      }))
  } catch (error) {
    console.error('[v0] Error fetching top links:', error)
    return []
  }
}

export default async function UserDashboard() {
  const userId = await checkAuth()
  const stats = await getStats(userId)
  const recentLinks = await getRecentLinks(userId)
  const topLinks = await getTopLinks(userId)

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Kelola semua link dan kategori Anda</p>
        </div>

        <EmptyStateOnboarding linkCount={stats.totalLinks} />

        <QuickActions />

        <RecentLinks links={recentLinks} />

        <Card>
          <CardHeader>
            <CardTitle>Statistik Link</CardTitle>
          </CardHeader>
          <CardContent>
            <AutoRefreshStats initialStats={stats} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ClicksMiniChart data={getSampleClickData()} />
          <TopLinks links={topLinks} />
        </div>
      </div>
    </DashboardLayout>
  )
}