'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, FolderTree, Globe, ArrowRight } from 'lucide-react'

type EmptyStateOnboardingProps = {
  linkCount: number
}

export function EmptyStateOnboarding({ linkCount }: EmptyStateOnboardingProps) {
  if (linkCount > 0) return null

  const steps = [
    { icon: Plus, title: 'Buat link pertama Anda', desc: 'Tambahkan URL penting Anda', color: 'text-brand-600' },
    { icon: FolderTree, title: 'Atur dalam kategori', desc: 'Kelompokkan link berdasarkan topik', color: 'text-purple-600' },
    { icon: Globe, title: 'Bagikan halaman publik', desc: 'Dapatkan URL kustom untuk dibagikan', color: 'text-green-600' },
  ]

  return (
    <Card className="border-brand-200 bg-brand-50/50">
      <CardContent className="pt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Selamat Datang di svlink! 👋</h3>
        <p className="text-slate-600 mb-6">Mulai dalam 3 langkah mudah:</p>
        <div className="space-y-4 mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ${step.color}`}>
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{step.title}</p>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Button asChild>
          <Link href="/dashboard/links">
            Buat Link Pertama <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
