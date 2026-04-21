'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

type TopLinksProps = {
  links: { id: string; title: string; url: string; click_count: number }[]
}

export function TopLinks({ links }: TopLinksProps) {
  const top5 = [...links].sort((a, b) => b.click_count - a.click_count).slice(0, 5)
  const maxClicks = top5[0]?.click_count || 1

  const rankColors = [
    'bg-yellow-100 text-yellow-700',
    'bg-slate-100 text-slate-700',
    'bg-orange-100 text-orange-700',
    'bg-blue-100 text-blue-700',
    'bg-blue-100 text-blue-700',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Link Terpopuler
        </CardTitle>
      </CardHeader>
      <CardContent>
        {top5.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada link</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {top5.map((link, i) => (
              <div key={link.id} className="flex items-center gap-2 sm:gap-3">
                <span className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold ${rankColors[i]}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{link.title || 'Tanpa Judul'}</p>
                  <div className="mt-0.5 sm:mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${(link.click_count / maxClicks) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] sm:text-sm text-slate-500 tabular-nums whitespace-nowrap">
                  {link.click_count} klik
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
