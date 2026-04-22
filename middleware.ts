import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import fs from 'fs'
import path from 'path'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-production')

async function isAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files, API routes for assets, and maintenance page itself
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/admin') ||
    pathname === '/maintenance' ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next()
  }

  // Check maintenance mode flag file (for SQLite/local dev)
  const flagPath = path.join(process.cwd(), 'data', '.maintenance')
  const isMaintenance = fs.existsSync(flagPath)

  if (isMaintenance) {
    const admin = await isAdminSession(request)
    if (!admin) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
