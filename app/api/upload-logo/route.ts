import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { uploadLogo, deleteLogo } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    const url = await uploadLogo(file, session.userId)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[v0] Error uploading logo:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Gagal mengupload logo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { logoUrl } = body

    if (!logoUrl) {
      return NextResponse.json({ error: 'URL logo diperlukan' }, { status: 400 })
    }

    await deleteLogo(logoUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting logo:', error)
    return NextResponse.json({ error: 'Gagal menghapus logo' }, { status: 500 })
  }
}
