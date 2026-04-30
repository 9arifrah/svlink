import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { Users, Link as LinkIcon, FolderOpen, MousePointer2, TrendingUp } from 'lucide-react'

async function checkAuth() {
  const session = await getVerifiedAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session.userId
}

async function getStats() {
  try {
    // Get total users
    const allUsers = await db.getAllUsers()
    const totalUsers = allUsers.length

    // Get total links
    const allLinks = await db.adminGetAllLinks()
    const totalLinks = allLinks.length
    const activeLinks = allLinks.filter((l: any) => l.is_active).length
    const inactiveLinks = allLinks.filter((l: any) => !l.is_active).length

    // Get total categories
    const allCategories = await db.adminGetAllCategories()
    const totalCategories = allCategories.length

    // Get total clicks
    const totalClicks = allLinks.reduce((sum: number, link: any) => sum + (link.click_count || 0), 0)

    // Get admin count
    let adminCount = 0
    for (const user of allUsers) {
      const isAdmin = await db.isAdminUser(user.id)
      if (isAdmin) adminCount++
    }

    return {
      totalUsers,
      totalLinks,
      activeLinks,
      inactiveLinks,
      totalCategories,
      totalClicks,
      adminCount,
    }
  } catch (error) {
    console.error('[Admin Stats] Error fetching stats:', error)
    return {
      totalUsers: 0,
      totalLinks: 0,
      activeLinks: 0,
      inactiveLinks: 0,
      totalCategories: 0,
      totalClicks: 0,
      adminCount: 0,
    }
  }
}

export default async function AdminStats() {
  await checkAuth()
  const stats = await getStats()

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: Users,
      color: '#3b82f6',
      gradient: 'from-blue-500 to-blue-600',
      description: `${stats.adminCount} admin, ${stats.totalUsers - stats.adminCount} user biasa`
    },
    {
      title: 'Total Link',
      value: stats.totalLinks,
      icon: LinkIcon,
      color: '#10b981',
      gradient: 'from-green-500 to-green-600',
      description: `${stats.activeLinks} aktif, ${stats.inactiveLinks} non-aktif`
    },
    {
      title: 'Total Kategori',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: '#8b5cf6',
      gradient: 'from-purple-500 to-purple-600',
      description: 'Kategori di seluruh platform'
    },
    {
      title: 'Total Klik',
      value: stats.totalClicks,
      icon: MousePointer2,
      color: '#f59e0b',
      gradient: 'from-orange-500 to-orange-600',
      description: 'Total klik pada semua link'
    },
  ]

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Statistik Platform
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Ringkasan data seluruh platform svlink
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          {statCards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur p-6 shadow-soft-md transition-all duration-300 hover:shadow-soft-xl hover:-translate-y-1"
            >
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 pointer-events-none"
                style={{ backgroundColor: card.color }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-300">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{card.description}</p>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br"
                  style={{ backgroundImage: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)` }}
                >
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Bottom accent bar */}
              <div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent"
                style={{
                  color: card.color,
                  width: '100%',
                  opacity: '0.2',
                }}
              />
            </div>
          ))}
        </div>

        {/* Progress Stats */}
        <div className="grid gap-6 md:grid-cols-2 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur p-6 shadow-soft-md">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Link Aktif vs Non-Aktif
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Link Aktif</span>
                  <span className="font-semibold text-white">{stats.activeLinks}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000"
                    style={{
                      width: `${stats.totalLinks > 0 ? (stats.activeLinks / stats.totalLinks) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Link Non-Aktif</span>
                  <span className="font-semibold text-white">{stats.inactiveLinks}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-400 to-slate-500 transition-all duration-1000"
                    style={{
                      width: `${stats.totalLinks > 0 ? (stats.inactiveLinks / stats.totalLinks) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur p-6 shadow-soft-md">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Distribusi User
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Admin</span>
                  <span className="font-semibold text-white">{stats.adminCount}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                    style={{
                      width: `${stats.totalUsers > 0 ? (stats.adminCount / stats.totalUsers) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">User Biasa</span>
                  <span className="font-semibold text-white">{stats.totalUsers - stats.adminCount}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-600 transition-all duration-1000"
                    style={{
                      width: `${stats.totalUsers > 0 ? ((stats.totalUsers - stats.adminCount) / stats.totalUsers) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
