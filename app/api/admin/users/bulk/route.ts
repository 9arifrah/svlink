import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVerifiedAdminSession } from '@/lib/admin-auth'

const validActions = ['suspend', 'unsuspend', 'activate', 'delete'] as const

export async function POST(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { user_ids, action } = await request.json()

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { error: 'user_ids harus berupa array tidak kosong' },
        { status: 400 }
      )
    }

    if (!action || !validActions.includes(action as any)) {
      return NextResponse.json(
        { error: `action harus salah satu dari: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    const { success, errors } = await db.bulkUserAction(user_ids, action as any)

    return NextResponse.json({ success, errors })
  } catch (error) {
    console.error('[v0] Error in bulk users POST by admin:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
