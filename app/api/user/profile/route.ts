import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(request: Request) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { displayName } = await request.json()

    if (!displayName || displayName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama minimal 2 karakter' },
        { status: 400 }
      )
    }

    await db.updateUser(session.userId, { display_name: displayName.trim() })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error updating profile:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui profil' },
      { status: 500 }
    )
  }
}
