'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Link2, FileText, FolderTree, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Link', href: '/dashboard/links', icon: Link2 },
  { name: 'Pages', href: '/dashboard/pages', icon: FileText },
  { name: 'Kategori', href: '/dashboard/categories', icon: FolderTree },
  { name: 'Setting', href: '/dashboard/settings', icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200/80 lg:hidden safe-area-pb" aria-label="Navigasi mobile">
      <div className="flex items-center justify-around h-14 sm:h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 sm:px-3 rounded-lg transition-colors min-w-0",
                isActive ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <span className="text-[9px] sm:text-[10px] font-medium leading-tight truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}