import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugSchema, RESERVED_SLUGS } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const exclude = searchParams.get('exclude')

    if (!slug) {
      return NextResponse.json(
        { available: false, message: 'Slug wajib diisi' },
        { status: 200 }
      )
    }

    // Validate slug format using slugSchema
    const parseResult = slugSchema.safeParse(slug)
    if (!parseResult.success) {
      const message = parseResult.error.errors[0]?.message || 'Format slug tidak valid'
      return NextResponse.json(
        { available: false, message },
        { status: 200 }
      )
    }

    // Check against reserved slugs
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      return NextResponse.json(
        { available: false, message: 'Slug ini sudah digunakan oleh sistem' },
        { status: 200 }
      )
    }

    // Check uniqueness via database
    const exists = await db.isSlugExists(slug, exclude || undefined)
    if (exists) {
      // Generate suggestions
      const userId = session.userId
      const shortId = userId.substring(0, 4)
      const suggestions = [
        `${slug}-2`,
        `${slug}-${shortId}`,
        slug.length > 3 ? slug.substring(0, Math.floor(slug.length / 2)) + slug.substring(slug.length - Math.ceil(slug.length / 2)) : `${slug}1`
      ]

      // Filter out reserved and duplicates
      const uniqueSuggestions = [...new Set(
        suggestions.filter(s => s.length >= 3 && !RESERVED_SLUGS.includes(s.toLowerCase()) && s !== slug)
      )].slice(0, 3)

      return NextResponse.json(
        { available: false, message: 'Slug sudah digunakan', suggestions: uniqueSuggestions },
        { status: 200 }
      )
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    console.error('[v0] Error checking slug:', error)
    return NextResponse.json(
      { error: 'Gagal memeriksa slug' },
      { status: 500 }
    )
  }
}
