// app/api/admin/audit-logs/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7')

  try {
    const stats = await db.getAuditStats(Math.min(days, 30)) // max 30 days
    return NextResponse.json(stats)
  } catch (error) {
    console.error('[v0] Error fetching audit stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit stats' },
      { status: 500 }
    )
  }
}
