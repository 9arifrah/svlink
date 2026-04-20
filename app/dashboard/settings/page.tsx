import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { ProfileForm, PasswordForm, DeleteAccountForm } from '@/components/user/profile-forms'

async function checkAuth() {
  const session = await getUserSession()

  if (!session) {
    redirect('/login')
  }

  return session.userId
}

async function getUser(userId: string) {
  try {
    const user = await db.getUserById(userId)
    return user
  } catch (error) {
    console.error('[v0] Error fetching user:', error)
    return null
  }
}

export default async function UserSettings() {
  const userId = await checkAuth()
  const user = await getUser(userId)

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-bold text-slate-900">Pengaturan</h1>
          <p className="text-slate-600">Kelola profil akun Anda</p>
        </div>

        {/* Profil Saya */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Profil Saya</h2>
          <ProfileForm user={user} />
        </div>

        {/* Ubah Password */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Ubah Password</h2>
          <PasswordForm />
        </div>

        {/* Hapus Akun */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-red-600 border-b border-red-200 pb-2">Zona Berbahaya</h2>
          <DeleteAccountForm />
        </div>
      </div>
    </DashboardLayout>
  )
}
