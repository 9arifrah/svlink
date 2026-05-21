'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { PageForm } from '@/components/user/page-form'
import { ArrowLeft, Pencil, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PageData {
  slug: string
  title: string
  description: string
  logo_url: string
  theme_color: string
  layout_style: string
  show_categories: boolean
  is_active: boolean
  selectedLinks: any[]
}

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pageId, setPageId] = useState<string>('')

  useEffect(() => {
    params.then(p => setPageId(p.id))
  }, [params])

  useEffect(() => {
    if (!pageId) return

    async function fetchData() {
      try {
        const res = await fetch(`/api/pages/${pageId}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Halaman tidak ditemukan')
          } else if (res.status === 403) {
            setError('Anda tidak memiliki akses ke halaman ini')
          } else {
            setError('Gagal memuat halaman')
          }
          return
        }
        const data = await res.json()
        setPageData({
          slug: data.page.slug,
          title: data.page.title,
          description: data.page.description || '',
          logo_url: data.page.logo_url || '',
          theme_color: data.page.theme_color,
          layout_style: data.page.layout_style,
          show_categories: !!data.page.show_categories,
          is_active: !!data.page.is_active,
          selectedLinks: data.links || []
        })
      } catch (err) {
        console.error('[v0] Error fetching page:', err)
        setError('Terjadi kesalahan saat memuat halaman')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pageId])

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Link
            href="/dashboard/pages"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Halaman Publik
          </Link>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Gagal Memuat</h2>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard/pages')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Kembali ke Halaman Publik
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Loading state with skeleton
  if (loading || !pageData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
              <div>
                <div className="h-5 w-48 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
          {/* Tab skeleton */}
          <div className="border-b border-slate-200">
            <div className="flex gap-4">
              <div className="h-9 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
              <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
              <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          {/* Form skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-24 w-full bg-slate-100 rounded-lg animate-pulse" />
            </div>
          </div>
          {/* Buttons skeleton */}
          <div className="flex gap-3 pt-4 border-t">
            <div className="h-10 w-20 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

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
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm"
              style={{ backgroundColor: pageData.theme_color + '15' }}
            >
              <Pencil
                className="w-5 h-5"
                style={{ color: pageData.theme_color }}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                Edit: {pageData.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Perbarui informasi dan tampilan halaman Anda
              </p>
            </div>
          </div>
        </div>

        <PageForm mode="edit" pageId={pageId} initialData={pageData} />
      </div>
    </DashboardLayout>
  )
}