'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, MousePointerClick, Link2 } from 'lucide-react'

interface RecentLink {
  id: string
  title: string
  url: string
  click_count: number
  is_public: boolean
  created_at: string
}

interface RecentLinksProps {
  links: RecentLink[]
}

export function RecentLinks({ links }: RecentLinksProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Link Terbaru
        </CardTitle>
        <Link
          href="/dashboard/links"
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          Lihat Semua
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Belum ada link. Buat link pertama Anda!
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">
                    {link.title || 'Tanpa Judul'}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {link.url}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <MousePointerClick className="h-4 w-4" />
                    <span>{link.click_count}</span>
                  </div>
                  <Badge variant={link.is_public ? 'success' : 'warning'}>
                    {link.is_public ? 'Publik' : 'Private'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
