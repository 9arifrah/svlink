// app/api/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || undefined
  const entityType = searchParams.get('entityType') || undefined
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const result = await db.getAuditLogs({
      userId,
      entityType,
      limit: Math.min(limit, 100), // max 100
      offset
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
