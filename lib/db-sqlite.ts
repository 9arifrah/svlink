import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { DatabaseClient } from './db-types'

const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'svlink.db')

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize database schema
function initializeSchema() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      custom_slug TEXT UNIQUE,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      theme_color TEXT DEFAULT '#3b82f6',
      logo_url TEXT,
      page_title TEXT,
      show_categories INTEGER DEFAULT 1,
      profile_description TEXT,
      layout_style TEXT DEFAULT 'list',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category_id TEXT,
      is_public INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      click_count INTEGER DEFAULT 0,
      qr_code TEXT,
      short_code TEXT UNIQUE,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `)

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      user_id TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Public pages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS public_pages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      theme_color TEXT DEFAULT '#3b82f6',
      layout_style TEXT DEFAULT 'list',
      show_categories INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      click_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Public page links junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS public_page_links (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      link_id TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (page_id) REFERENCES public_pages(id) ON DELETE CASCADE,
      FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
      UNIQUE(page_id, link_id)
    )
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_slug ON users(custom_slug);
    CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
    CREATE INDEX IF NOT EXISTS idx_links_category_id ON links(category_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
    CREATE INDEX IF NOT EXISTS idx_links_is_public ON links(is_public);
    CREATE INDEX IF NOT EXISTS idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code) WHERE short_code IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_public_pages_user_id ON public_pages(user_id);
    CREATE INDEX IF NOT EXISTS idx_public_pages_slug ON public_pages(slug);
    CREATE INDEX IF NOT EXISTS idx_public_pages_is_active ON public_pages(is_active);
    CREATE INDEX IF NOT EXISTS idx_public_page_links_page_id ON public_page_links(page_id);
    CREATE INDEX IF NOT EXISTS idx_public_page_links_link_id ON public_page_links(link_id);
  `)

  // Phase 1 Admin Migrations
  db.exec(`ALTER TABLE users ADD COLUMN is_suspended INTEGER DEFAULT 0`)
  db.exec(`ALTER TABLE users ADD COLUMN failed_login_count INTEGER DEFAULT 0`)
  db.exec(`ALTER TABLE users ADD COLUMN last_failed_login DATETIME`)
  db.exec(`ALTER TABLE users ADD COLUMN locked_until DATETIME`)

  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    )
  `)

  // Data migration: create default public_page for existing users who have custom_slug
  const usersWithSlug = db.prepare(
    "SELECT id, custom_slug, display_name FROM users WHERE custom_slug IS NOT NULL AND custom_slug != ''"
  ).all() as any[]

  for (const user of usersWithSlug) {
    const existingPage = db.prepare(
      'SELECT 1 FROM public_pages WHERE user_id = ?'
    ).get(user.id)
    if (!existingPage) {
      db.prepare(`
        INSERT INTO public_pages (id, user_id, slug, title, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(crypto.randomUUID(), user.id, user.custom_slug, user.display_name || 'My Links')

      // Migrate existing public links for this user into the page
      const publicLinks = db.prepare(
        'SELECT id FROM links WHERE user_id = ? AND is_public = 1 ORDER BY created_at DESC'
      ).all(user.id) as any[]

      for (let i = 0; i < publicLinks.length; i++) {
        db.prepare(`
          INSERT OR IGNORE INTO public_page_links (id, page_id, link_id, sort_order)
          VALUES (?, (SELECT id FROM public_pages WHERE user_id = ?), ?, ?)
        `).run(crypto.randomUUID(), user.id, publicLinks[i].id, i)
      }
    }
  }
}

// Initialize schema on import
initializeSchema()

// Helper function to convert SQLite row to JS object
function rowToObject(row: any): any {
  if (!row) return null
  return {
    ...row,
    is_public: Boolean(row.is_public),
    is_active: Boolean(row.is_active),
    show_categories: Boolean(row.show_categories),
    is_suspended: Boolean(row.is_suspended)
  }
}

// SQLite Implementation
export const sqliteClient: DatabaseClient = {
  // Users
  async getUserByEmail(email: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    const row = stmt.get(email)
    return rowToObject(row)
  },

  async getUserById(id: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const row = stmt.get(id)
    return rowToObject(row)
  },

  async getUserBySlug(slug: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE custom_slug = ?')
    const row = stmt.get(slug)
    return rowToObject(row)
  },

  async createUser(user: any) {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, custom_slug, display_name)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(user.id, user.email, user.password_hash, user.custom_slug || null, user.display_name || null)
    return this.getUserById(user.id)
  },

  async updateUser(id: string, data: any) {
    const fields: string[] = []
    const values: any[] = []

    if (data.email !== undefined) {
      fields.push('email = ?')
      values.push(data.email)
    }
    if (data.password_hash !== undefined) {
      fields.push('password_hash = ?')
      values.push(data.password_hash)
    }
    if (data.custom_slug !== undefined) {
      fields.push('custom_slug = ?')
      values.push(data.custom_slug)
    }
    if (data.display_name !== undefined) {
      fields.push('display_name = ?')
      values.push(data.display_name)
    }

    if (fields.length > 0) {
      values.push(id)
      const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      stmt.run(...values)
    }

    return this.getUserById(id)
  },

  async deleteUser(id: string) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    stmt.run(id)
  },

  async getAllUsers() {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC')
    const rows = stmt.all()
    return rows.map(rowToObject)
  },

  // User Settings
  async getUserSettings(userId: string) {
    const stmt = db.prepare('SELECT * FROM user_settings WHERE user_id = ?')
    const row = stmt.get(userId)
    return rowToObject(row)
  },

  async createUserSettings(settings: any) {
    const stmt = db.prepare(`
      INSERT INTO user_settings (id, user_id, theme_color, logo_url, page_title, show_categories, profile_description, layout_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      settings.id,
      settings.user_id,
      settings.theme_color || '#3b82f6',
      settings.logo_url || null,
      settings.page_title || null,
      settings.show_categories !== undefined ? (settings.show_categories ? 1 : 0) : 1,
      settings.profile_description || null,
      settings.layout_style || 'list'
    )
    return this.getUserSettings(settings.user_id)
  },

  async updateUserSettings(userId: string, data: any) {
    const fields: string[] = []
    const values: any[] = []

    if (data.theme_color !== undefined) {
      fields.push('theme_color = ?')
      values.push(data.theme_color)
    }
    if (data.logo_url !== undefined) {
      fields.push('logo_url = ?')
      values.push(data.logo_url)
    }
    if (data.page_title !== undefined) {
      fields.push('page_title = ?')
      values.push(data.page_title)
    }
    if (data.show_categories !== undefined) {
      fields.push('show_categories = ?')
      values.push(data.show_categories ? 1 : 0)
    }
    if (data.profile_description !== undefined) {
      fields.push('profile_description = ?')
      values.push(data.profile_description)
    }
    if (data.layout_style !== undefined) {
      fields.push('layout_style = ?')
      values.push(data.layout_style)
    }

    if (fields.length > 0) {
      values.push(userId)
      const stmt = db.prepare(`UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`)
      stmt.run(...values)
    }

    return this.getUserSettings(userId)
  },

  // Links
  async getLinks(userId?: string) {
    let query = `
      SELECT l.*, c.name as category_name, c.icon as category_icon
      FROM links l
      LEFT JOIN categories c ON l.category_id = c.id
    `
    const params: any[] = []

    if (userId) {
      query += ' WHERE l.user_id = ?'
      params.push(userId)
    }

    query += ' ORDER BY l.created_at DESC'

    const stmt = db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((row: any) => {
      const obj = rowToObject(row)
      if (obj.category_name) {
        obj.category = {
          id: row.category_id,
          name: row.category_name,
          icon: row.category_icon
        }
      }
      return obj
    })
  },

  async getLinkById(id: string) {
    const stmt = db.prepare(`
      SELECT l.*, c.name as category_name, c.icon as category_icon
      FROM links l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = ?
    `)
    const row = stmt.get(id)
    return rowToObject(row)
  },

  async getLinkByShortCode(shortCode: string) {
    const stmt = db.prepare(`
      SELECT l.*, c.name as category_name, c.icon as category_icon
      FROM links l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.short_code = ?
    `)
    const row = stmt.get(shortCode.toLowerCase())
    return rowToObject(row)
  },

  async isShortCodeExists(shortCode: string, excludeLinkId?: string): Promise<boolean> {
    let query = 'SELECT 1 FROM links WHERE short_code = ?'
    const params: any[] = [shortCode.toLowerCase()]

    if (excludeLinkId) {
      query += ' AND id != ?'
      params.push(excludeLinkId)
    }

    const stmt = db.prepare(query)
    const row = stmt.get(...params)
    return !!row
  },

  async generateShortCode(length: number = 6): Promise<string> {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      let code = ''
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      // Cek apakah code sudah ada
      const exists = await this.isShortCodeExists(code)
      if (!exists) {
        return code
      }

      attempts++
    }

    // Jika setelah maxAttempts masih gagal, coba length yang lebih panjang
    if (length < 10) {
      return this.generateShortCode(length + 1)
    }

    throw new Error('Gagal generate short code yang unik')
  },

  async createLink(link: any) {
    const stmt = db.prepare(`
      INSERT INTO links (id, title, url, description, category_id, is_public, is_active, qr_code, short_code, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      link.id,
      link.title,
      link.url,
      link.description || null,
      link.category_id || null,
      link.is_public ? 1 : 0,
      link.is_active !== undefined ? (link.is_active ? 1 : 0) : 1,
      link.qr_code || null,
      link.short_code || null,
      link.user_id
    )
    return this.getLinkById(link.id)
  },

  async updateLink(id: string, data: any, userId: string) {
    // Jika mencoba menghapus short_code yang sudah ada
    if (data.short_code === null || data.short_code === '') {
      const existing = await this.getLinkById(id)
      if (existing && existing.short_code) {
        throw new Error('Tidak bisa menghapus short code yang sudah ada')
      }
    }

    const fields: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.url !== undefined) {
      fields.push('url = ?')
      values.push(data.url)
    }
    if (data.description !== undefined) {
      fields.push('description = ?')
      values.push(data.description)
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?')
      values.push(data.category_id)
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?')
      values.push(data.is_active ? 1 : 0)
    }
    if (data.is_public !== undefined) {
      fields.push('is_public = ?')
      values.push(data.is_public ? 1 : 0)
    }
    if (data.qr_code !== undefined) {
      fields.push('qr_code = ?')
      values.push(data.qr_code)
    }
    if (data.short_code !== undefined) {
      fields.push('short_code = ?')
      values.push(data.short_code || null)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    if (fields.length > 0) {
      values.push(id, userId)
      const stmt = db.prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
      stmt.run(...values)
    }

    return this.getLinkById(id)
  },

  async deleteLink(id: string, userId: string) {
    const stmt = db.prepare('DELETE FROM links WHERE id = ? AND user_id = ?')
    stmt.run(id, userId)
  },

  async incrementClickCount(id: string) {
    const stmt = db.prepare('UPDATE links SET click_count = click_count + 1 WHERE id = ?')
    stmt.run(id)
  },

  async getPageCountForLink(linkId: string): Promise<number> {
    const stmt = db.prepare(
      'SELECT COUNT(*) as count FROM public_page_links WHERE link_id = ?'
    )
    const row = stmt.get(linkId) as { count: number }
    return row.count
  },

  // Categories
  async getCategories(userId?: string) {
    let query = 'SELECT * FROM categories'
    const params: any[] = []

    if (userId) {
      query += ' WHERE user_id = ?'
      params.push(userId)
    }

    query += ' ORDER BY sort_order ASC, name ASC'

    const stmt = db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map(rowToObject)
  },

  async getCategoryById(id: string) {
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ?')
    const row = stmt.get(id)
    return rowToObject(row)
  },

  async createCategory(category: any) {
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, icon, sort_order, user_id)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(category.id, category.name, category.icon || null, category.sort_order || 0, category.user_id)
    return this.getCategoryById(category.id)
  },

  async updateCategory(id: string, data: any, userId: string) {
    const fields: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      fields.push('name = ?')
      values.push(data.name)
    }
    if (data.icon !== undefined) {
      fields.push('icon = ?')
      values.push(data.icon)
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?')
      values.push(data.sort_order)
    }

    if (fields.length > 0) {
      values.push(id, userId)
      const stmt = db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
      stmt.run(...values)
    }

    return this.getCategoryById(id)
  },

  async deleteCategory(id: string, userId: string) {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?')
    stmt.run(id, userId)
  },

  // Admin
  async getAdminUsers() {
    const stmt = db.prepare(`
      SELECT u.* FROM users u
      INNER JOIN admin_users a ON u.id = a.user_id
    `)
    const rows = stmt.all()
    return rows.map(rowToObject)
  },

  async isAdminUser(userId: string) {
    const stmt = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?')
    const row = stmt.get(userId)
    return !!row
  },

  // Admin Link Operations (no userId restriction)
  async adminGetAllLinks() {
    const query = `
      SELECT l.*, c.name as category_name, c.icon as category_icon
      FROM links l
      LEFT JOIN categories c ON l.category_id = c.id
      ORDER BY l.created_at DESC
    `
    const stmt = db.prepare(query)
    const rows = stmt.all()
    return rows.map((row: any) => {
      const obj = rowToObject(row)
      if (obj.category_name) {
        obj.category = {
          id: row.category_id,
          name: row.category_name,
          icon: row.category_icon
        }
      }
      return obj
    })
  },

  async adminCreateLink(link: any) {
    const stmt = db.prepare(`
      INSERT INTO links (id, title, url, description, category_id, is_public, is_active, qr_code, short_code, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      link.id,
      link.title,
      link.url,
      link.description || null,
      link.category_id || null,
      link.is_public ? 1 : 0,
      link.is_active !== undefined ? (link.is_active ? 1 : 0) : 1,
      link.qr_code || null,
      link.short_code || null,
      link.user_id || null
    )
    return this.getLinkById(link.id)
  },

  async adminUpdateLink(id: string, data: any) {
    const fields: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.url !== undefined) {
      fields.push('url = ?')
      values.push(data.url)
    }
    if (data.description !== undefined) {
      fields.push('description = ?')
      values.push(data.description)
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?')
      values.push(data.category_id)
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?')
      values.push(data.is_active ? 1 : 0)
    }
    if (data.is_public !== undefined) {
      fields.push('is_public = ?')
      values.push(data.is_public ? 1 : 0)
    }
    if (data.qr_code !== undefined) {
      fields.push('qr_code = ?')
      values.push(data.qr_code)
    }
    if (data.short_code !== undefined) {
      fields.push('short_code = ?')
      values.push(data.short_code || null)
    }
    if (data.user_id !== undefined) {
      fields.push('user_id = ?')
      values.push(data.user_id)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    if (fields.length > 0) {
      values.push(id)
      const stmt = db.prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`)
      stmt.run(...values)
    }

    return this.getLinkById(id)
  },

  async adminDeleteLink(id: string) {
    const stmt = db.prepare('DELETE FROM links WHERE id = ?')
    stmt.run(id)
  },

  // Admin User Management
  async getAllUsersWithAdminStatus(search?: string) {
    let query = `
      SELECT u.*, CASE WHEN a.user_id IS NOT NULL THEN 1 ELSE 0 END as is_admin
      FROM users u
      LEFT JOIN admin_users a ON u.id = a.user_id
    `
    const params: any[] = []

    if (search) {
      query += ' WHERE u.email LIKE ?'
      params.push(`%${search}%`)
    }

    query += ' ORDER BY u.created_at DESC'

    const stmt = db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((row: any) => ({
      ...rowToObject(row),
      is_admin: Boolean(row.is_admin)
    }))
  },

  async createUserWithSettings(userData: any, isAdmin: boolean = false) {
    // Create user
    const userStmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, custom_slug)
      VALUES (?, ?, ?, ?, ?)
    `)
    userStmt.run(
      userData.id,
      userData.email,
      userData.password_hash,
      userData.display_name,
      userData.custom_slug || null
    )

    // Create user settings
    const settingsStmt = db.prepare(`
      INSERT INTO user_settings (id, user_id, theme_color, show_categories)
      VALUES (?, ?, ?, ?)
    `)
    settingsStmt.run(
      crypto.randomUUID(),
      userData.id,
      '#3b82f6',
      1
    )

    // Add to admin_users if needed
    if (isAdmin) {
      const adminStmt = db.prepare('INSERT INTO admin_users (user_id) VALUES (?)')
      adminStmt.run(userData.id)
    }

    // Return user with admin status
    const user = await this.getUserById(userData.id)
    return {
      ...user,
      is_admin: isAdmin
    }
  },

  async adminUpdateUser(id: string, userData: any, isAdmin?: boolean) {
    const fields: string[] = []
    const values: any[] = []

    if (userData.email !== undefined) {
      fields.push('email = ?')
      values.push(userData.email)
    }
    if (userData.password_hash !== undefined) {
      fields.push('password_hash = ?')
      values.push(userData.password_hash)
    }
    if (userData.display_name !== undefined) {
      fields.push('display_name = ?')
      values.push(userData.display_name)
    }
    if (userData.custom_slug !== undefined) {
      fields.push('custom_slug = ?')
      values.push(userData.custom_slug)
    }

    if (fields.length > 0) {
      values.push(id)
      const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      stmt.run(...values)
    }

    // Update admin status if provided
    if (isAdmin !== undefined) {
      if (isAdmin) {
        // Add to admin_users if not already
        const checkStmt = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?')
        const exists = checkStmt.get(id)
        if (!exists) {
          const insertStmt = db.prepare('INSERT INTO admin_users (user_id) VALUES (?)')
          insertStmt.run(id)
        }
      } else {
        // Remove from admin_users
        const deleteStmt = db.prepare('DELETE FROM admin_users WHERE user_id = ?')
        deleteStmt.run(id)
      }
    }

    // Get updated user with admin status
    const user = await this.getUserById(id)
    const adminCheck = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?')
    const isAdminResult = !!adminCheck.get(id)

    return {
      ...user,
      is_admin: isAdminResult
    }
  },

  async adminDeleteUser(id: string) {
    // Delete from admin_users first
    const adminStmt = db.prepare('DELETE FROM admin_users WHERE user_id = ?')
    adminStmt.run(id)

    // Delete from users table (cascade will handle user_settings)
    const userStmt = db.prepare('DELETE FROM users WHERE id = ?')
    userStmt.run(id)
  },

  async setAdminStatus(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      const checkStmt = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?')
      const exists = checkStmt.get(userId)
      if (!exists) {
        const insertStmt = db.prepare('INSERT INTO admin_users (user_id) VALUES (?)')
        insertStmt.run(userId)
      }
    } else {
      const deleteStmt = db.prepare('DELETE FROM admin_users WHERE user_id = ?')
      deleteStmt.run(userId)
    }
  },

  // Admin Category Operations (global categories without userId)
  async adminGetAllCategories() {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC')
    const rows = stmt.all()
    return rows.map(rowToObject)
  },

  async adminCreateCategory(category: any) {
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, icon, description, sort_order, user_id)
      VALUES (?, ?, ?, ?, ?, NULL)
    `)
    stmt.run(
      category.id,
      category.name,
      category.icon || null,
      category.description || null,
      category.sort_order || 0
    )
    return this.getCategoryById(category.id)
  },

  async adminUpdateCategory(id: string, categoryData: any) {
    const fields: string[] = []
    const values: any[] = []

    if (categoryData.name !== undefined) {
      fields.push('name = ?')
      values.push(categoryData.name)
    }
    if (categoryData.icon !== undefined) {
      fields.push('icon = ?')
      values.push(categoryData.icon)
    }
    if (categoryData.description !== undefined) {
      fields.push('description = ?')
      values.push(categoryData.description)
    }
    if (categoryData.sort_order !== undefined) {
      fields.push('sort_order = ?')
      values.push(categoryData.sort_order)
    }

    if (fields.length > 0) {
      values.push(id)
      const stmt = db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`)
      stmt.run(...values)
    }

    return this.getCategoryById(id)
  },

  async adminDeleteCategory(id: string) {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?')
    stmt.run(id)
  },

  // Public Pages
  async getPublicPages(userId: string) {
    const stmt = db.prepare(`
      SELECT pp.*,
        COUNT(ppl.link_id) as link_count
      FROM public_pages pp
      LEFT JOIN public_page_links ppl ON pp.id = ppl.page_id
      WHERE pp.user_id = ?
      GROUP BY pp.id
      ORDER BY pp.sort_order ASC, pp.created_at DESC
    `)
    const rows = stmt.all(userId)
    return rows.map(rowToObject)
  },

  async getPublicPageById(id: string) {
    const stmt = db.prepare('SELECT * FROM public_pages WHERE id = ?')
    const row = stmt.get(id)
    return rowToObject(row)
  },

  async getPublicPageBySlug(slug: string) {
    const stmt = db.prepare('SELECT * FROM public_pages WHERE slug = ? AND is_active = 1')
    const row = stmt.get(slug)
    return rowToObject(row)
  },

  async isSlugExists(slug: string, excludePageId?: string): Promise<boolean> {
    let query = 'SELECT 1 FROM public_pages WHERE slug = ?'
    const params: any[] = [slug]

    if (excludePageId) {
      query += ' AND id != ?'
      params.push(excludePageId)
    }

    const stmt = db.prepare(query)
    const row = stmt.get(...params)
    return !!row
  },

  async createPublicPage(page: any) {
    const stmt = db.prepare(`
      INSERT INTO public_pages (id, user_id, slug, title, description, logo_url, theme_color, layout_style, show_categories, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      page.id,
      page.user_id,
      page.slug,
      page.title,
      page.description || null,
      page.logo_url || null,
      page.theme_color || '#3b82f6',
      page.layout_style || 'list',
      page.show_categories !== undefined ? (page.show_categories ? 1 : 0) : 1,
      page.is_active !== undefined ? (page.is_active ? 1 : 0) : 1,
      page.sort_order || 0
    )
    return this.getPublicPageById(page.id)
  },

  async updatePublicPage(id: string, data: any, userId: string) {
    const fields: string[] = []
    const values: any[] = []

    if (data.slug !== undefined) {
      fields.push('slug = ?')
      values.push(data.slug)
    }
    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.description !== undefined) {
      fields.push('description = ?')
      values.push(data.description)
    }
    if (data.logo_url !== undefined) {
      fields.push('logo_url = ?')
      values.push(data.logo_url)
    }
    if (data.theme_color !== undefined) {
      fields.push('theme_color = ?')
      values.push(data.theme_color)
    }
    if (data.layout_style !== undefined) {
      fields.push('layout_style = ?')
      values.push(data.layout_style)
    }
    if (data.show_categories !== undefined) {
      fields.push('show_categories = ?')
      values.push(data.show_categories ? 1 : 0)
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?')
      values.push(data.is_active ? 1 : 0)
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?')
      values.push(data.sort_order)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    if (fields.length > 0) {
      values.push(id, userId)
      const stmt = db.prepare(`UPDATE public_pages SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
      stmt.run(...values)
    }

    return this.getPublicPageById(id)
  },

  async deletePublicPage(id: string, userId: string) {
    const stmt = db.prepare('DELETE FROM public_pages WHERE id = ? AND user_id = ?')
    stmt.run(id, userId)
  },

  async getPublicPageLinks(pageId: string) {
    const stmt = db.prepare(`
      SELECT l.*, c.name as category_name, c.icon as category_icon, pll.sort_order as page_sort_order
      FROM public_page_links pll
      INNER JOIN links l ON pll.link_id = l.id
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE pll.page_id = ?
      ORDER BY pll.sort_order ASC, pll.created_at ASC
    `)
    const rows = stmt.all(pageId)
    return rows.map((row: any) => {
      const obj = rowToObject(row)
      if (obj.category_name) {
        obj.category = {
          id: row.category_id,
          name: row.category_name,
          icon: row.category_icon
        }
      }
      return obj
    })
  },

  async setPublicPageLinks(pageId: string, linkIds: string[]) {
    // Remove existing links for this page
    const deleteStmt = db.prepare('DELETE FROM public_page_links WHERE page_id = ?')
    deleteStmt.run(pageId)

    // Insert new links
    if (linkIds.length > 0) {
      const insertStmt = db.prepare(`
        INSERT INTO public_page_links (id, page_id, link_id, sort_order)
        VALUES (?, ?, ?, ?)
      `)
      for (let i = 0; i < linkIds.length; i++) {
        insertStmt.run(crypto.randomUUID(), pageId, linkIds[i], i)
      }
    }
  },

  async incrementPageClickCount(pageId: string) {
    const stmt = db.prepare('UPDATE public_pages SET click_count = click_count + 1 WHERE id = ?')
    stmt.run(pageId)
  },

  // Stats
  async getUserStats(userId: string) {
    const linksStmt = db.prepare('SELECT COUNT(*) as count FROM links WHERE user_id = ?')
    const linksResult = linksStmt.get(userId) as { count: number }

    const categoriesStmt = db.prepare('SELECT COUNT(*) as count FROM categories WHERE user_id = ?')
    const categoriesResult = categoriesStmt.get(userId) as { count: number }

    const clicksStmt = db.prepare('SELECT SUM(click_count) as total FROM links WHERE user_id = ?')
    const clicksResult = clicksStmt.get(userId) as { total: number | null }

    const publicLinksStmt = db.prepare('SELECT COUNT(*) as count FROM links WHERE user_id = ? AND is_public = 1')
    const publicLinksResult = publicLinksStmt.get(userId) as { count: number }

    return {
      totalLinks: linksResult.count,
      totalCategories: categoriesResult.count,
      totalClicks: clicksResult.total || 0,
      publicLinks: publicLinksResult.count
    }
  },

  async getPlatformStats() {
    const usersStmt = db.prepare('SELECT COUNT(*) as count FROM users')
    const usersResult = usersStmt.get() as { count: number }

    const linksStmt = db.prepare('SELECT COUNT(*) as count FROM links')
    const linksResult = linksStmt.get() as { count: number }

    const clicksStmt = db.prepare('SELECT SUM(click_count) as total FROM links')
    const clicksResult = clicksStmt.get() as { total: number | null }

    const categoriesStmt = db.prepare('SELECT COUNT(*) as count FROM categories')
    const categoriesResult = categoriesStmt.get() as { count: number }

    return {
      totalUsers: usersResult.count,
      totalLinks: linksResult.count,
      totalClicks: clicksResult.total || 0,
      totalCategories: categoriesResult.count
    }
  },

  // Phase 1: Admin Quick Wins
  async suspendUser(userId: string) {
    db.prepare('UPDATE users SET is_suspended = 1 WHERE id = ?').run(userId)
  },

  async unsuspendUser(userId: string) {
    db.prepare('UPDATE users SET is_suspended = 0 WHERE id = ?').run(userId)
  },

  async bulkUserAction(userIds: string[], action: 'suspend' | 'unsuspend' | 'activate' | 'delete') {
    let success = 0
    let errors = 0
    for (const id of userIds) {
      try {
        if (action === 'suspend') await this.suspendUser(id)
        else if (action === 'unsuspend') await this.unsuspendUser(id)
        else if (action === 'activate') {
          db.prepare('UPDATE users SET is_suspended = 0 WHERE id = ?').run(id)
        }
        else if (action === 'delete') await this.adminDeleteUser(id)
        success++
      } catch { errors++ }
    }
    return { success, errors }
  },

  async getAllPublicPages() {
    const rows = db.prepare(`
      SELECT pp.*, u.email, u.display_name
      FROM public_pages pp
      LEFT JOIN users u ON pp.user_id = u.id
      ORDER BY pp.created_at DESC
    `).all() as any[]
    return rows.map(r => rowToObject(r))
  },

  async getTopLinksByClicks(limit: number = 10) {
    const rows = db.prepare(`
      SELECT l.*, u.email, u.display_name, c.name as category_name
      FROM links l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      ORDER BY l.click_count DESC
      LIMIT ?
    `).all(limit) as any[]
    return rows.map(r => rowToObject(r))
  },

  async exportLinksAsCSV() {
    const rows = db.prepare(`
      SELECT l.id, l.title, l.url, l.description, l.short_code, l.click_count,
             l.is_public, l.is_active, l.created_at,
             u.email as user_email, u.display_name as user_name,
             c.name as category_name
      FROM links l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      ORDER BY l.created_at DESC
    `).all() as any[]
    const header = 'ID,Title,URL,Description,Short Code,Clicks,Public,Active,Created At,User Email,User Name,Category\n'
    const escapeCsv = (v: any) => v ? `"${String(v).replace(/"/g, '""')}"` : ''
    const body = rows.map(r =>
      [r.id, r.title, r.url, r.description, r.short_code, r.click_count,
       r.is_public ? 1 : 0, r.is_active ? 1 : 0, r.created_at,
       r.user_email, r.user_name, r.category_name].map(escapeCsv).join(',')
    ).join('\n')
    return header + body
  },

  async exportUsersAsCSV() {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[]
    const header = 'ID,Email,Display Name,Custom Slug,Created At,Suspended,Failed Logins,Is Admin\n'
    const escapeCsv = (v: any) => v ? `"${String(v).replace(/"/g, '""')}"` : ''
    const rows2: any[] = []
    for (const u of users) {
      const linkCount = db.prepare('SELECT COUNT(*) as c FROM links WHERE user_id = ?').get(u.id) as any
      const pageCount = db.prepare('SELECT COUNT(*) as c FROM public_pages WHERE user_id = ?').get(u.id) as any
      const isAdmin = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?').get(u.id)
      rows2.push({
        ...u, link_count: linkCount.c, page_count: pageCount.c, is_admin: isAdmin ? 1 : 0
      })
    }
    const body = rows2.map(r =>
      [r.id, r.email, r.display_name, r.custom_slug, r.created_at,
       r.is_suspended ? 1 : 0, r.failed_login_count || 0, r.is_admin].map(escapeCsv).join(',')
    ).join('\n')
    return header + body
  },

  async trackFailedLogin(userId: string) {
    db.prepare(`
      UPDATE users SET failed_login_count = COALESCE(failed_login_count, 0) + 1,
                       last_failed_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(userId)
    const user = db.prepare('SELECT failed_login_count FROM users WHERE id = ?').get(userId) as any
    const locked = (user?.failed_login_count || 0) >= 5
    if (locked) {
      db.prepare("UPDATE users SET locked_until = datetime('now', '+15 minutes') WHERE id = ?").run(userId)
    }
    return { locked, failedCount: user?.failed_login_count || 0 }
  },

  async resetFailedLogin(userId: string) {
    db.prepare(`
      UPDATE users SET failed_login_count = 0, last_failed_login = NULL, locked_until = NULL
      WHERE id = ?
    `).run(userId)
  },

  async getAnnouncements() {
    return db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all()
  },

  async getActiveAnnouncements() {
    return db.prepare(`
      SELECT * FROM announcements
      WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC
    `).all()
  },

  async createAnnouncement(announcement: any) {
    db.prepare(`
      INSERT INTO announcements (id, title, message, is_active, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      announcement.id,
      announcement.title,
      announcement.message,
      announcement.is_active ? 1 : 0,
      announcement.expires_at || null
    )
    return db.prepare('SELECT * FROM announcements WHERE id = ?').get(announcement.id)
  },

  async updateAnnouncement(id: string, data: any) {
    const fields: string[] = []
    const values: any[] = []
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
    if (data.message !== undefined) { fields.push('message = ?'); values.push(data.message) }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0) }
    if (data.expires_at !== undefined) { fields.push('expires_at = ?'); values.push(data.expires_at || null) }
    if (fields.length > 0) {
      values.push(id)
      db.prepare(`UPDATE announcements SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    }
    return db.prepare('SELECT * FROM announcements WHERE id = ?').get(id)
  },

  async deleteAnnouncement(id: string) {
    db.prepare('DELETE FROM announcements WHERE id = ?').run(id)
  },

  async toggleMaintenanceMode(enabled: boolean) {
    const fs = require('fs')
    const path = require('path')
    const flagPath = path.join(process.cwd(), 'data', '.maintenance')
    if (enabled) fs.writeFileSync(flagPath, 'true')
    else if (fs.existsSync(flagPath)) fs.unlinkSync(flagPath)
  },

  async isMaintenanceMode() {
    const fs = require('fs')
    const path = require('path')
    const flagPath = path.join(process.cwd(), 'data', '.maintenance')
    return fs.existsSync(flagPath)
  }
}

export default db
