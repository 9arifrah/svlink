import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production-minimum-32-chars')
const SESSION_COOKIE = 'svlink_session'

export interface SessionPayload {
  userId: string
  isAdmin: boolean
  iat: number
  exp: number
}

/**
 * Create a signed JWT session token
 */
export async function createSessionToken(userId: string, isAdmin: boolean = false): Promise<string> {
  const token = await new SignJWT({ userId, isAdmin })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode a session token
 * Returns null if token is invalid/expired
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Validate payload has required fields
    if (!payload.userId || typeof payload.isAdmin !== 'boolean') {
      return null
    }

    return {
      userId: String(payload.userId),
      isAdmin: Boolean(payload.isAdmin),
      iat: payload.iat ?? Date.now() / 1000,
      exp: payload.exp ?? Date.now() / 1000 + 604800 // 7 days default
    }
  } catch (error) {
    console.error('[v0] Session verification failed')
    return null
  }
}

/**
 * Get current user session from request
 */
export async function getUserSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)

  if (!session) {
    return null
  }

  return await verifySessionToken(session.value)
}

/**
 * Get current admin session from request
 * Verifies both token validity AND admin status
 */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)

  if (!session) {
    return null
  }

  const payload = await verifySessionToken(session.value)

  // Double-check admin status in JWT payload
  if (!payload || !payload.isAdmin) {
    return null
  }

  return payload
}

/**
 * Get unified session from request (reads from svlink_session cookie)
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session) return null
  return await verifySessionToken(session.value)
}

/**
 * Set user session cookie (delegates to unified session)
 */
export async function setUserSession(userId: string, maxAge: number = 60 * 60 * 24 * 7) {
  return setUnifiedSession(userId, maxAge)
}

/**
 * Set admin session cookie
 */
export async function setAdminSession(userId: string, maxAge: number = 60 * 60 * 24 * 7) {
  return setUnifiedSession(userId, maxAge)
}

/**
 * Set unified session cookie (checks DB for admin status)
 */
export async function setUnifiedSession(userId: string, maxAge: number = 60 * 60 * 24 * 7) {
  const { db } = await import('./db')
  const isAdmin = await db.isAdminUser(userId)
  const token = await createSessionToken(userId, isAdmin)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false, // Disabled: no SSL configured. Set to true when HTTPS is enabled.
    sameSite: 'lax',
    maxAge,
    path: '/'
  })
}

/**
 * Clear user session
 */
export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete('user_session')
  cookieStore.delete('admin_session')
}

/**
 * Clear admin session
 */
export async function clearAdminSession() {
  return clearUserSession()
}
