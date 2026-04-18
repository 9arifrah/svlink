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
- Admin auth via separate `admin_users` table

**Key files:**
- `lib/auth.ts` - JWT session management
- `app/api/auth/login/route.ts` - User login
- `app/api/admin/login/route.ts` - Admin login

### Critical Routing Quirk: `/[slug]` Dual Purpose

Route `app/[slug]/page.tsx` handles **TWO** cases in priority order:

1. **Short Code (Priority 1):** Check if slug is a short code → redirect to URL
2. **User Profile (Priority 2):** Check if slug is a custom_slug → render public profile

```typescript
const link = await db.getLinkByShortCode(slug)
if (link) {
  await db.incrementClickCount(link.id)
  redirect(link.url, 302)
}

const user = await db.getUserBySlug(slug)
if (user) {
  // Render public profile page
}
```

**Important:** Public profiles have **NO `/u/` prefix** - directly `/{custom_slug}`

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
├── ui/                   # 50+ shadcn/ui primitives
├── auth/                 # Login/register forms
├── user/                 # User dashboard components
│   ├── quick-actions.tsx          # Quick create buttons on dashboard
│   ├── quick-create-dialog.tsx    # Input dialog for quick create
│   ├── quick-create-result-modal.tsx  # Result preview after creation
│   ├── links-table.tsx
│   └── ...
├── admin/                # Admin dashboard (12 components)
└── shared/               # Icon picker, QR modal
```

**Quick Create Feature:**
- Located on `/dashboard` page
- Two buttons: "Quick Create: Short Link" and "Quick Create: QR Code"
- Flow: Input Dialog → Submit → Result Modal (instant preview)
- Result modal shows: short link (with copy), QR code preview (with download), link details
- Uses `POST /api/links` which auto-generates both short code and QR code

### Responsive Design Patterns

**Reference implementations:**
- `components/user/dashboard-sidebar.tsx` - Full-height sticky sidebar
- `components/user/quick-create-result-modal.tsx` - Responsive modal with overflow handling

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

| Table | Purpose |
|-------|---------|
| `users` | id, email, password_hash, custom_slug, display_name |
| `user_settings` | theme_color, logo_url, page_title, show_categories |
| `links` | title, url, short_code, qr_code, click_count, is_public |
| `categories` | name, icon, sort_order, user_id (null = global) |
| `admin_users` | user_id (FK to users) |

**Key constraints:**
- `links.short_code` is UNIQUE and nullable
- `users.custom_slug` is UNIQUE and nullable
- Categories with null `user_id` are global (admin-managed)

## URL Shortener Implementation

- Auto-generate 6-char random code on link creation
- Custom codes editable but not deletable
- Validation: 3-30 chars, lowercase alphanumeric + hyphens, no reserved words
- Reserved words in `lib/validation.ts`: admin, api, login, register, dashboard, etc.

**API endpoints:**
- `POST /api/links/generate-short-code`
- `GET /api/links/check-short-code?code=xxx&exclude=yyy`

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
| Short code + profile route | `app/[slug]/page.tsx` |
| Link tracking API | `app/api/track-click/route.ts` |

## API Route Patterns

**Auth check pattern:**
```typescript
const userId = await getUserSession()
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

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
2. **Public profile:** Create user with custom_slug → add public links → visit `/{slug}` → verify no `/u/` prefix
3. **URL shortener:** Create link (auto-generate code) → edit to custom code → visit `/{code}` → verify redirect + click count increment
4. **Admin:** Add user to `admin_users` table → login at `/admin/login` → access admin dashboard

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
