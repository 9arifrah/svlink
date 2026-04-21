# AGENTS.md - svlink

Platform manajemen link dengan Next.js 15, dual database support (SQLite/Supabase), dan custom JWT auth.

## Quick Commands

```bash
npm run dev              # Start dev server
npm run build            # Build (TypeScript errors will FAIL build)
npm run lint             # ESLint
npm run migrate:sqlite   # Add QR code column to SQLite
npm run migrate:shortener # Add short_code column to SQLite
```

**Critical:** `next.config.mjs` has `ignoreBuildErrors: false` - TypeScript errors will cause build failures.

## Architecture Overview

### Dual Database Support

Database switching via `DB_TYPE` environment variable:

```
lib/
├── db.ts           # Entry point - switches via DB_TYPE
├── db-types.ts     # DatabaseClient interface
├── db-sqlite.ts    # SQLite implementation (better-sqlite3)
└── db-supabase.ts  # Supabase implementation
```

**Environment:**
```bash
DB_TYPE=sqlite  # or 'supabase' for production
```

### Custom JWT Authentication (NOT Supabase Auth)

- Cookie-based sessions: `user_session` and `admin_session` cookies
- Passwords hashed with bcryptjs (10 salt rounds)
- 7-day expiry, httpOnly cookies
- JWT library: `jose` (SignJWT, jwtVerify) — NOT jsonwebtoken
- Admin auth via `admin_users` junction table (not a column in users)

**Key files:**
- `lib/auth.ts` - JWT session management (getUserSession, setUserSession, getAdminSession, setAdminSession)
- `lib/admin-auth.ts` - Admin verification helpers (getVerifiedAdminSession, verifyAdminAccess)
- `app/api/auth/login/route.ts` - User login
- `app/api/admin/login/route.ts` - Admin login (uses getVerifiedAdminSession)

**Session payload:**
```typescript
interface SessionPayload {
  userId: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}
```

### Critical Routing Quirk: `/[slug]` Dual Purpose

Route `app/[slug]/page.tsx` handles **TWO** cases in priority order:

1. **Short Code (Priority 1):** Check if slug is a short code → redirect to URL
2. **Public Page (Priority 2):** Check if slug is a public_page slug → render public page

```typescript
const link = await db.getLinkByShortCode(slug)
if (link) {
  await db.incrementClickCount(link.id)
  redirect(link.url, 302)
}

const page = await db.getPublicPageBySlug(slug)
if (page) {
  // Render public page with theme, layout, links
  // Page has: title, description, logo_url, theme_color, layout_style
}
```

**Important:** Public pages are rendered at `/{slug}` — no prefix. Each user can have N public pages with unique slugs (multi-page feature).

**NOTE:** User profile by `custom_slug` was removed. The multi-page feature replaced single-profile with multiple public pages per user.

## Component Patterns

- **Base:** shadcn/ui (Radix UI + Tailwind CSS)
- **Styling:** `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge)
- **Variants:** `class-variance-authority` for component variants
- **Refs:** `forwardRef` pattern for ref forwarding
- **Client components:** All interactive components use `'use client'`
- **Imports:** Use `@/*` path alias: `import { Button } from '@/components/ui/button'`

**Component organization:**
```
components/
├── ui/                   # 57 shadcn/ui primitives
├── auth/                 # Login/register forms (responsive)
├── user/                 # User dashboard components (all responsive)
│   ├── page-form.tsx            # Multi-page CRUD form (679 lines)
│   ├── pages-list.tsx           # Public pages list
│   ├── public-page-header.tsx   # Public page header
│   ├── dashboard-layout.tsx     # Layout with responsive padding
│   ├── mobile-bottom-nav.tsx    # 5 items: Home|Link|Pages|Kategori|Settings
│   ├── links-table.tsx
│   └── ...
├── admin/                # Admin dashboard (13 components, responsive)
└── shared/               # Icon picker (responsive), QR modal
```

**Quick Create Feature:**
- Located on `/dashboard` page
- Single button: "Quick Create" (creates both short link + QR code)
- Flow: Input Dialog → Submit → Result Modal (instant preview)
- Result modal shows: short link (with copy), QR code preview (with download), link details
- Uses `POST /api/links` which auto-generates both short code and QR code

### Responsive Design Patterns

**All 17 non-UI components have been audited and made responsive** (commit range `d44c57e..24c79e9`).

**Reference implementations:**
- `components/user/dashboard-sidebar.tsx` - Full-height sticky sidebar
- `components/user/quick-create-result-modal.tsx` - Responsive modal with overflow handling
- `components/user/page-form.tsx` - Largest component (679 lines), fully responsive across 4 tabs
- `components/ui/card.tsx` - Card primitives with responsive padding (`p-4 sm:p-6`)

**Responsive audit report:** `docs/responsive-audit-report.md`
**Responsive fix plan:** `docs/plans/responsive-fix.md`
**Git checkpoint:** `v1.0.0-responsive-audit` (rollback point)

**Modal/Dialog Components:**
```tsx
// Width: mobile-first with max-width constraint
className="max-w-[95vw] sm:max-w-[520px]"

// Height and scroll: prevent overflow on small screens
className="max-h-[90vh] overflow-y-auto overflow-x-hidden"

// Padding: responsive spacing
className="p-4 sm:p-6"
```

**Text Overflow Handling:**
```tsx
// For URLs and long text - prevent horizontal overflow
<div className="overflow-hidden">
  <p className="truncate">{longUrl}</p>
</div>

// For titles - allow word wrap
<p className="break-words">{title}</p>
```

**Buttons:**
```tsx
// Full width on mobile, auto on desktop
className="w-full sm:w-auto"

// Layout: stack on mobile, horizontal on desktop
className="flex flex-col-reverse sm:flex-row gap-3"
```

**Sidebar Components:**
```tsx
// Full height with sticky positioning
className="h-screen sticky top-0 flex flex-col"

// Navigation fills remaining space with scroll
<nav className="flex-1 overflow-y-auto">
```

## Database Schema

| Table | Columns |
|-------|---------|
| `users` | id, email, password_hash, custom_slug, display_name, created_at |
| `user_settings` | id, user_id (UNIQUE), theme_color, logo_url, page_title, show_categories, profile_description, layout_style, created_at, updated_at |
| `links` | id, user_id, title, url, description, short_code (UNIQUE, nullable), qr_code, click_count, is_public, is_active, category_id, created_at, updated_at |
| `categories` | id, user_id, name, icon, sort_order, created_at |
| `public_pages` | id, user_id, slug (UNIQUE), title, description, logo_url, theme_color, layout_style, show_categories, is_active, click_count, sort_order, created_at, updated_at |
| `public_page_links` | id, page_id, link_id, sort_order, created_at — UNIQUE(page_id, link_id) |
| `admin_users` | user_id (UNIQUE FK to users ON DELETE CASCADE), created_at |

**Key constraints:**
- `links.short_code` is UNIQUE and nullable
- `users.custom_slug` is UNIQUE and nullable (deprecated — replaced by multi-page feature)
- `public_pages.slug` is UNIQUE and globally checked against reserved words
- `public_page_links` uses junction table pattern: 1 page → N links, 1 link → N pages
- Categories are user-scoped (no global categories)
- `admin_users` is a junction table — admin users exist in `users` table too

## URL Shortener Implementation

- Auto-generate 6-char random code on link creation
- Custom codes editable but not deletable
- Validation: 3-30 chars, lowercase alphanumeric + hyphens, no reserved words
- Reserved words in `lib/validation.ts`: admin, api, login, register, dashboard, etc.

**API endpoints:**
- `POST /api/links/generate-short-code`
- `GET /api/links/check-short-code?code=xxx&exclude=yyy`

## Multi-Page Feature

Each user can create N public pages, each with unique slug, theme, layout, and link selection.

**Architecture:**
- 1 user → N `public_pages` (each with unique slug)
- 1 page → N links (via `public_page_links` junction table)
- 1 link → N pages (links can appear on multiple pages)

**Page properties:**
- `slug`: unique, min 3 chars, `[a-z0-9-]`, checked against reserved words
- `title`: required, max 200 chars
- `description`: optional
- `logo_url`: optional, image URL
- `theme_color`: optional, hex color (default: #3b82f6)
- `layout_style`: `"list"` | `"grid"` | `"compact"`
- `show_categories`: boolean (default: false)
- `is_active`: boolean (default: true)

**API endpoints:**
- `GET /api/pages` — list all pages for user
- `POST /api/pages` — create new page
- `GET /api/pages/[id]` — get page with links
- `PATCH /api/pages/[id]` — update page
- `DELETE /api/pages/[id]` — delete page
- `PUT /api/pages/[id]/links` — bulk set links for page
- `GET /api/pages/check-slug?slug=xxx&exclude=yyy` — check slug availability
- `GET /api/links/[id]` — get page count for link (delete warning)

**Reserved slugs:** dashboard, login, register, admin, api, auth, user, users, settings, categories, links, track-click, public, profile

## Environment Variables

```bash
# Required
DB_TYPE=sqlite                    # 'sqlite' or 'supabase'
JWT_SECRET=minimum-32-char-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Required if DB_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Key Files Reference

| Purpose | File |
|---------|------|
| Database abstraction | `lib/db.ts`, `lib/db-types.ts` |
| SQLite implementation | `lib/db-sqlite.ts` |
| Supabase implementation | `lib/db-supabase.ts` |
| JWT auth | `lib/auth.ts` |
| Admin auth helpers | `lib/admin-auth.ts` |
| Validation schemas | `lib/validation.ts` |
| QR code generation | `lib/qr-code.ts` |
| Rate limiting | `lib/rate-limit.ts` |
| Storage abstraction | `lib/storage.ts` (Supabase Storage + local fallback) |
| SEO metadata | `lib/seo.ts` |
| Short code + page route | `app/[slug]/page.tsx` |
| Link tracking API | `app/api/track-click/route.ts` |
| Logo upload API | `app/api/upload-logo/route.ts` |
| Public page rendering | `components/user/public-page-header.tsx`, `components/link-card.tsx` |

## API Route Patterns

**Auth check pattern:**
```typescript
// User endpoints
const session = await getUserSession()  // returns { userId, isAdmin } | null
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const userId = session.userId

// Admin endpoints
const session = await getVerifiedAdminSession()  // returns { userId, isAdmin } | null
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
// getVerifiedAdminSession() = JWT verify + db.isAdminUser(userId)

// Ownership verification
if (resource.user_id !== userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Error handling:**
- Use prefix `[v0]` for error logs
- Indonesian language for user-facing messages
- Standard HTTP status codes: 400, 401, 403, 404, 409, 500

## Testing Checklist

1. **Auth flow:** Register → login (cookie set) → dashboard access → logout → redirect
2. **Public pages:** Create page with slug → add links → visit `/{slug}` → verify page renders with theme
3. **Multi-page:** 1 user can create N public pages, each with unique slug, theme, layout
4. **URL shortener:** Create link (auto-generate code) → edit to custom code → visit `/{code}` → verify redirect + click count increment
5. **Admin:** Add user to `admin_users` table → login at `/admin/login` → access admin dashboard
6. **Link deletion warning:** Delete link → check pageCount → show warning if link is in pages

## Security Notes

- ✅ Password hashing: bcrypt (10 rounds)
- ✅ httpOnly session cookies
- ✅ Secure cookies in production (`Secure` flag)
- ✅ SameSite 'lax' CSRF protection
- ✅ Ownership verification before resource mutations
- ✅ Reserved words validation for slugs/short codes
- ⚠️ Always use `bcrypt.compare()` - never direct password comparison
- ⚠️ Never store plain text passwords

## Development Notes

### Dev Server Quirk: Repeated Log Entries on Link Status Change

Ketika admin mengubah status link (Draft → Private/Publik), dev server akan
menampilkan log berulang seperti:

```
✓ Compiled in 330ms (445 modules)
GET /dashboard/links 200 in 351ms
GET /a375ak 200 in 527ms
✓ Compiled in 366ms (445 modules)
GET /dashboard/links 200 in 395ms
GET /a375ak 200 in 509ms
```

**Penyebab:** Next.js dev server mendeteksi perubahan file database SQLite
(`svlink.db`) dan trigger recompilation + hot reload di semua tab browser
yang terbuka.

**Solusi:** Ini hanya terjadi di dev mode. Di production, tidak ada issue ini.
Tidak perlu fix - cukup refresh browser jika log terlalu berisik.

### Link Status: Draft Links Return 404

Short link dengan `is_active=false` (status Draft) akan mengembalikan 404.
Halaman `/[slug]` menggunakan `dynamic = 'force-dynamic'` untuk memastikan
status selalu fresh dari database tanpa caching.

### Logo Upload

Logo user diupload via `/dashboard/settings` dengan spesifikasi:
- **Format:** PNG, JPG, GIF, WebP
- **Max size:** 500KB
- **Rekomendasi:** 200x200px
- **Storage:** Supabase Storage bucket `user-logos` (production) atau `public/uploads/logos/` (local fallback)
- **Upload flow:** File dipilih → preview → upload saat klik "Simpan Pengaturan"
- **Delete flow:** File dihapus dari storage + URL di-clear dari database saat save
- **API:** `POST /api/upload-logo` (upload), `DELETE /api/upload-logo` (delete)
