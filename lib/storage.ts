import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const MAX_FILE_SIZE = 500 * 1024 // 500KB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'logos')

function isSupabaseAvailable(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return !!(url && (key || serviceKey))
}

function getSupabaseStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured')
  }
  
  return createClient(url, key)
}

function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

function generateFileName(userId: string, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${userId}-${timestamp}-${random}${ext}`
}

export async function uploadLogo(file: File, userId: string): Promise<string> {
  // Validate file
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File terlalu besar (max 500KB)')
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan PNG, JPG, GIF, atau WebP')
  }
  
  const fileName = generateFileName(userId, file.name)
  
  if (isSupabaseAvailable()) {
    // Upload to Supabase Storage
    const supabase = getSupabaseStorageClient()
    const filePath = `logos/${fileName}`
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const { data, error } = await supabase.storage
      .from('user-logos')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw new Error(`Gagal upload ke storage: ${error.message}`)
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-logos')
      .getPublicUrl(data.path)
    
    return urlData.publicUrl
  } else {
    // Fallback to local storage
    ensureUploadDir()
    const filePath = path.join(UPLOAD_DIR, fileName)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    fs.writeFileSync(filePath, buffer)
    
    // Return relative path (will be served from /uploads/logos/)
    return `/uploads/logos/${fileName}`
  }
}

export async function deleteLogo(url: string): Promise<void> {
  if (!url) return
  
  if (url.startsWith('/uploads/logos/')) {
    // Local file - delete from filesystem
    const fileName = url.replace('/uploads/logos/', '')
    const filePath = path.join(UPLOAD_DIR, fileName)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } else if (isSupabaseAvailable()) {
    // Supabase Storage - extract path from URL and delete
    const supabase = getSupabaseStorageClient()
    
    // Extract file path from public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/user-logos/logos/<filename>
    const urlParts = url.split('/')
    const logosIndex = urlParts.indexOf('user-logos')
    
    if (logosIndex !== -1 && logosIndex < urlParts.length - 1) {
      const filePath = urlParts.slice(logosIndex + 1).join('/')
      
      const { error } = await supabase.storage
        .from('user-logos')
        .remove([filePath])
      
      if (error) {
        console.error('[storage] Error deleting file from Supabase:', error.message)
        // Don't throw - continue even if delete fails
      }
    }
  }
}

export { MAX_FILE_SIZE, ALLOWED_TYPES, isSupabaseAvailable }
