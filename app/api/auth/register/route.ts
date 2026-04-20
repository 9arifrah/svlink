import { NextRequest, NextResponse } from 'next/server'
import { setUserSession } from '@/lib/auth'
import { registerSchema, formatZodError } from '@/lib/validation'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 attempts per hour per IP
    const rateLimitResponse = await rateLimitMiddleware(request, undefined, 10, 3600000)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { email, password, displayName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Validate input with Zod
    try {
      registerSchema.parse({
        email,
        password,
        displayName: displayName || email.split('@')[0]
      })
    } catch (error) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.getUserByEmail(email)

    if (existingUser) {
      // Don't reveal email existence for security
      // Add artificial delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
      return NextResponse.json(
        { error: 'Jika email terdaftar, silakan cek inbox Anda' },
        { status: 200 }
      )
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate UUID for user
    const userId = crypto.randomUUID()

    // Create new user
    const newUser = await db.createUser({
      id: userId,
      email,
      password_hash: passwordHash,
      display_name: displayName || email.split('@')[0],
      custom_slug: null
    })

    if (!newUser) {
      return NextResponse.json(
        { error: 'Gagal membuat user baru' },
        { status: 500 }
      )
    }

    // Create default settings for user
    await db.createUserSettings({
      id: crypto.randomUUID(),
      user_id: userId
    })

    // Create response with JWT session
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name
      }
    })

    // Set JWT session cookie (7 days)
    await setUserSession(userId, 60 * 60 * 24 * 7)

    return response
  } catch (error) {
    console.error('[v0] Error in register API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
