import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { LinkCard } from '@/components/link-card'
import { SearchBar } from '@/components/search-bar'
import { ExternalLink } from 'lucide-react'
import { PublicPageHeader } from '@/components/user/public-page-header'
import { generatePublicProfileMetadata, generatePublicProfileStructuredData } from '@/lib/seo'
import { siteConfig } from '@/lib/seo'
import { StructuredDataScript } from '@/components/structured-data-script'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  // Try short code first
  const link = await getLinkByShortCode(slug)
  if (link) {
    return {
      title: 'Redirecting...',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  // Then try public page
  const page = await getPublicPageBySlug(slug)
  if (!page) {
    return {
      title: 'Not Found',
    }
  }

  return generatePublicProfileMetadata({
    title: page.title,
    description: page.description || '',
    logo: page.logo_url,
    slug: page.slug,
    linkCount: 0,
  })
}

async function getLinkByShortCode(code: string) {
  try {
    if (!/^[a-zA-Z0-9-]+$/.test(code)) {
      return null
    }
    const link = await db.getLinkByShortCode(code)
    return link
  } catch (error) {
    console.error('[v0] Error fetching link by short code:', error)
    return null
  }
}

async function getPublicPageBySlug(slug: string) {
  try {
    return await db.getPublicPageBySlug(slug)
  } catch (error) {
    console.error('[v0] Error fetching public page by slug:', error)
    return null
  }
}

async function getPublicPageLinks(pageId: string) {
  try {
    return await db.getPublicPageLinks(pageId)
  } catch (error) {
    console.error('[v0] Error fetching public page links:', error)
    return []
  }
}

export default async function PublicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Priority 1: Check if it's a short code (redirect)
  const link = await getLinkByShortCode(slug)
  if (link) {
    if (!link.is_active) {
      notFound()
    }

    try {
      await db.incrementClickCount(link.id)
    } catch (error) {
      console.error('[v0] Error incrementing click count:', error)
    }

    redirect(link.url)
  }

  // Priority 2: Check if it's a public page
  const page = await getPublicPageBySlug(slug)
  if (!page) {
    notFound()
  }

  // Increment page click count
  try {
    await db.incrementPageClickCount(page.id)
  } catch (error) {
    console.error('[v0] Error incrementing page click count:', error)
  }

  // Get links for this page
  const links = await getPublicPageLinks(page.id)

  const themeColor = page.theme_color || '#3b82f6'
  const layoutStyle = page.layout_style || 'list'

  // Group links by category
  const groupedLinks = links.reduce((groups: any[], link: any) => {
    const categoryName = link.category?.name || 'Lainnya'
    const categoryIcon = link.category?.icon || '📌'
    const categoryId = link.category?.id || 'uncategorized'
    
    let group = groups.find(g => g.id === categoryId)
    if (!group) {
      group = {
        id: categoryId,
        name: categoryName,
        icon: categoryIcon,
        sort_order: 999,
        links: []
      }
      groups.push(group)
    }
    group.links.push(link)
    return groups
  }, [])

  // Generate structured data
  const structuredData = generatePublicProfileStructuredData({
    name: page.title,
    description: page.description || '',
    logo: page.logo_url,
    slug: page.slug,
    links: links.map((link: any) => ({
      title: link.title,
      url: link.url,
    })),
    themeColor,
  })

  return (
    <>
      <StructuredDataScript data={structuredData} />
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated gradient background using page's theme color */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        {/* Theme-colored floating orbs */}
        <div
          className="absolute top-20 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{ backgroundColor: themeColor }}
        />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{ backgroundColor: themeColor, animationDelay: '2s' }}
        />

        <div className="relative mx-auto max-w-2xl px-4 py-12">
          {/* Header */}
          <div className="animate-scale-in">
            <PublicPageHeader
              displayName={page.title}
              settings={{
                logo_url: page.logo_url,
                profile_description: page.description
              }}
            />
          </div>

          {/* Search Bar */}
          {links.length > 0 && (
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <SearchBar links={links} themeColor={themeColor} />
            </div>
          )}

          {/* Links by Category */}
          <div className={cn("animate-fade-in", layoutStyle === 'compact' ? 'space-y-6' : 'space-y-10')} style={{ animationDelay: '0.2s' }}>
            {groupedLinks.map((group, index) => (
              <div key={group.id} className="animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                {page.show_categories !== 0 && (
                  <div className={cn("flex items-center gap-3", layoutStyle === 'compact' ? 'mb-2' : 'mb-4')}>
                    <span className={cn(layoutStyle === 'compact' ? 'text-2xl' : 'text-3xl')}>{group.icon}</span>
                    <h2
                      className={cn(
                        "font-semibold",
                        layoutStyle === 'compact' ? 'text-lg' : 'text-2xl'
                      )}
                      style={{ color: themeColor }}
                    >
                      {group.name}
                    </h2>
                  </div>
                )}
                <div className={cn(
                  layoutStyle === 'grid' ? 'grid grid-cols-2 gap-3' : layoutStyle === 'compact' ? 'space-y-2' : 'space-y-3'
                )}>
                  {group.links.map((link: any) => (
                    <LinkCard key={link.id} link={link} themeColor={themeColor} variant={layoutStyle === 'list' ? 'default' : layoutStyle} />
                  ))}
                </div>
              </div>
            ))}

            {links.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 backdrop-blur-sm p-12 text-center animate-scale-in">
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <ExternalLink className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">Belum ada link di halaman ini</h3>
                  <p className="max-w-sm text-slate-500">
                    Halaman ini belum memiliki link. Kembali lagi nanti untuk melihat update terbaru.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p>
              Powered by{' '}
              <a href="/" className="text-slate-700 hover:underline hover:text-slate-900 transition-colors">
                svlink
              </a>
            </p>
            <p className="mt-2">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </>
  )
}
