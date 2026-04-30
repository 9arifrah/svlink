import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVerifiedAdminSession } from '@/lib/admin-auth'

export async function GET() {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pages = await db.getAllPublicPages()

    return NextResponse.json({ success: true, pages })
  } catch (error) {
    console.error('[v0] Error in admin pages GET:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID halaman harus diisi' },
        { status: 400 }
      )
    }

    const page = await db.getPublicPageById(id)
    if (!page) {
      return NextResponse.json(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.deletePublicPage(id, page.user_id)

    // Log audit action
    await db.logAuditAction({
      userId: session.userId,
      action: 'page.delete',
      entityType: 'page',
      entityId: id,
      details: { reason: 'Admin action' },
      ipAddress: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in admin pages DELETE:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID halaman harus diisi' },
        { status: 400 }
      )
    }

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active harus berupa boolean' },
        { status: 400 }
      )
    }

    const page = await db.getPublicPageById(id)
    if (!page) {
      return NextResponse.json(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.updatePublicPage(id, { is_active }, page.user_id)

    // Log audit action
    await db.logAuditAction({
      userId: session.userId,
      action: is_active ? 'page.activate' : 'page.suspend',
      entityType: 'page',
      entityId: id,
      details: { reason: 'Admin action', is_active },
      ipAddress: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in admin pages PATCH:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
