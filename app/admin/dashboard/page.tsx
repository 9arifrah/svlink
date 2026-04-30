import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { LinksTable } from '@/components/admin/links-table'
import { StatsCards } from '@/components/admin/stats-cards'
import { GrowthChart } from '@/components/admin/growth-chart'
import { AuditStatsWidget } from '@/components/admin/audit-stats-widget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Trophy, Activity } from 'lucide-react'

async function checkAuth() {
  const session = await getVerifiedAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session.userId
}

async function getLinks() {
  try {
    const links = await db.getLinks()
    return links
  } catch (error) {
    console.error('[v0] Error fetching links:', error)
    return []
  }
}

async function getCategories() {
  try {
    const categories = await db.getCategories()
    return categories
  } catch (error) {
    console.error('[v0] Error fetching categories:', error)
    return []
  }
}

async function getUsers() {
  try {
    const users = await db.getAllUsers()
    return users.map(user => ({ created_at: user.created_at }))
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return []
  }
}

async function getStats() {
  try {
    const links = await db.getLinks()
    const totalLinks = links.length
    const activeLinks = links.filter(link => link.is_active).length
    const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0)
    const categories = await db.getCategories()
    const totalCategories = categories.length
    const users = await db.getAllUsers()
    const totalUsers = users.length

    return {
      totalLinks,
      activeLinks,
      totalClicks,
      totalCategories,
      totalUsers
    }
  } catch (error) {
    console.error('[v0] Error fetching stats:', error)
    return {
      totalLinks: 0,
      activeLinks: 0,
      totalClicks: 0,
      totalCategories: 0,
      totalUsers: 0
    }
  }
}

async function getTopLinks() {
  try {
    const links = await db.getLinks()
    // Sort by click_count descending
    const sortedLinks = links.sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
    // Take top 10
    return sortedLinks.slice(0, 10)
  } catch (error) {
    console.error('[v0] Error fetching top links:', error)
    return []
  }
}

export default async function AdminDashboard() {
  await checkAuth()

  const [links, categories, stats, users, topLinks] = await Promise.all([
    getLinks(),
    getCategories(),
    getStats(),
    getUsers(),
    getTopLinks()
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Dashboard Admin
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Kelola semua link, kategori, dan user di platform
          </p>
        </div>

        {/* Stats Cards */}
        <Card className="shadow-soft-md border-slate-700/50 bg-slate-800/50 backdrop-blur animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-lg font-semibold text-white">Statistik Platform</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <StatsCards stats={stats} />
          </CardContent>
        </Card>

        {/* Growth Chart */}
        <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <GrowthChart links={links} users={users} />
        </div>

        {/* Audit Stats Widget */}
        <div className="animate-scale-in" style={{ animationDelay: '0.22s' }}>
          <AuditStatsWidget />
        </div>

        {/* Top 10 Links by Clicks */}
        <Card className="shadow-soft-md border-slate-700/50 bg-slate-800/50 backdrop-blur animate-scale-in" style={{ animationDelay: '0.25s' }}>
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              Top 10 Links by Clicks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left p-3 font-medium text-slate-300 w-12">#</th>
                    <th className="text-left p-3 font-medium text-slate-300">Title</th>
                    <th className="text-left p-3 font-medium text-slate-300">User</th>
                    <th className="text-center p-3 font-medium text-slate-300">Clicks</th>
                    <th className="text-left p-3 font-medium text-slate-300">Short Code</th>
                    <th className="text-left p-3 font-medium text-slate-300">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        Tidak ada data link
                      </td>
                    </tr>
                  ) : (
                    topLinks.map((link: any, index: number) => (
                      <tr
                        key={link.id}
                        className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="p-3">
                          {index < 3 ? (
                            <Badge className={
                              index === 0 ? 'bg-amber-900/30 text-amber-400 border-amber-700/50' :
                              index === 1 ? 'bg-slate-600/30 text-slate-300 border-slate-500/50' :
                              'bg-orange-900/30 text-orange-400 border-orange-700/50'
                            }>
                              {index + 1}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 font-medium">{index + 1}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-white font-medium truncate max-w-[180px] inline-block">
                            {link.title || '—'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-slate-300 text-xs">{link.users?.display_name || link.users?.email || '—'}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-white font-bold">{link.click_count || 0}</span>
                        </td>
                        <td className="p-3">
                          <code className="text-xs bg-slate-700 px-2 py-1 rounded text-emerald-400">
                            {link.short_code || '—'}
                          </code>
                        </td>
                        <td className="p-3">
                          {link.url ? (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate max-w-[200px]"
                            >
                              <span className="truncate">{link.url}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Links */}
        <Card className="shadow-soft-md border-slate-700/50 bg-slate-800/50 backdrop-blur animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-lg font-semibold text-white">Link Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <LinksTable links={links} categories={categories} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}