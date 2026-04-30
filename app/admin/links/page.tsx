import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { LinksTable } from '@/components/admin/links-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2 } from 'lucide-react'

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

export default async function AdminLinks() {
  await checkAuth()

  const [links, categories] = await Promise.all([
    getLinks(),
    getCategories()
  ])

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-6 overflow-x-hidden animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Kelola Link
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Manajemen semua link di platform — tambah, edit, hapus, dan cari link
          </p>
        </div>

        {/* Links Management */}
        <Card className="shadow-soft-md border-slate-700/50 bg-slate-800/50 backdrop-blur animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Link2 className="h-5 w-5 text-emerald-400" />
              Semua Link
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <LinksTable links={links} categories={categories} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
