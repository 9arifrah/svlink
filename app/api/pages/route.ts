import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';
import crypto from 'crypto';

const RESERVED_SLUGS = [
  'dashboard',
  'login',
  'register',
  'admin',
  'api',
  'auth',
  'user',
  'users',
  'settings',
  'categories',
  'links',
  'track-click',
  'public',
  'profile',
];

function validateSlug(slug: string): string | null {
  if (!slug || slug.length < 3) {
    return 'Slug harus minimal 3 karakter';
  }

  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung';
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return 'Slug ini sudah digunakan oleh sistem';
  }

  return null;
}

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    const pages = await db.getPublicPages(session.userId);

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar halaman' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      slug,
      title,
      description,
      logo_url,
      theme_color,
      layout_style,
      show_categories,
      link_ids,
    } = body;

    if (!slug || !title) {
      return NextResponse.json(
        { error: 'Slug dan judul harus diisi' },
        { status: 400 }
      );
    }

    const slugError = validateSlug(slug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }

    const slugExists = await db.isSlugExists(slug);
    if (slugExists) {
      return NextResponse.json(
        { error: 'Slug sudah digunakan, silakan pilih yang lain' },
        { status: 409 }
      );
    }

    const pageId = crypto.randomUUID();

    const page = await db.createPublicPage({
      id: pageId,
      user_id: session.userId,
      slug,
      title,
      description: description || null,
      logo_url: logo_url || null,
      theme_color: theme_color || null,
      layout_style: layout_style || null,
      show_categories: show_categories ?? false,
    });

    if (link_ids && Array.isArray(link_ids) && link_ids.length > 0) {
      await db.setPublicPageLinks(pageId, link_ids);
    }

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Gagal membuat halaman' },
      { status: 500 }
    );
  }
}
