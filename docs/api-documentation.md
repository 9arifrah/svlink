# SVLink — Backend API Documentation

> **Generated:** 2025-04-20
> **Purpose:** Reference for frontend redesign
> **Base URL:** `http://localhost:3000` (dev) / `https://svlink.id` (prod)
> **Framework:** Next.js 15 App Router — API Routes
> **Auth:** JWT cookie-based session (`svlink_session` cookie)
> **DB:** SQLite (better-sqlite3) local / Supabase production
> **Validation:** Zod schemas in `lib/validation.ts`
> **Total Endpoints:** 27

---

## Table of Contents

- [Authentication Flow](#authentication-flow)
- [Data Models](#data-models)
- [Auth Endpoints](#auth-endpoints)
- [Links Endpoints](#links-endpoints)
- [Categories Endpoints](#categories-endpoints)
- [Pages Endpoints](#pages-endpoints)
- [User Endpoints](#user-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Utility Endpoints](#utility-endpoints)
- [Public Page Rendering](#public-page-rendering)
- [Error Response Format](#error-response-format)
- [Rate Limiting](#rate-limiting)

---

## Authentication Flow

### Session Management
- **User cookie name:** `user_session`
- **Admin cookie name:** `admin_session`
- **Type:** JWT (jose library, HS256)
- **Duration:** 7 days (default) / 30 days (remember me)
- **HttpOnly:** Yes
- **SameSite:** Lax
- **Secure:** Yes (production)

### JWT Payload
```typescript
interface SessionPayload {
  userId: string;   // UUID v4
  isAdmin: boolean; // true if user is in admin_users table
  iat: number;
  exp: number;
}
```

### Auth Middleware Pattern
```typescript
// User endpoints
const session = await getUserSession();  // reads 'user_session' cookie
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const userId = session.userId;

// Admin endpoints
const session = await getVerifiedAdminSession();  // reads 'admin_session' + DB check
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
// getVerifiedAdminSession() = getAdminSession() + db.isAdminUser(userId)
```

### Admin Auth Architecture
- **Admin users are regular users** added to `admin_users` junction table
- No separate admin credentials — admin login uses the same `users` table
- `getVerifiedAdminSession()` verifies JWT + checks `admin_users` table in DB
- Admin login returns same error message for wrong password AND non-admin user (prevents enumeration)

---

## Data Models

### Link
```typescript
interface Link {
  id: string;              // UUID v4
  user_id: string;         // UUID v4, foreign key to users
  title: string;           // Required, max 200 chars
  url: string;             // Required, valid URL
  description: string | null;
  short_code: string | null; // 6-char alphanumeric, unique globally
  is_public: boolean;      // default: true
  is_active: boolean;      // default: true
  click_count: number;     // default: 0
  qr_code: string | null;  // base64 data URL
  category_id: string | null; // foreign key to categories
  created_at: string;      // ISO datetime
  updated_at: string;      // ISO datetime
}
```

### Category
```typescript
interface Category {
  id: string;              // UUID v4
  user_id: string;         // UUID v4
  name: string;            // Required, max 100 chars
  icon: string;            // Lucide icon name, default: 'link'
  sort_order: number;      // default: 0
  created_at: string;
}
```

### Public Page
```typescript
interface PublicPage {
  id: string;              // UUID v4
  user_id: string;         // UUID v4
  slug: string;            // Required, unique, min 3 chars, [a-z0-9-]
  title: string;           // Required, max 200 chars
  description: string | null;
  logo_url: string | null; // Image URL
  theme_color: string | null; // Hex color, default: #3b82f6
  layout_style: string | null; // 'list' | 'grid' | 'compact'
  show_categories: boolean; // default: false
  is_active: boolean;      // default: true
  click_count: number;     // default: 0
  link_count: number;      // computed (COUNT from public_page_links)
  sort_order: number;      // default: 0
  created_at: string;
  updated_at: string;
}
```

### User
```typescript
interface User {
  id: string;              // UUID v4
  email: string;           // Required, unique
  password_hash: string;   // bcrypt, cost 10
  display_name: string;    // Required, min 2 chars
  custom_slug: string | null; // deprecated (multi-page feature)
  // NOTE: No is_admin column — admin status is via admin_users junction table
  created_at: string;
}
```

### User Settings
```typescript
interface UserSettings {
  id: string;              // UUID v4
  user_id: string;         // UUID v4, unique
  theme_color: string;     // default: '#3b82f6'
  logo_url: string | null;
  page_title: string | null;
  show_categories: boolean; // default: 1 (true)
  profile_description: string | null;
  layout_style: string;    // default: 'list'
  created_at: string;
  updated_at: string;
}
```

---

## Auth Endpoints

### POST `/api/auth/register`

Create a new user account. No auto-create of public page (multi-page feature).

**Rate Limit:** 10 attempts per hour per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "displayName": "John Doe"
}
```

**Validation (registerSchema):**
- `email`: valid email format
- `password`: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
- `displayName`: optional, defaults to email prefix

**Response 200 — Email Already Exists (masked):**
```json
{ "error": "Jika email terdaftar, silakan cek inbox Anda" }
```

**Response 200 — Success:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe"
  }
}
```
_Does NOT set session cookie. User must login separately after registering._

**Response 400 — Validation Error:**
```json
{ "error": "Password harus mengandung minimal 1 huruf kapital" }
```

---

### POST `/api/auth/login`

Authenticate user with email/password.

**Rate Limit:** 5 attempts per minute per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "rememberMe": false
}
```

**Response 200 — Success:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "custom_slug": null
  }
}
```
_Sets `user_session` cookie (7 or 30 days)._

**Response 401:**
```json
{ "error": "Email atau password salah" }
```

---

### POST `/api/auth/logout`

Destroy user session.

**Response 200:**
```json
{ "success": true }
```
_Clears `svlink_session` cookie._

---

## Links Endpoints

**Auth:** User session required for all endpoints.

### GET `/api/links`

Get all links for the authenticated user.

**Query Parameters:** None

**Response 200:**
```json
{
  "links": [
    {
      "id": "uuid",
      "title": "My Link",
      "url": "https://example.com",
      "description": "Optional description",
      "short_code": "abc123",
      "is_public": true,
      "is_active": true,
      "click_count": 42,
      "qr_code": "data:image/png;base64,...",
      "category_id": "uuid|null",
      "user_id": "uuid",
      "created_at": "2025-04-20T...",
      "updated_at": "2025-04-20T..."
    }
  ]
}
```

---

### POST `/api/links`

Create a new link. Auto-generates short code and QR code.

**Request Body:**
```json
{
  "title": "My Link",
  "url": "https://example.com",
  "description": "Optional description",
  "category_id": "uuid|null",
  "is_public": true,
  "is_active": true,
  "short_code": "custom-code"
}
```

**Validation (linkSchema):**
- `title`: required, max 200 chars
- `url`: required, valid URL
- `short_code`: optional, 3-20 chars, alphanumeric + hyphens, globally unique
- `description`: optional
- `category_id`: optional, must exist for user
- `is_public`: optional, default true
- `is_active`: optional, default true

**Response 201 — Success:**
```json
{
  "link": { /* full Link object */ }
}
```

**Response 409 — Short Code Taken:**
```json
{ "error": "Short code sudah digunakan" }
```

---

### GET `/api/links/[id]`

Check how many public pages a link is used in.

**Response 200:**
```json
{
  "pageCount": 3,
  "linkTitle": "My Link"
}
```

**Response 403 — Not Owner:**
```json
{ "error": "Forbidden" }
```

---

### PATCH `/api/links/[id]`

Update an existing link. All fields optional.

**Request Body (partial):**
```json
{
  "title": "Updated Title",
  "url": "https://new-url.com",
  "description": "New description",
  "category_id": "uuid|null",
  "is_public": true,
  "is_active": false,
  "short_code": "new-code"
}
```

**Note:** Form switch components send `"on"` / `"off"` / `""` — API converts to boolean.

**QR code:** Auto-regenerated if `url` changes.

**Response 200:**
```json
{ "link": { /* updated Link object */ } }
```

**Response 409:**
```json
{ "error": "Short code sudah digunakan" }
```

---

### DELETE `/api/links/[id]`

Delete a link. Also removes from all `public_page_links`.

**Response 200:**
```json
{ "success": true }
```

---

### GET `/api/links/check-short-code`

Validate if a custom short code is available.

**Query:** `?shortCode=my-code`

**Response 200:**
```json
{ "available": true }
// or
{ "available": false, "message": "Short code sudah digunakan" }
```

---

### POST `/api/links/generate-short-code`

Generate a unique random short code.

**Response 200:**
```json
{ "short_code": "xK9mP2" }
```

---

## Categories Endpoints

**Auth:** User session required.

### POST `/api/categories`

Create a new category.

**Request Body:**
```json
{
  "name": "Social Media",
  "icon": "twitter",
  "sort_order": 0
}
```

**Validation (categorySchema):**
- `name`: required, max 100 chars
- `icon`: optional, Lucide icon name, default "link"

**Response 201:**
```json
{
  "category": {
    "id": "uuid",
    "name": "Social Media",
    "icon": "twitter",
    "sort_order": 0,
    "user_id": "uuid"
  }
}
```

---

### PATCH `/api/categories/[id]`

Update a category.

**Request Body:**
```json
{
  "name": "Updated Name",
  "icon": "facebook"
}
```

**Response 200:**
```json
{ "category": { /* updated Category */ } }
```

---

### DELETE `/api/categories/[id]`

Delete a category. Links in this category get `category_id` set to null.

**Response 200:**
```json
{ "success": true }
```

---

## Pages Endpoints

**Auth:** User session required.
**Feature:** Multi-page — 1 user can have N public pages.

### GET `/api/pages`

Get all public pages for the authenticated user.

**Response 200:**
```json
{
  "pages": [
    {
      "id": "uuid",
      "slug": "my-page",
      "title": "My Page",
      "description": "Optional",
      "logo_url": null,
      "theme_color": "#3b82f6",
      "layout_style": "list",
      "show_categories": false,
      "is_active": true,
      "click_count": 42,
      "link_count": 5,
      "sort_order": 0,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

### POST `/api/pages`

Create a new public page.

**Request Body:**
```json
{
  "slug": "my-page",
  "title": "My Page",
  "description": "Optional description",
  "logo_url": null,
  "theme_color": "#3b82f6",
  "layout_style": "list",
  "show_categories": false,
  "link_ids": ["uuid1", "uuid2"]
}
```

**Validation:**
- `slug`: required, min 3 chars, `[a-z0-9-]`, globally unique
- `title`: required
- `description`: optional
- `logo_url`: optional, URL string
- `theme_color`: optional, hex color
- `layout_style`: optional, `"list"` | `"grid"` | `"compact"`
- `show_categories`: optional, default false
- `link_ids`: optional, array of link UUIDs

**Reserved Slugs:** `dashboard`, `login`, `register`, `admin`, `api`, `auth`, `user`, `users`, `settings`, `categories`, `links`, `track-click`, `public`, `profile`

**Response 201:**
```json
{
  "page": { /* full PublicPage object */ }
}
```

**Response 409:**
```json
{ "error": "Slug sudah digunakan, silakan pilih yang lain" }
```

---

### GET `/api/pages/[id]`

Get a single page with its links.

**Response 200:**
```json
{
  "page": { /* PublicPage object */ },
  "links": [
    { /* Link objects selected for this page, ordered by sort_order */ }
  ]
}
```

---

### PATCH `/api/pages/[id]`

Update a page. All fields optional.

**Request Body:**
```json
{
  "slug": "new-slug",
  "title": "New Title",
  "description": "...",
  "logo_url": "...",
  "theme_color": "#ef4444",
  "layout_style": "grid",
  "show_categories": true,
  "is_active": false
}
```

**Response 200:**
```json
{ "page": { /* updated PublicPage */ } }
```

---

### DELETE `/api/pages/[id]`

Delete a public page. Links are NOT deleted (only junction table entries).

**Response 200:**
```json
{ "success": true }
```

---

### PUT `/api/pages/[id]/links`

Replace all links for a page (bulk set).

**Request Body:**
```json
{
  "link_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response 200:**
```json
{ "success": true }
```

---

### GET `/api/pages/check-slug`

Real-time slug availability check.

**Query:** `?slug=my-page&exclude=page-id`

**Response 200:**
```json
{ "available": true }
// or
{ "available": false, "message": "Slug sudah digunakan", "suggestions": ["my-page-2", "my-slug", "my-page-xxxx"] }
```

---

## User Endpoints

**Auth:** User session required.

### GET `/api/user/settings`

Get user settings.

**Response 200:**
```json
{
  "settings": {
    "id": "uuid",
    "user_id": "uuid",
    "theme_color": null,
    "layout_style": null,
    "logo_url": null,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### PATCH `/api/user/settings`

Update user settings.

**Request Body:**
```json
{
  "theme_color": "#3b82f6",
  "layout_style": "list",
  "logo_url": "https://..."
}
```

**Response 200:**
```json
{ "settings": { /* updated UserSettings */ } }
```

---

### PATCH `/api/user/profile`

Update display name.

**Request Body:**
```json
{ "displayName": "New Name" }
```

**Response 200:**
```json
{ "success": true }
```

**Response 400:**
```json
{ "error": "Nama minimal 2 karakter" }
```

---

### POST `/api/user/password`

Change password.

**Request Body:**
```json
{
  "currentPassword": "OldPass1!",
  "newPassword": "NewPass1!"
}
```

**Response 200:**
```json
{ "success": true }
```

**Response 401:**
```json
{ "error": "Password lama salah" }
```

---

### DELETE `/api/user/account`

Delete user account (cascades: links, categories, pages, settings).

**Request Body:** None

**Response 200:**
```json
{ "success": true }
```

---

### GET `/api/user/stats`

Get dashboard statistics.

**Response 200:**
```json
{
  "stats": {
    "totalLinks": 42,
    "publicLinks": 38,
    "totalClicks": 1234,
    "totalCategories": 5
  }
}
```

**Note:** This endpoint returns only 4 basic stats. `clicksLast7Days`, `topLinks`, `recentLinks`, and `totalPages` are fetched via separate logic (e.g., `GET /api/links` for recent links).

---

## Admin Endpoints

**Auth:** `getVerifiedAdminSession()` required (JWT verification + `db.isAdminUser()` DB check).
**Note:** Admin users are regular users added to the `admin_users` junction table. Same `users` table, same password hash.

### POST `/api/admin/login`

Admin panel authentication. Uses the same `users` table — admin status is granted by adding the user to the `admin_users` table.

**Rate Limit:** 5 attempts per minute per IP

**Request Body:**
```json
{
  "email": "admin@svlink.id",
  "password": "AdminPass1!"
}
```

**Flow:**
1. Look up user in `users` table
2. Verify password with bcrypt
3. Check `db.isAdminUser(userId)` — checks `admin_users` table
4. If not admin → returns same "Email atau password salah" error (prevents enumeration)
5. If admin → sets `admin_session` cookie via `setAdminSession()`

**Response 200:**
```json
{
  "success": true,
  "admin": {
    "id": "uuid",
    "email": "admin@svlink.id",
    "display_name": "Admin"
  }
}
```
_Sets `admin_session` cookie (7 days)._

---

### POST `/api/admin/logout`

**Response 200:**
```json
{ "success": true }
```

---

### GET `/api/admin/links`

Get all links across all users (admin view).

**Query:** `?page=1&limit=20&search=keyword`

**Response 200:**
```json
{
  "links": [ /* all Link objects with user info */ ],
  "total": 1000,
  "page": 1
}
```

---

### POST `/api/admin/links`

Admin creates link for any user.

**Request Body:**
```json
{
  "user_id": "uuid",
  "title": "Link Title",
  "url": "https://...",
  "short_code": "code"
}
```

---

### PUT `/api/admin/links`

Admin updates any link.

**Request Body:**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "url": "https://...",
  "is_active": true,
  "is_public": true
}
```

---

### DELETE `/api/admin/links`

Admin deletes any link.

**Request Body:**
```json
{ "id": "uuid" }
```

---

### GET `/api/admin/categories`

Get all categories across all users.

---

### POST / PUT / DELETE `/api/admin/categories`

Admin CRUD for categories (similar to user endpoints but cross-user).

---

### GET `/api/admin/users`

Get all users with pagination.

**Query:** `?search=keyword`

**Response 200:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "John",
      "custom_slug": null,
      "is_admin": false,
      "link_count": 5,
      "created_at": "..."
    }
  ]
}
```

---

### POST `/api/admin/users`

Create a new user (admin).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass1!",
  "display_name": "New User",
  "custom_slug": null,
  "is_admin": false
}
```

**Note:** `is_admin` is NOT a column in `users` table — it's used to add/remove the user from `admin_users` junction table.

---

### PUT `/api/admin/users/[id]`

Update any user.

**Request Body:**
```json
{
  "email": "updated@example.com",
  "password": "NewPass1!",
  "display_name": "Updated Name",
  "custom_slug": null,
  "is_admin": true
}
```

**Note:** Password is optional — only hashed and updated if provided. `is_admin` adds/removes from `admin_users` table.

---

### DELETE `/api/admin/users/[id]`

Delete any user (cascades all their data).

---

### POST `/api/admin/backfill`

Batch operation to generate missing short codes and QR codes.

**Request Body:**
```json
{ "type": "all" }
```

**Response 200:**
```json
{
  "success": true,
  "totalLinks": 500,
  "shortCodesGenerated": 12,
  "qrCodesGenerated": 5,
  "errors": []
}
```

---

## Utility Endpoints

### POST `/api/track-click`

Increment link click count (public, no auth required).

**Request Body:**
```json
{ "linkId": "uuid" }
```

**Response 200:**
```json
{ "success": true }
```

---

### POST `/api/upload-logo`

Upload a logo file (multipart/form-data).

**Request:** Multipart form with `file` field.
- **Allowed types:** PNG, JPG, GIF, WebP
- **Max size:** 500KB
- **Storage:** `/public/uploads/logos/` (local) or Supabase Storage (prod)

**Response 200:**
```json
{ "url": "/uploads/logos/filename.png" }
```

### DELETE `/api/upload-logo`

Delete an uploaded logo.

**Request Body:**
```json
{ "url": "/uploads/logos/filename.png" }
```

---

## Public Page Rendering

### GET `/[slug]`

Render a public page. No auth required.

**Logic:**
1. Check if `slug` matches a link's `short_code` → redirect to URL + increment click count
2. If not, look up `public_pages` WHERE `slug = ? AND is_active = 1`
3. If found → render page with theme, layout, links
4. If not found → 404

**Server-side rendering** with `generateMetadata()` for SEO:
- `title`: page.title
- `description`: page.description
- `og:image`: page.logo_url

**Click Tracking:** `incrementPageClickCount(pageId)` called on page view.

---

## Error Response Format

### Standard Error
```json
{ "error": "Human-readable error message" }
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login, register, stats |
| 201 | Created | POST link, POST page, POST category |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | No session or invalid session |
| 403 | Forbidden | Session valid but not owner |
| 404 | Not Found | Page/link/user doesn't exist |
| 409 | Conflict | Duplicate slug or short code |
| 500 | Internal Server Error | DB error, unexpected exception |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 attempts | 1 minute |
| `/api/auth/register` | 10 attempts | 1 hour |
| `/api/admin/login` | 5 attempts | 1 minute |
| Other endpoints | No rate limit | — |

**Implementation:** `lib/rate-limit.ts` — IP-based, stored in memory Map.

---

## Key Libraries

| Library | Purpose |
|---------|---------|
| `bcryptjs` | Password hashing (cost 10) |
| `jose` | JWT session tokens (SignJWT, jwtVerify) |
| `zod` | Request validation |
| `better-sqlite3` | Local SQLite database |
| `@supabase/supabase-js` | Production Supabase client |
| `qrcode` | QR code generation (base64) |

---

## Database Tables (Schema Reference)

```sql
-- Core tables
users (id, email, password_hash, display_name, custom_slug, created_at)
  -- NOTE: No is_admin column
user_settings (id, user_id UNIQUE, theme_color, logo_url, page_title, show_categories, profile_description, layout_style, created_at, updated_at)
links (id, user_id, title, url, description, short_code UNIQUE, is_public, is_active, click_count, qr_code, category_id, created_at, updated_at)
categories (id, user_id, name, icon, sort_order, created_at)

-- Multi-page tables
public_pages (id, user_id, slug UNIQUE, title, description, logo_url, theme_color, layout_style, show_categories, is_active, click_count, sort_order, created_at, updated_at)
public_page_links (id, page_id, link_id, sort_order, UNIQUE(page_id, link_id), created_at)
  -- NOTE: Has separate id column as PRIMARY KEY, plus UNIQUE constraint on (page_id, link_id)

-- Admin table (junction table, NOT separate credentials)
admin_users (user_id UNIQUE, created_at)
  -- user_id references users(id) ON DELETE CASCADE
  -- Being in this table = admin status (checked via db.isAdminUser())
```

---

## Notes for Frontend Redesign

1. **Session is cookie-based** — no need for Authorization headers. Browser handles it automatically.
2. **Cookie names:** `user_session` (user) and `admin_session` (admin). NOT `svlink_session`.
3. **All user endpoints require `getUserSession()`** — returns `{ userId, isAdmin }` or `null`.
4. **Admin endpoints use `getVerifiedAdminSession()`** — verifies JWT + checks `admin_users` table via `db.isAdminUser()`.
5. **Admin users are regular users** in the `users` table, plus a row in `admin_users` junction table. No separate admin credentials.
6. **Short codes are globally unique** — not per-user. Use `generate-short-code` endpoint or let the API auto-generate.
7. **QR codes are base64 data URLs** stored in the database — no external storage needed.
8. **Page slugs are globally unique** — checked against reserved list and all existing pages.
9. **Link deletion cascades** from `public_page_links` — links removed from pages are not deleted from master list.
10. **`GET /api/links/[id]`** returns page usage count for the delete confirmation warning.
11. **Public page rendering** at `/[slug]` does double duty: short code redirect + page rendering.
12. **Admin and user sessions are separate cookies** — not interchangeable.
13. **Rate limiting** is in-memory — resets on server restart. For production, consider Redis-backed rate limiting.
14. **`user_settings`** has more columns than expected: `page_title`, `show_categories`, `profile_description`, `layout_style` (with defaults).
15. **`public_page_links`** has its own `id` column as PRIMARY KEY plus `UNIQUE(page_id, link_id)` constraint.
