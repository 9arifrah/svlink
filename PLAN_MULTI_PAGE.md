# SVLink Multi-Page Feature — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Transform SVLink from "1 user = 1 public page" to "1 user = N public pages" with each page having its own slug, theme, layout, and link selection.

**Architecture:** Introduce `public_pages` table (owned by user, globally unique slug) and `public_page_links` junction table (many-to-many between pages and links). The existing `[slug]/page.tsx` route now queries `public_pages` instead of `users.custom_slug`. Registration no longer collects a slug — users create pages manually from the dashboard.

**Tech Stack:** Next.js 15, TypeScript, shadcn/ui, SQLite (better-sqlite3) / Supabase, Zod validation, JWT cookie auth

---

## Phase 1: Registration Cleanup — Remove Slug from Register

The current register form and API still reference slug concepts (e.g., "Slug sudah digunakan" error message). Phase 1 removes all slug-related artifacts from the registration flow.

### Task 1.1: Remove slug validation error from register-form.tsx

**Objective:** Remove the "Slug sudah digunakan" error message from the register form component since no slug field exists.

**Files:**
- Modify: `components/auth/register-form.tsx`

**Step 1: Inspect the current register form**

The register form currently has a slug validation error string at line 37 that references a slug field that no longer exists in the form. Search for and remove this dead code.

Run: `grep -n "slug\|Slug\|customSlug\|custom_slug" components/auth/register-form.tsx`

**Step 2: Remove slug-related code**

Remove any references to slug validation errors, slug state variables, or slug input fields. The form should only have: displayName, email, password, confirmPassword.

**Step 3: Verify**

Run: `grep -n "slug\|Slug\|customSlug\|custom_slug" components/auth/register-form.tsx`
Expected: No matches

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/auth/register-form.tsx
git commit -m "refactor: remove dead slug code from register form"
```

---

### Task 1.2: Clean up validation.ts — remove unused slug helpers

**Objective:** Remove or keep as internal-only the slug schema and reserved slugs list that are no longer used by registration but are still used by the pages API.

**Files:**
- Modify: `lib/validation.ts`

**Step 1: Check usage of slug-related exports**

Run: `grep -rn "slugSchema\|RESERVED_SLUGS\|PAGE_RESERVED_SLUGS" lib/ app/ components/`

The `RESERVED_SLUGS` (or similar) is still needed by `/api/pages/route.ts` for page slug validation. Keep it but ensure it's not exported as part of the register flow.

**Step 2: Verify registerSchema has no slug**

The registerSchema should only have: `email`, `password`, `displayName`. Confirm:

```bash
grep -A 5 "export const registerSchema" lib/validation.ts
```

Expected output shows only email, password, displayName fields.

**Step 3: Commit**

```bash
cd /home/ubuntu/project/svlink && git add lib/validation.ts
git commit -m "chore: verify slug helpers are internal, not in registerSchema"
```

---

### Task 1.3: Verify register API creates user without slug

**Objective:** Confirm the register API route creates users with `custom_slug: null` and does NOT auto-create a public page.

**Files:**
- Verify: `app/api/auth/register/route.ts`

**Step 1: Inspect register API**

Check that:
- User is created with `custom_slug: null`
- No `public_pages` INSERT happens after user creation
- Redirect goes to `/dashboard`

Run: `grep -n "custom_slug\|public_page\|redirect" app/api/auth/register/route.ts`

Expected: Only `custom_slug: null` in createUser call. No public_pages reference.

**Step 2: If needed, fix**

If the register API still creates a public page automatically, remove that logic. The user should create pages manually.

**Step 3: Commit**

```bash
cd /home/ubuntu/project/svlink && git add app/api/auth/register/route.ts
git commit -m "fix: ensure register API does not auto-create public page"
```

---

## Phase 2: Page Form — Tab-Based Edit/Create

The page form (`components/user/page-form.tsx`) already has tabs (info, style, links, preview). This phase ensures it handles all requirements: logo upload per page, real-time slug validation, link selection with reorder, and preview.

### Task 2.1: Verify tab structure in page-form.tsx

**Objective:** Confirm the page form has all 4 tabs: Info, Gaya (Style), Link, Preview — with proper tab navigation.

**Files:**
- Verify: `components/user/page-form.tsx`

**Step 1: Check tab state and navigation**

Run: `grep -n "activeTab\|setActiveTab\|info\|style\|links\|preview" components/user/page-form.tsx | head -20`

Expected: Tab state with `'info' | 'style' | 'links' | 'preview'` union type.

**Step 2: Verify each tab renders content**

Each tab should render its own section:
- Info: title, slug, description, status (active/inactive)
- Style: logo upload, theme color picker, layout style selector, show_categories toggle
- Links: selected links with reorder (↑↓), available links with search and add (+)
- Preview: live preview of the public page

**Step 3: Check slug real-time validation**

The slug input should validate against existing slugs as the user types, calling `GET /api/pages/check-slug?slug=xxx` and showing available/taken status.

Run: `grep -n "check-slug\|checkSlug\|slug.*valid" components/user/page-form.tsx`

If missing, this needs to be added.

---

### Task 2.2: Verify slug check API endpoint

**Objective:** Ensure `GET /api/pages/check-slug` exists and validates slug availability globally.

**Files:**
- Verify: `app/api/pages/check-slug/route.ts`

**Step 1: Check the endpoint exists**

Run: `cat app/api/pages/check-slug/route.ts`

Expected: API that takes `?slug=xxx`, checks against `public_pages` table, reserved slugs list, and returns `{ available: boolean, suggestions?: string[] }`.

**Step 2: If missing, create it**

Create `app/api/pages/check-slug/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { PAGE_RESERVED_SLUGS, slugSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || '';
  const excludeId = url.searchParams.get('exclude') || undefined;

  if (!slug) {
    return NextResponse.json({ available: false, message: 'Slug wajib diisi' });
  }

  // Validate format
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return NextResponse.json({ available: false, message: parsed.error.errors[0].message });
  }

  // Check reserved
  if (PAGE_RESERVED_SLUGS.includes(slug.toLowerCase())) {
    return NextResponse.json({ available: false, message: 'Slug ini sudah digunakan oleh sistem' });
  }

  // Check uniqueness
  const exists = await db.isSlugExists(slug.toLowerCase(), excludeId);
  if (exists) {
    const suggestions = [
      `${slug}-2`,
      `my-${slug}`,
      `${slug}-${session.userId.slice(0, 4)}`
    ];
    return NextResponse.json({ available: false, message: 'Slug sudah digunakan', suggestions });
  }

  return NextResponse.json({ available: true });
}
```

**Step 3: Commit**

```bash
cd /home/ubuntu/project/svlink && git add app/api/pages/check-slug/route.ts
git commit -m "feat: add slug check API for real-time validation"
```

---

### Task 2.3: Verify logo upload in page form (Tab Gaya)

**Objective:** Confirm the page form can upload a logo per page (not per user). Logo should be uploaded via `POST /api/upload-logo` and stored in `public_pages.logo_url`.

**Files:**
- Verify: `components/user/page-form.tsx` (logo section)
- Verify: `app/api/upload-logo/route.ts`

**Step 1: Check logo upload flow**

The form should have:
- File input (PNG, JPG, GIF, WebP, max 500KB)
- Upload button or auto-upload on file select
- Preview of uploaded logo
- Delete logo button

Run: `grep -n "logo\|Logo\|upload\|Upload" components/user/page-form.tsx | head -20`

**Step 2: Verify upload API handles per-page logos**

Run: `cat app/api/upload-logo/route.ts | head -40`

The uploaded logo URL should be returned and set on the page being edited, not on user_settings.

---

### Task 2.4: Verify link selector with reorder (Tab Link)

**Objective:** Confirm the link selector shows selected links with ↑↓ reorder buttons and available links with search + add button.

**Files:**
- Verify: `components/user/page-form.tsx`

**Step 1: Check link management functions**

Run: `grep -n "addLink\|removeLink\|moveLink\|selectedLinks\|availableLinks" components/user/page-form.tsx | head -20`

Expected: Functions for add, remove, and reorder (moveLink with up/down).

**Step 2: Verify reorder logic**

The `moveLink` function should swap array elements:

```typescript
const moveLink = (index: number, direction: 'up' | 'down') => {
  const newLinks = [...selectedLinks];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= newLinks.length) return;
  [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
  setSelectedLinks(newLinks);
};
```

**Step 3: Verify search filter**

Available links should be filterable by title or URL:

```typescript
const filteredAvailableLinks = availableLinks.filter(
  link =>
    !selectedLinks.find(s => s.id === link.id) &&
    (link.title.toLowerCase().includes(linkSearch.toLowerCase()) ||
     link.url.toLowerCase().includes(linkSearch.toLowerCase()))
);
```

---

### Task 2.5: Verify preview tab (Tab Preview)

**Objective:** Confirm the preview tab renders a live preview of the public page using current form state (title, description, logo, theme_color, layout_style, selected links).

**Files:**
- Verify: `components/user/page-form.tsx`

**Step 1: Check preview rendering**

The preview should use the same components as the public page (`PublicPageHeader`, `LinkCard`) but rendered with form state values instead of database values.

Run: `grep -n "preview\|Preview\|PublicPageHeader\|LinkCard" components/user/page-form.tsx | head -15`

**Step 2: Verify theme color applies**

The preview container should use `theme_color` as the primary color for the header/background.

---

## Phase 3: Public Pages UI — List, Create, Edit

### Task 3.1: Verify `/dashboard/pages` list page

**Objective:** Confirm the pages list page shows all public pages for the user with card-style display (title, slug, link count, active status, action buttons).

**Files:**
- Verify: `app/dashboard/pages/page.tsx`
- Verify: `components/user/pages-list.tsx`

**Step 1: Check pages list component**

Run: `cat components/user/pages-list.tsx | head -80`

Expected: Cards showing page title, slug (with link), description, link count, click count, active/inactive badge, and action buttons (Edit, View, Delete).

**Step 2: Check empty state**

When user has no pages, show an illustration + CTA: "Belum ada Public Page" with "Buat Page Pertama" button.

Run: `grep -n "empty\|Empty\|belum\|kosong" components/user/pages-list.tsx`

**Step 3: Verify delete with confirmation**

Deleting a page should show a confirmation dialog and call `DELETE /api/pages/[id]`.

---

### Task 3.2: Verify `/dashboard/pages/new` create page

**Objective:** Confirm the new page route renders the PageForm in create mode.

**Files:**
- Verify: `app/dashboard/pages/new/page.tsx`

**Step 1: Check the page**

Run: `cat app/dashboard/pages/new/page.tsx`

Expected: DashboardLayout wrapper with `<PageForm mode="create" />`.

---

### Task 3.3: Verify `/dashboard/pages/[id]/edit` edit page

**Objective:** Confirm the edit page loads existing page data and renders PageForm in edit mode.

**Files:**
- Verify: `app/dashboard/pages/[id]/edit/page.tsx`

**Step 1: Check data fetching**

The page should:
1. Fetch page data from `GET /api/pages/[id]`
2. Fetch page links from `GET /api/pages/[id]/links`
3. Pass data to PageForm as `initialData`

Run: `cat app/dashboard/pages/[id]/edit/page.tsx`

---

### Task 3.4: Verify dashboard sidebar has Public Pages menu

**Objective:** Confirm sidebar has "Halaman Publik" / "Public Pages" menu item pointing to `/dashboard/pages`.

**Files:**
- Verify: `components/user/dashboard-sidebar.tsx`

**Step 1: Check sidebar**

Run: `grep -n "pages\|Pages\|Halaman" components/user/dashboard-sidebar.tsx`

Expected: Menu item with href `/dashboard/pages` and icon (e.g., FileText).

---

## Phase 4: Settings Cleanup

### Task 4.1: Verify settings page content

**Objective:** Confirm settings page only shows: Display Name, Email (read-only), Change Password, Delete Account.

**Files:**
- Verify: `app/dashboard/settings/page.tsx`
- Verify: `components/user/profile-forms.tsx`

**Step 1: Check settings page**

Run: `cat app/dashboard/settings/page.tsx`

Expected: Three sections — ProfileForm (display name), PasswordForm (change password), DeleteAccountForm (danger zone).

**Step 2: Verify NO page-related settings**

There should be NO theme color, layout style, logo, or page title settings on this page — those are now per-page in the Public Pages form.

Run: `grep -n "theme_color\|layout_style\|logo_url\|page_title" components/user/profile-forms.tsx`

Expected: No matches. If found, remove them.

---

### Task 4.2: Verify delete account confirmation UI

**Objective:** Confirm delete account form requires typing "HAPUS" to confirm before enabling the delete button.

**Files:**
- Verify: `components/user/profile-forms.tsx` (DeleteAccountForm)

**Step 1: Check delete account form**

Run: `grep -n "HAPUS\|hapus\|confirm\|Confirm" components/user/profile-forms.tsx | head -15`

Expected: Text input that must match "HAPUS" to enable the delete button, with warning text about what will be deleted.

**Step 2: Verify API endpoint**

Run: `cat app/api/user/account/route.ts`

Expected: DELETE handler that calls `db.deleteUser(session.userId)` and clears session.

---

## Phase 5: Link Deletion Warning

### Task 5.1: Add page count to link deletion

**Objective:** When user deletes a link from master list, show how many public pages that link appears in.

**Files:**
- Modify: `app/api/links/[id]/route.ts` (GET or add new endpoint)
- Modify: `components/user/links-table.tsx` (delete dialog)

**Step 1: Add method to count pages per link**

In `lib/db-sqlite.ts`, add:

```typescript
async getPageCountForLink(linkId: string): Promise<number> {
  const stmt = db.prepare(
    'SELECT COUNT(*) as count FROM public_page_links WHERE link_id = ?'
  )
  const row = stmt.get(linkId) as { count: number }
  return row.count
}
```

**Step 2: Update link delete response**

In `app/api/links/[id]/route.ts` (DELETE handler), before deleting:

```typescript
const pageCount = await db.getPageCountForLink(id);
// Return in response: { pageCount }
```

Or add a new endpoint `GET /api/links/[id]/page-usage` that returns the count.

**Step 3: Update delete confirmation in UI**

In `components/user/links-table.tsx`, when user clicks delete, check `pageCount`:

```tsx
{pageCount > 0 && (
  <p className="text-amber-600 text-sm">
    ⚠️ Link ini ada di {pageCount} halaman publik dan akan dihapus dari semua halaman tersebut.
  </p>
)}
```

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add lib/db-sqlite.ts app/api/links/\[id\]/route.ts components/user/links-table.tsx
git commit -m "feat: show page count warning when deleting link used in public pages"
```

---

## Phase 6: `[slug]/page.tsx` — Public Page Rendering

### Task 6.1: Verify public page route queries from public_pages

**Objective:** Confirm `app/[slug]/page.tsx` queries `public_pages` by slug (not `users.custom_slug`).

**Files:**
- Verify: `app/[slug]/page.tsx`

**Step 1: Check routing logic**

The route should:
1. Check if slug is a short code first → redirect to URL + increment click count
2. Find active page by slug in `public_pages` WHERE slug = ? AND is_active = 1
3. Get page links from `public_page_links` JOIN links ORDER BY sort_order
4. Render with page's theme_color, layout_style, show_categories, logo_url
5. If not found → 404

Run: `grep -n "getPublicPageBySlug\|getPublicPageLinks\|short_code\|redirect\|notFound" app/\[slug\]/page.tsx | head -20`

**Step 2: Verify click tracking per page**

When a public page is viewed, `incrementPageClickCount(pageId)` should be called.

Run: `grep -n "incrementPageClickCount\|pageClickCount" app/\[slug\]/page.tsx`

---

### Task 6.2: Verify SEO metadata for public pages

**Objective:** Confirm public pages generate proper Open Graph / SEO metadata.

**Files:**
- Verify: `app/[slug]/page.tsx` (generateMetadata function)
- Verify: `lib/seo.ts`

**Step 1: Check metadata generation**

Run: `grep -n "generateMetadata\|title\|description\|og:" app/\[slug\]/page.tsx | head -15`

Expected: Uses page.title, page.description for metadata.

---

## Phase 7: Testing & Polish

### Task 7.1: End-to-end test flow

**Objective:** Test the complete user flow end-to-end.

**Test Cases:**

1. **Registration → Dashboard:** Register new user → redirected to /dashboard → sees empty state in Links and Public Pages
2. **Create Link:** Add first link from dashboard → shows in Links table
3. **Create Page:** Go to Public Pages → Create → fill Info tab → fill Style tab → select link in Links tab → Preview looks correct → Save
4. **View Public Page:** Visit `/{slug}` → page renders with correct theme, links, logo
5. **Click Tracking:** Click link on public page → click_count increments
6. **Edit Page:** Edit page → change theme color → save → public page reflects change
7. **Delete Link Warning:** Delete link that's in a page → shows warning "Link ini ada di N page"
8. **Delete Page:** Delete page → page removed, links remain in master list
9. **Slug Conflict:** Try creating page with existing slug → shows error + suggestions
10. **Settings:** Change display name → change password → verify both work

**Commands:**

```bash
cd /home/ubuntu/project/svlink
npm run dev
# Then manually test at http://localhost:3000
```

### Task 7.2: TypeScript build check

**Objective:** Ensure no TypeScript errors.

Run:
```bash
cd /home/ubuntu/project/svlink
npx tsc --noEmit
```

Expected: No errors. If errors found, fix them before proceeding.

### Task 7.3: Lint check

Run:
```bash
cd /home/ubuntu/project/svlink
npm run lint
```

Expected: No errors.

### Task 7.4: Build check

Run:
```bash
cd /home/ubuntu/project/svlink
npm run build
```

Expected: Build succeeds. `ignoreBuildErrors: false` in `next.config.mjs` means TS errors will fail the build.

---

## Summary Checklist

| Phase | Task | Status |
|-------|------|--------|
| 1 | Remove slug from register form | 🔲 |
| 1 | Clean up validation.ts slug helpers | 🔲 |
| 1 | Verify register API (no auto-create page) | 🔲 |
| 2 | Verify tab structure in page-form | 🔲 |
| 2 | Verify/create slug check API | 🔲 |
| 2 | Verify logo upload per page | 🔲 |
| 2 | Verify link selector with reorder | 🔲 |
| 2 | Verify preview tab | 🔲 |
| 3 | Verify pages list with empty state | 🔲 |
| 3 | Verify /dashboard/pages/new | 🔲 |
| 3 | Verify /dashboard/pages/[id]/edit | 🔲 |
| 3 | Verify sidebar menu item | 🔲 |
| 4 | Verify settings page content | 🔲 |
| 4 | Verify delete account confirmation | 🔲 |
| 5 | Add page count to link deletion | 🔲 |
| 6 | Verify [slug] route queries public_pages | 🔲 |
| 6 | Verify SEO metadata | 🔲 |
| 7 | End-to-end testing | 🔲 |
| 7 | TypeScript build check | 🔲 |
| 7 | Lint + Build check | 🔲 |

---

## File Map

### New Files to Create (if missing):
- `app/api/pages/check-slug/route.ts` — Real-time slug validation

### Existing Files to Verify/Modify:
- `components/auth/register-form.tsx` — Remove slug references
- `lib/validation.ts` — Verify registerSchema clean
- `app/api/auth/register/route.ts` — Verify no auto-create page
- `components/user/page-form.tsx` — Verify all tabs, slug check, logo upload, link reorder, preview
- `components/user/pages-list.tsx` — Verify card display + empty state
- `components/user/profile-forms.tsx` — Verify no page settings, verify delete account
- `components/user/dashboard-sidebar.tsx` — Verify Public Pages menu
- `components/user/links-table.tsx` — Add page count warning on delete
- `app/[slug]/page.tsx` — Verify public_pages query
- `lib/db-sqlite.ts` — Add getPageCountForLink if missing
- `app/api/pages/check-slug/route.ts` — Create if missing

### Database (already done):
- `public_pages` table ✅
- `public_page_links` table ✅
- Migration for existing users ✅

---

## Principles Applied

- **DRY:** Reuse existing components (LinkCard, PublicPageHeader) in preview; shared slug validation logic
- **YAGNI:** No drag-drop library needed — arrow buttons (↑↓) sufficient for reorder; no complex page templates — single layout style is enough
- **TDD:** Test API endpoints with curl/Postman before UI integration; test form submission with DevTools network tab
- **Frequent commits:** One commit per task above
