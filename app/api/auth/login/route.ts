import { NextRequest, NextResponse } from 'next/server'
import { setUserSession } from '@/lib/auth'
import { loginSchema, formatZodError } from '@/lib/validation'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per minute per IP
    const rateLimitResponse = await rateLimitMiddleware(request, undefined, 5, 60000)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { email, password, rememberMe = false } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Validate input
    try {
      loginSchema.parse({ email, password })
    } catch (error) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if user is suspended or locked
    if (user.is_suspended) {
      return NextResponse.json(
        { error: 'Akun ini telah dinonaktifkan. Hubungi admin.' },
        { status: 403 }
      )
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const result = await db.trackFailedLogin(user.id)
      return NextResponse.json(
        { error: `Akun terkunci sementara. ${result.failedCount}/5 percobaan gagal.` },
        { status: 429 }
      )
    }

    // Verify password hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      const result = await db.trackFailedLogin(user.id)
      if (result.locked) {
        return NextResponse.json(
          { error: 'Akun terkunci selama 15 menit karena terlalu banyak percobaan gagal.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: `Email atau password salah. ${result.failedCount}/5 percobaan.` },
        { status: 401 }
      )
    }

    // Reset failed login on successful login
    await db.resetFailedLogin(user.id)

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        custom_slug: user.custom_slug
      }
    })

    // Set JWT session cookie
    // Remember me: 30 days vs regular: 7 days
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
    await setUserSession(user.id, maxAge)

    return response
  } catch (error) {
    console.error('[v0] Error in user login API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
