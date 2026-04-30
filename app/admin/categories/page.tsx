import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminCategoriesClient } from '@/components/admin/admin-categories-client'

async function checkAuth() {
  const session = await getVerifiedAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session.userId
}

async function getCategories() {
  try {
    const categories = await db.adminGetAllCategories()
    return categories
  } catch (error) {
    console.error('[v0] Error fetching categories:', error)
    return []
  }
}

export default async function AdminCategories() {
  await checkAuth()
  const categories = await getCategories()

  return <AdminCategoriesClient initialCategories={categories} />
}
