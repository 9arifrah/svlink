import { NextResponse } from 'next/server'
import { getUserSession, clearUserSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE() {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user (cascade will handle related data)
    await db.deleteUser(session.userId)

    // Clear session
    await clearUserSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting account:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus akun' },
      { status: 500 }
    )
  }
}
