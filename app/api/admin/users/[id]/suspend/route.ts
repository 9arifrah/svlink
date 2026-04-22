import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVerifiedAdminSession } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const user = await db.getUserById(id)
    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    const currentlySuspended = (user as any).is_suspended || false

    if (currentlySuspended) {
      // Unsuspend
      await db.unsuspendUser(id)
      // Reset failed login attempts on unsuspend
      await db.resetFailedLogin(id)
      return NextResponse.json({ suspended: false })
    } else {
      // Suspend
      await db.suspendUser(id)
      return NextResponse.json({ suspended: true })
    }
  } catch (error) {
    console.error('[v0] Error in user suspend PATCH by admin:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
