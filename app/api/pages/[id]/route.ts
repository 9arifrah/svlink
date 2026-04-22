import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const page = await db.getPublicPageById(id);
    if (!page) {
      return NextResponse.json(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      );
    }

    if (page.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke halaman ini' },
        { status: 403 }
      );
    }

    const links = await db.getPublicPageLinks(id);

    return NextResponse.json({ page, links });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data halaman' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const page = await db.getPublicPageById(id);
    if (!page) {
      return NextResponse.json(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      );
    }

    if (page.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke halaman ini' },
        { status: 403 }
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
      is_active,
      link_ids,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (slug !== undefined) {
      const slugError = validateSlug(slug);
      if (slugError) {
        return NextResponse.json({ error: slugError }, { status: 400 });
      }

      if (slug !== page.slug) {
        const slugExists = await db.isSlugExists(slug);
        if (slugExists) {
          return NextResponse.json(
            { error: 'Slug sudah digunakan, silakan pilih yang lain' },
            { status: 409 }
          );
        }
      }
      updateData.slug = slug;
    }

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (theme_color !== undefined) updateData.theme_color = theme_color;
    if (layout_style !== undefined) updateData.layout_style = layout_style;
    if (show_categories !== undefined) updateData.show_categories = show_categories;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0 && !Array.isArray(link_ids)) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diubah' },
        { status: 400 }
      );
    }

    const updatedPage = await db.updatePublicPage(id, updateData, session.userId);

    // Sync links if link_ids was provided
    if (Array.isArray(link_ids)) {
      await db.setPublicPageLinks(id, link_ids);
    }

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui halaman' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const page = await db.getPublicPageById(id);
    if (!page) {
      return NextResponse.json(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      );
    }

    if (page.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke halaman ini' },
        { status: 403 }
      );
    }

    await db.deletePublicPage(id, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus halaman' },
      { status: 500 }
    );
  }
}
