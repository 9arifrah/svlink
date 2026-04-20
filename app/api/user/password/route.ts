import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan baru wajib diisi' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      )
    }

    // Get user to verify current password
    const user = await db.getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Password lama salah' },
        { status: 400 }
      )
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(newPassword, 10)
    await db.updateUser(session.userId, { password_hash: newHash })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error changing password:', error)
    return NextResponse.json(
      { error: 'Gagal mengubah password' },
      { status: 500 }
    )
  }
}
