import { supabase } from './supabase'
import { DatabaseClient } from './db-types'

export const supabaseClient: DatabaseClient = {
  // Users
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    return error ? null : data
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return error ? null : data
  },

  async getUserBySlug(slug: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('custom_slug', slug)
      .single()
    return error ? null : data
  },

  async createUser(user: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    return error ? null : data
  },

  async updateUser(id: string, userData: any) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single()
    return error ? null : data
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    return error ? [] : data || []
  },

  // User Settings
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    return error ? null : data
  },

  async createUserSettings(settings: any) {
    const { data, error } = await supabase
      .from('user_settings')
      .insert(settings)
      .select()
      .single()
    return error ? null : data
  },

  async updateUserSettings(userId: string, settingsData: any) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settingsData)
      .eq('user_id', userId)
      .select()
      .single()
    return error ? null : data
  },

  // Links
  async getLinks(userId?: string) {
    let query = supabase
      .from('links')
      .select('*, categories(name, icon)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    return error ? [] : data || []
  },

  async getLinkById(id: string) {
    const { data, error } = await supabase
      .from('links')
      .select('*, categories(name, icon)')
      .eq('id', id)
      .single()
    return error ? null : data
  },

  async getLinkByShortCode(shortCode: string) {
    const { data, error } = await supabase
      .from('links')
      .select(`
        *,
        category:categories(id, name, icon)
      `)
      .eq('short_code', shortCode.toLowerCase())
      .single()

    if (error || !data) {
      return null
    }

    return {
      ...data,
      is_public: Boolean(data.is_public),
      is_active: Boolean(data.is_active)
    }
  },

  async isShortCodeExists(shortCode: string, excludeLinkId?: string) {
    let query = supabase
      .from('links')
      .select('id', { count: 'exact', head: true })
      .eq('short_code', shortCode.toLowerCase())

    if (excludeLinkId) {
      query = query.neq('id', excludeLinkId)
    }

    const { count, error } = await query

    return !error && (count || 0) > 0
  },

  async generateShortCode(length: number = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      let code = ''
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      const exists = await this.isShortCodeExists(code)
      if (!exists) {
        return code
      }

      attempts++
    }

    if (length < 10) {
      return this.generateShortCode(length + 1)
    }

    throw new Error('Gagal generate short code yang unik')
  },

  async createLink(link: any) {
    const { data, error } = await supabase
      .from('links')
      .insert({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        category_id: link.category_id,
        is_public: link.is_public,
        is_active: link.is_active ?? true,
        qr_code: link.qr_code,
        short_code: link.short_code,
        user_id: link.user_id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async updateLink(id: string, data: any, userId: string) {
    // Validasi tidak bisa hapus short code
    if (data.short_code === null || data.short_code === '') {
      const existing = await this.getLinkById(id)
      if (existing && existing.short_code) {
        throw new Error('Tidak bisa menghapus short code yang sudah ada')
      }
    }

    const updateData: any = {}
    const allowedFields = ['title', 'url', 'description', 'category_id', 'is_public', 'is_active', 'qr_code', 'short_code']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data: result, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return result
  },

  async deleteLink(id: string, userId: string) {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  },

  async incrementClickCount(id: string) {
    // Use RPC function for thread-safe increment
    const { error } = await supabase.rpc('increment_click_count', { link_id: id })
    if (error) throw error
  },

  async getPageCountForLink(linkId: string): Promise<number> {
    const { count, error } = await supabase
      .from('public_page_links')
      .select('*', { count: 'exact', head: true })
      .eq('link_id', linkId)
    if (error) throw error
    return count || 0
  },

  // Categories
  async getCategories(userId?: string) {
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    return error ? [] : data || []
  },

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    return error ? null : data
  },

  async createCategory(category: any) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()
    return error ? null : data
  },

  async updateCategory(id: string, categoryData: any, userId: string) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    return error ? null : data
  },

  async deleteCategory(id: string, userId: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  },

  // Admin
  async getAdminUsers() {
    // First get all admin user_ids
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')

    if (adminError || !adminData) {
      return []
    }

    const userIds = adminData.map(a => a.user_id)

    // Then get users by their IDs
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds)

    return error ? [] : data || []
  },

  async isAdminUser(userId: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single()
    return !error && !!data
  },

  // Admin Link Operations (no userId restriction)
  async adminGetAllLinks() {
    const { data, error } = await supabase
      .from('links')
      .select('*, categories(name, icon)')
      .order('created_at', { ascending: false })
    return error ? [] : data || []
  },

  async adminCreateLink(link: any) {
    const { data, error } = await supabase
      .from('links')
      .insert({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        category_id: link.category_id,
        is_public: link.is_public,
        is_active: link.is_active ?? true,
        qr_code: link.qr_code,
        short_code: link.short_code,
        user_id: link.user_id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async adminUpdateLink(id: string, data: any) {
    const updateData: any = {}
    const allowedFields = ['title', 'url', 'description', 'category_id', 'is_public', 'is_active', 'qr_code', 'short_code', 'user_id']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data: result, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return result
  },

  async adminDeleteLink(id: string) {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Admin User Management
  async getAllUsersWithAdminStatus(search?: string) {
    let query = supabase
      .from('users')
      .select(`
        *,
        admin_users (
          user_id
        )
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const { data: users, error } = await query

    if (error) {
      return []
    }

    // Add is_admin flag to each user
    return users.map(user => ({
      ...user,
      is_admin: !!(user.admin_users && user.admin_users.length > 0)
    }))
  },

  async createUserWithSettings(userData: any, isAdmin: boolean = false) {
    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        password_hash: userData.password_hash,
        display_name: userData.display_name,
        custom_slug: userData.custom_slug
      })
      .select()
      .single()

    if (userError) {
      throw userError
    }

    // Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        theme_color: '#3b82f6',
        show_categories: true
      })

    if (settingsError) {
      console.error('[db] Error creating user settings:', settingsError)
    }

    // Add to admin_users if needed
    if (isAdmin) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({ user_id: user.id })

      if (adminError) {
        console.error('[db] Error adding admin role:', adminError)
      }
    }

    return {
      ...user,
      is_admin: isAdmin
    }
  },

  async adminUpdateUser(id: string, userData: any, isAdmin?: boolean) {
    const updateData: any = {}
    const allowedFields = ['email', 'password_hash', 'display_name', 'custom_slug']

    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field]
      }
    }

    // Update user
    const { data: user, error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (userError) {
      throw userError
    }

    // Update admin status if provided
    if (isAdmin !== undefined) {
      if (isAdmin) {
        // Check if already admin
        const { data: existingAdmin } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', id)
          .single()

        if (!existingAdmin) {
          await supabase
            .from('admin_users')
            .insert({ user_id: id })
        }
      } else {
        await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', id)
      }
    }

    // Get updated admin status
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', id)
      .single()

    return {
      ...user,
      is_admin: !!adminCheck
    }
  },

  async adminDeleteUser(id: string) {
    // Delete from admin_users first
    await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', id)

    // Delete from users table (cascade will handle user_settings)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async setAdminStatus(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      // Check if already admin
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      if (!existingAdmin) {
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: userId })
        if (error) throw error
      }
    } else {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
    }
  },

  // Admin Category Operations (global categories without userId)
  async adminGetAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    return error ? [] : data || []
  },

  async adminCreateCategory(category: any) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        sort_order: category.sort_order || 0,
        user_id: null // Global category
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async adminUpdateCategory(id: string, categoryData: any) {
    const updateData: any = {}
    const allowedFields = ['name', 'icon', 'description', 'sort_order']

    for (const field of allowedFields) {
      if (categoryData[field] !== undefined) {
        updateData[field] = categoryData[field]
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async adminDeleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Public Pages
  async getPublicPages(userId: string) {
    const { data, error } = await supabase
      .from('public_pages')
      .select('*, public_page_links(link_id)')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((page: any) => ({
      ...page,
      link_count: page.public_page_links?.length || 0,
    }))
  },

  async getPublicPageById(id: string) {
    const { data, error } = await supabase
      .from('public_pages')
      .select('*')
      .eq('id', id)
      .single()
    return error ? null : data
  },

  async getPublicPageBySlug(slug: string) {
    const { data, error } = await supabase
      .from('public_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    return error ? null : data
  },

  async isSlugExists(slug: string, excludePageId?: string): Promise<boolean> {
    let query = supabase
      .from('public_pages')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug)

    if (excludePageId) {
      query = query.neq('id', excludePageId)
    }

    const { count, error } = await query
    if (error) throw error
    return (count || 0) > 0
  },

  async createPublicPage(page: any) {
    const { data, error } = await supabase
      .from('public_pages')
      .insert({
        id: page.id,
        user_id: page.user_id,
        slug: page.slug,
        title: page.title,
        description: page.description || null,
        logo_url: page.logo_url || null,
        theme_color: page.theme_color || '#3b82f6',
        layout_style: page.layout_style || 'list',
        show_categories: page.show_categories !== undefined ? page.show_categories : true,
        is_active: page.is_active !== undefined ? page.is_active : true,
        sort_order: page.sort_order || 0
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updatePublicPage(id: string, data: any, userId: string) {
    const updateData: any = {}
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url
    if (data.theme_color !== undefined) updateData.theme_color = data.theme_color
    if (data.layout_style !== undefined) updateData.layout_style = data.layout_style
    if (data.show_categories !== undefined) updateData.show_categories = data.show_categories
    if (data.is_active !== undefined) updateData.is_active = data.is_active
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order

    const { data: result, error } = await supabase
      .from('public_pages')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return result
  },

  async deletePublicPage(id: string, userId: string) {
    const { error } = await supabase
      .from('public_pages')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  },

  async getPublicPageLinks(pageId: string) {
    const { data, error } = await supabase
      .from('public_page_links')
      .select(`
        sort_order,
        links (*, categories (id, name, icon))
      `)
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return (data || []).map((item: any) => ({
      ...item.links,
      category: item.links?.categories || null,
      page_sort_order: item.sort_order
    }))
  },

  async setPublicPageLinks(pageId: string, linkIds: string[]) {
    // Remove existing links
    await supabase.from('public_page_links').delete().eq('page_id', pageId)

    // Insert new links
    if (linkIds.length > 0) {
      const inserts = linkIds.map((linkId, i) => ({
        page_id: pageId,
        link_id: linkId,
        sort_order: i
      }))
      const { error } = await supabase.from('public_page_links').insert(inserts)
      if (error) throw error
    }
  },

  async incrementPageClickCount(pageId: string) {
    const { error } = await supabase.rpc('increment_public_page_clicks', { page_id: pageId })
    if (error) {
      // Fallback: fetch current count and update
      const { data } = await supabase
        .from('public_pages')
        .select('click_count')
        .eq('id', pageId)
        .single()
      if (data) {
        await supabase
          .from('public_pages')
          .update({ click_count: (data.click_count || 0) + 1 })
          .eq('id', pageId)
      }
    }
  },

  // Stats
  async getUserStats(userId: string) {
    const [linksResult, categoriesResult, clicksResult, publicLinksResult] = await Promise.all([
      supabase.from('links').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('links').select('click_count').eq('user_id', userId),
      supabase.from('links').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_public', true)
    ])

    const totalClicks = clicksResult.data?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0

    return {
      totalLinks: linksResult.count || 0,
      totalCategories: categoriesResult.count || 0,
      totalClicks,
      publicLinks: publicLinksResult.count || 0
    }
  },

  async getPlatformStats() {
    const [usersResult, linksResult, categoriesResult, clicksResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('links').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('links').select('click_count')
    ])

    const totalClicks = clicksResult.data?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0

    return {
      totalUsers: usersResult.count || 0,
      totalLinks: linksResult.count || 0,
      totalClicks,
      totalCategories: categoriesResult.count || 0
    }
  },

  // Phase 1: Admin Quick Wins (Supabase)
  async suspendUser(userId: string) {
    await supabase.from('users').update({ is_suspended: true }).eq('id', userId)
  },

  async unsuspendUser(userId: string) {
    await supabase.from('users').update({ is_suspended: false }).eq('id', userId)
  },

  async bulkUserAction(userIds: string[], action: 'suspend' | 'unsuspend' | 'activate' | 'delete') {
    let success = 0
    let errors = 0
    for (const id of userIds) {
      try {
        if (action === 'suspend') await this.suspendUser(id)
        else if (action === 'unsuspend') await this.unsuspendUser(id)
        else if (action === 'activate') await supabase.from('users').update({ is_suspended: false }).eq('id', id)
        else if (action === 'delete') await this.adminDeleteUser(id)
        success++
      } catch { errors++ }
    }
    return { success, errors }
  },

  async getAllPublicPages() {
    const { data } = await supabase.from('public_pages').select('*, users(email, display_name)').order('created_at', { ascending: false })
    return data || []
  },

  async getTopLinksByClicks(limit: number = 10) {
    const { data } = await supabase
      .from('links')
      .select('*, users(email, display_name), categories(name)')
      .order('click_count', { ascending: false })
      .limit(limit)
    return data || []
  },

  async exportLinksAsCSV() {
    const { data } = await supabase.from('links').select('*, users(email, display_name), categories(name)').order('created_at', { ascending: false })
    const header = 'ID,Title,URL,Description,Short Code,Clicks,Public,Active,Created At,User Email,User Name,Category\n'
    const escapeCsv = (v: any) => v ? `"${String(v).replace(/"/g, '""')}"` : ''
    const body = (data || []).map((r: any) =>
      [r.id, r.title, r.url, r.description, r.short_code, r.click_count,
       r.is_public ? 1 : 0, r.is_active ? 1 : 0, r.created_at,
       r.users?.email, r.users?.display_name, r.categories?.name].map(escapeCsv).join(',')
    ).join('\n')
    return header + body
  },

  async exportUsersAsCSV() {
    const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    const header = 'ID,Email,Display Name,Custom Slug,Created At,Suspended,Failed Logins,Is Admin\n'
    const escapeCsv = (v: any) => v ? `"${String(v).replace(/"/g, '""')}"` : ''
    const rows: any[] = []
    for (const u of (users || [])) {
      const [{ count: linkCount }, { count: pageCount }, { data: adminData }] = await Promise.all([
        supabase.from('links').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
        supabase.from('public_pages').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
        supabase.from('admin_users').select('user_id').eq('user_id', u.id)
      ])
      rows.push({ ...u, link_count: linkCount || 0, page_count: pageCount || 0, is_admin: adminData?.length ? 1 : 0 })
    }
    const body = rows.map(r =>
      [r.id, r.email, r.display_name, r.custom_slug, r.created_at,
       r.is_suspended ? 1 : 0, r.failed_login_count || 0, r.is_admin].map(escapeCsv).join(',')
    ).join('\n')
    return header + body
  },

  async trackFailedLogin(userId: string) {
    const { data } = await supabase.from('users').select('failed_login_count').eq('id', userId).single()
    const count = (data?.failed_login_count || 0) + 1
    const locked = count >= 5
    const lockedUntil = locked ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
    await supabase.from('users').update({
      failed_login_count: count,
      last_failed_login: new Date().toISOString(),
      ...(locked && { locked_until: lockedUntil })
    }).eq('id', userId)
    return { locked, failedCount: count }
  },

  async resetFailedLogin(userId: string) {
    await supabase.from('users').update({
      failed_login_count: 0,
      last_failed_login: null,
      locked_until: null
    }).eq('id', userId)
  },

  async getAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    return data || []
  },

  async getActiveAnnouncements() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })
    return data || []
  },

  async createAnnouncement(announcement: any) {
    const { data, error } = await supabase.from('announcements').insert({
      id: announcement.id,
      title: announcement.title,
      message: announcement.message,
      is_active: announcement.is_active,
      expires_at: announcement.expires_at || null
    }).select().single()
    if (error) throw error
    return data
  },

  async updateAnnouncement(id: string, data: any) {
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.message !== undefined) updateData.message = data.message
    if (data.is_active !== undefined) updateData.is_active = data.is_active
    if (data.expires_at !== undefined) updateData.expires_at = data.expires_at || null
    const { data: result, error } = await supabase.from('announcements').update(updateData).eq('id', id).select().single()
    if (error) throw error
    return result
  },

  async deleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id)
  },

  async toggleMaintenanceMode(enabled: boolean) {
    if (!supabase) return
    if (enabled) {
      await supabase.from('platform_settings').upsert({ key: 'maintenance_mode', value: 'true' })
    } else {
      await supabase.from('platform_settings').delete().eq('key', 'maintenance_mode')
    }
  },

  async isMaintenanceMode() {
    if (!supabase) return false
    const { data } = await supabase.from('platform_settings').select('value').eq('key', 'maintenance_mode').single()
    return data?.value === 'true'
  },

  // Audit Logs (Supabase stubs - not implemented for Supabase backend)
  async logAuditAction(_params: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    // Stub: Audit logs only implemented for SQLite backend
    console.warn('[db-supabase] logAuditAction not implemented for Supabase backend')
  },

  async getAuditLogs(_params: {
    userId?: string;
    entityType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: any[]; total: number }> {
    // Stub: Audit logs only implemented for SQLite backend
    console.warn('[db-supabase] getAuditLogs not implemented for Supabase backend')
    return { logs: [], total: 0 }
  },

  async getAuditStats(_days: number = 7): Promise<{
    totalActions: number;
    actionsByType: Array<{ action: string; count: number }>;
    topUsers: Array<{ userId: string; email: string; count: number }>;
  }> {
    // Stub: Audit logs only implemented for SQLite backend
    console.warn('[db-supabase] getAuditStats not implemented for Supabase backend')
    return { totalActions: 0, actionsByType: [], topUsers: [] }
  }
}
