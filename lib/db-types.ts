// Database Abstraction Layer Types
// This interface allows switching between different database implementations

export interface PublicPage {
  id: string
  user_id: string
  slug: string
  title: string
  description: string | null
  logo_url: string | null
  theme_color: string
  layout_style: string
  show_categories: boolean
  is_active: boolean
  sort_order: number
  click_count: number
  created_at: string
  updated_at: string
}

export interface PublicPageLink {
  id: string
  page_id: string
  link_id: string
  sort_order: number
  created_at: string
}

export interface DatabaseClient {
  // Users
  getUserByEmail(email: string): Promise<any | null>
  getUserById(id: string): Promise<any | null>
  getUserBySlug(slug: string): Promise<any | null>
  createUser(user: any): Promise<any>
  updateUser(id: string, data: any): Promise<any>
  deleteUser(id: string): Promise<void>
  getAllUsers(): Promise<any[]>

  // User Settings
  getUserSettings(userId: string): Promise<any | null>
  createUserSettings(settings: any): Promise<any>
  updateUserSettings(userId: string, data: any): Promise<any>

  // Links
  getLinks(userId?: string): Promise<any[]>
  getLinkById(id: string): Promise<any | null>
  createLink(link: any): Promise<any>
  updateLink(id: string, data: any, userId: string): Promise<any>
  deleteLink(id: string, userId: string): Promise<void>
  incrementClickCount(id: string): Promise<void>
  getPageCountForLink(linkId: string): Promise<number>

  // Short code operations
  getLinkByShortCode(shortCode: string): Promise<any | null>
  isShortCodeExists(shortCode: string, excludeLinkId?: string): Promise<boolean>
  generateShortCode(length?: number): Promise<string>

  // Categories
  getCategories(userId?: string): Promise<any[]>
  getCategoryById(id: string): Promise<any | null>
  createCategory(category: any): Promise<any>
  updateCategory(id: string, data: any, userId: string): Promise<any>
  deleteCategory(id: string, userId: string): Promise<void>

  // Public Pages
  getPublicPages(userId: string): Promise<any[]>
  getPublicPageById(id: string): Promise<any | null>
  getPublicPageBySlug(slug: string): Promise<any | null>
  isSlugExists(slug: string, excludePageId?: string): Promise<boolean>
  createPublicPage(page: any): Promise<any>
  updatePublicPage(id: string, data: any, userId: string): Promise<any>
  deletePublicPage(id: string, userId: string): Promise<void>
  getPublicPageLinks(pageId: string): Promise<any[]>
  setPublicPageLinks(pageId: string, linkIds: string[]): Promise<void>
  incrementPageClickCount(pageId: string): Promise<void>

  // Admin
  getAdminUsers(): Promise<any[]>
  isAdminUser(userId: string): Promise<boolean>

  // Admin User Management (with admin status)
  getAllUsersWithAdminStatus(search?: string): Promise<any[]>
  createUserWithSettings(userData: any, isAdmin?: boolean): Promise<any>
  adminUpdateUser(id: string, data: any, isAdmin?: boolean): Promise<any>
  adminDeleteUser(id: string): Promise<void>
  setAdminStatus(userId: string, isAdmin: boolean): Promise<void>

  // Admin Link Operations (no userId restriction)
  adminGetAllLinks(): Promise<any[]>
  adminCreateLink(link: any): Promise<any>
  adminUpdateLink(id: string, data: any): Promise<any>
  adminDeleteLink(id: string): Promise<void>

  // Admin Category Operations (global categories without userId)
  adminGetAllCategories(): Promise<any[]>
  adminCreateCategory(category: any): Promise<any>
  adminUpdateCategory(id: string, data: any): Promise<any>
  adminDeleteCategory(id: string): Promise<void>

  // Stats
  getUserStats(userId: string): Promise<any>
  getPlatformStats(): Promise<any>

  // Phase 1: Admin Quick Wins
  suspendUser(userId: string): Promise<void>
  unsuspendUser(userId: string): Promise<void>
  bulkUserAction(userIds: string[], action: 'suspend' | 'unsuspend' | 'activate' | 'delete'): Promise<{ success: number; errors: number }>
  getAllPublicPages(): Promise<any[]>
  getTopLinksByClicks(limit?: number): Promise<any[]>
  exportLinksAsCSV(): Promise<string>
  exportUsersAsCSV(): Promise<string>
  trackFailedLogin(userId: string): Promise<{ locked: boolean; failedCount: number }>
  resetFailedLogin(userId: string): Promise<void>
  getAnnouncements(): Promise<any[]>
  getActiveAnnouncements(): Promise<any[]>
  createAnnouncement(announcement: any): Promise<any>
  updateAnnouncement(id: string, data: any): Promise<any>
  deleteAnnouncement(id: string): Promise<void>
  toggleMaintenanceMode(enabled: boolean): Promise<void>
  isMaintenanceMode(): Promise<boolean>
}

export type { Category, Link, User, UserSettings, Admin } from './supabase'
