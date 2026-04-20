'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Link2, Plus, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Link', href: '/dashboard/links', icon: Link2 },
  { name: 'Tambah', href: '/dashboard/links?action=create', icon: Plus, isCenter: true },
  { name: 'Pages', href: '/dashboard/pages', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden" aria-label="Navigasi mobile">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 shadow-lg shadow-brand-600/30 text-white">
                  <Icon className="h-6 w-6" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors",
                isActive ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
