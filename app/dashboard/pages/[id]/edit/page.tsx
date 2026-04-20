'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { PageForm } from '@/components/user/page-form'

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
  const [pageId, setPageId] = useState<string>('')

  useEffect(() => {
    params.then(p => setPageId(p.id))
  }, [params])

  useEffect(() => {
    if (!pageId) return

    async function fetchData() {
      try {
        const res = await fetch(`/api/pages/${pageId}`)
        if (!res.ok) throw new Error('Failed to fetch')
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
      } catch (error) {
        console.error('[v0] Error fetching page:', error)
        router.push('/dashboard/pages')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pageId, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!pageData) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-slate-900">Edit: {pageData.title}</h1>
          <p className="text-slate-600">Edit halaman publik</p>
        </div>

        <PageForm mode="edit" pageId={pageId} initialData={pageData} />
      </div>
    </DashboardLayout>
  )
}
