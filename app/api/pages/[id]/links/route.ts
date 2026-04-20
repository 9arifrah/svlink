import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getUserSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

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
    const { link_ids } = body;

    if (!link_ids || !Array.isArray(link_ids)) {
      return NextResponse.json(
        { error: 'link_ids harus berupa array' },
        { status: 400 }
      );
    }

    // Validate that all link_ids belong to the authenticated user
    for (const linkId of link_ids) {
      const link = await db.getLinkById(linkId);
      if (!link) {
        return NextResponse.json(
          { error: `Link dengan ID ${linkId} tidak ditemukan` },
          { status: 404 }
        );
      }
      if (link.user_id !== session.userId) {
        return NextResponse.json(
          { error: 'Semua link harus milik Anda' },
          { status: 403 }
        );
      }
    }

    await db.setPublicPageLinks(id, link_ids);

    return NextResponse.json({
      success: true,
      link_count: link_ids.length,
    });
  } catch (error) {
    console.error('Error updating page links:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui link halaman' },
      { status: 500 }
    );
  }
}
