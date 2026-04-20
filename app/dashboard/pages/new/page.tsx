import { DashboardLayout } from '@/components/user/dashboard-layout'
import { PageForm } from '@/components/user/page-form'

export default function NewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-slate-900">Buat Halaman Baru</h1>
          <p className="text-slate-600">Buat halaman publik baru</p>
        </div>

        <PageForm mode="create" />
      </div>
    </DashboardLayout>
  )
}
