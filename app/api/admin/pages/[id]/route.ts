import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVerifiedAdminSession } from '@/lib/admin-auth'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { is_active } = body

    const { id } = await context.params

    const page = await db.getPublicPageById(id)
    if (!page) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 })
    }

    await db.updatePublicPage(id, { is_active: typeof is_active === 'boolean' ? is_active : !page.is_active }, page.user_id)

    // Log audit action
    const newStatus = typeof is_active === 'boolean' ? is_active : !page.is_active
    await db.logAuditAction({
      userId: session.userId,
      action: newStatus ? 'page.activate' : 'page.suspend',
      entityType: 'page',
      entityId: id,
      details: { reason: 'Admin action', is_active: newStatus },
      ipAddress: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
    })

    return NextResponse.json({ success: true, is_active: newStatus })
  } catch (error) {
    console.error('[v0] Error in admin pages PUT:', session.userId, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
