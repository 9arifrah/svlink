import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVerifiedAdminSession } from '@/lib/admin-auth'

export async function GET() {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const announcements = await db.getAnnouncements()

    return NextResponse.json({ success: true, announcements })
  } catch (error) {
    console.error('[v0] Error in admin announcements GET:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, type, is_active } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title dan content harus diisi' },
        { status: 400 }
      )
    }

    const announcement = await db.createAnnouncement({
      id: crypto.randomUUID(),
      title,
      content,
      type: type || 'info',
      is_active: is_active !== undefined ? is_active : true,
    })

    return NextResponse.json({ success: true, announcement }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in admin announcements POST:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, title, content, type, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID announcement harus diisi' },
        { status: 400 }
      )
    }

    const announcement = await db.updateAnnouncement(id, {
      title,
      content,
      type,
      is_active,
    })

    return NextResponse.json({ success: true, announcement })
  } catch (error) {
    console.error('[v0] Error in admin announcements PUT:', session.userId)
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
        { error: 'ID announcement harus diisi' },
        { status: 400 }
      )
    }

    await db.deleteAnnouncement(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in admin announcements DELETE:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
