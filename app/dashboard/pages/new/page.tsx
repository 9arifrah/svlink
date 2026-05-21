import { DashboardLayout } from '@/components/user/dashboard-layout'
import { PageForm } from '@/components/user/page-form'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export default function NewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with back navigation */}
        <div>
          <Link
            href="/dashboard/pages"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Halaman Publik
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Buat Halaman Baru</h1>
              <p className="text-xs sm:text-sm text-slate-500">Isi informasi, pilih link, dan kustomisasi tampilan</p>
            </div>
          </div>
        </div>

        <PageForm mode="create" />
      </div>
    </DashboardLayout>
  )
}