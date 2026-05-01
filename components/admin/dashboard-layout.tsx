'use client'

import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'
import { AdminMobileBottomNav } from './admin-mobile-bottom-nav'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ExternalLink, Menu } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminDashboardLayoutProps {
  children: React.ReactNode
  isAdmin?: boolean
}

const mobileNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Menu },
  { name: 'Link', href: '/admin/links', icon: ExternalLink },
  { name: 'Kategori', href: '/admin/categories', icon: ExternalLink },
  { name: 'User', href: '/admin/users', icon: ExternalLink },
  { name: 'Halaman Publik', href: '/admin/pages', icon: ExternalLink },
  { name: 'Stats', href: '/admin/stats', icon: ExternalLink },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: ExternalLink },
  { name: 'Settings', href: '/admin/settings', icon: ExternalLink },
]

export function DashboardLayout({ children, isAdmin }: AdminDashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      <AdminSidebar />

      <div className="flex-1 lg:pl-64">
        <AdminHeader onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        <main className="p-4 pt-4 pb-28 sm:p-6 sm:pt-6 sm:pb-24 lg:p-8 lg:pb-8 animate-fade-in">
          <BreadcrumbNav />
          {children}
        </main>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0 backdrop-blur-xl bg-slate-900/95 border-slate-700/50">
          <SheetHeader className="border-b border-slate-700/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
              <SheetTitle className="text-left">
                <div className="font-semibold text-white">Admin Panel</div>
                <div className="text-xs text-slate-400">Link Manager</div>
              </SheetTitle>
            </div>
          </SheetHeader>

          <nav className="flex flex-col space-y-1 p-4">
            {mobileNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10 border-l-4 border-emerald-500'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:shadow-lg'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10 border-l-4 border-emerald-500'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:shadow-lg'
                }`}
              >
                <ExternalLink className="h-5 w-5 shrink-0" />
                User Dashboard
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>

    {/* Mobile Bottom Navigation -- outside root div to avoid overflow-x-hidden clipping */}
    <AdminMobileBottomNav />
    </>
  )
}
