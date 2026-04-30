---
name: fix-admin-dashboard-links-separation
date: 2026-04-30
status: proposed
---

# Plan: Pisahkan Admin Dashboard (Analytics) dan Links (Manajemen + Moderasi)

## Goal

Memisahkan konten admin sesuai fungsi:
- **`/admin/dashboard`** → Analytics & statistik platform (stats cards, chart, top links)
- **`/admin/links`** → Manajemen link + moderasi user (tabbed view)
- **Fix navigasi** → Menu "Kelola Link" di sidebar arahkan ke `/admin/links`

## Current Context

### Masalah saat ini:
1. **Menu navigasi salah**: 3 file sidebar/nav mengarahkan menu "Link" ke `/admin/dashboard` (bukan `/admin/links`)
2. **Dashboard duplikat**: `/admin/dashboard` menampilkan LinksTable di bagian bawah (duplikat dari `/admin/links`)
3. **Links kurang moderasi**: `/admin/links` hanya punya LinksTable, belum ada fitur moderasi user

### Fitur moderasi user yang sudah ada (bisa di-reuse):
- `components/admin/users-table.tsx` — tabel user dengan suspend/unsuspend, failed login tracking
- `app/api/admin/users/[id]/suspend/route.ts` — API toggle suspend
- `app/api/admin/users/bulk/route.ts` — API bulk action (suspend, unsuspend, activate, delete)
- `lib/db-sqlite.ts` & `lib/db-supabase.ts` — `suspendUser()`, `unsuspendUser()`, `bulkUserAction()`

## Proposed Approach

### A. Fix `/admin/dashboard` — Fokus Analytics
- Hapus section "Link Terbaru" (LinksTable) yang duplikat
- Simpan: StatsCards + GrowthChart + AuditStatsWidget + Top 10 Links (ini analytics, bukan CRUD)
- Ubah subtitle: "Kelola semua link, kategori, dan user" → "Statistik dan analitik platform"

### B. Transform `/admin/links` — Manajemen Link + Moderasi User (Tabbed)
- Tambahkan Tabs component (shadcn/ui): **Tab "Link"** + **Tab "User"**
- **Tab "Link"**: LinksTable (existing — CRUD link: tambah, edit, hapus, search)
- **Tab "User"**: UsersTable (existing dari `/admin/users` — suspend, unsuspend, bulk action, failed login)
- Update header: "Kelola Link & Moderasi User"

### C. Fix Navigasi Sidebar
| File | Line | Perubahan |
|------|------|-----------|
| `components/admin/admin-sidebar.tsx` | 9 | `href: '/admin/dashboard'` → `href: '/admin/links'` (menu "Kelola Link") |
| `components/admin/dashboard-layout.tsx` | 20 | `href: '/admin/dashboard'` → `href: '/admin/links'` (menu "Link" di mobile nav) |
| `components/admin/admin-mobile-bottom-nav.tsx` | 10 | `href: '/admin/dashboard'` → `href: '/admin/links'` (menu "Link" di bottom nav) |

## Step-by-Step Plan

### Step 1: Fix Navigasi Sidebar (3 files)
**File:** `components/admin/admin-sidebar.tsx` (line 9)
```
{ name: 'Kelola Link', href: '/admin/links', icon: ExternalLink }
```

**File:** `components/admin/dashboard-layout.tsx` (line 20)
```
{ name: 'Link', href: '/admin/links', icon: ExternalLink }
```

**File:** `components/admin/admin-mobile-bottom-nav.tsx` (line 10)
```
{ name: 'Link', href: '/admin/links', icon: Link2 }
```

### Step 2: Bersihkan `/admin/dashboard` dari LinksTable
**File:** `app/admin/dashboard/page.tsx`
- Hapus import `LinksTable` (line ~221: `<LinksTable links={links} categories={categories} />`)
- Hapus import `categories` dari `getCategories()` jika tidak dipakai lagi
- Hapus Card "Link Terbaru" (line 216-223)
- Tetap simpan: StatsCards, GrowthChart, AuditStatsWidget, Top 10 Links table
- Update subtitle di header (line 104): `"Statistik dan analitik platform"`

### Step 3: Tambah Tabbed View di `/admin/links`
**File:** `app/admin/links/page.tsx`

Ubah struktur halaman jadi:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LinksTable } from '@/components/admin/links-table'
import { UsersTable } from '@/components/admin/users-table'

// Di dalam component:
<Tabs defaultValue="links">
  <TabsList>
    <TabsTrigger value="links">Link</TabsTrigger>
    <TabsTrigger value="users">User</TabsTrigger>
  </TabsList>
  <TabsContent value="links">
    <LinksTable links={links} categories={categories} />
  </TabsContent>
  <TabsContent value="users">
    <UsersTable users={users} />
  </TabsContent>
</Tabs>
```

Tambahkan `getUsers()` function (reuse logic dari `/admin/users/page.tsx`).

### Step 4: Verifikasi Tabs component tersedia
Cek apakah shadcn/ui Tabs sudah terinstall. Kalau belum:
```bash
npx shadcn@latest add tabs
```

### Step 5: Update `/admin/users` — Redirect atau Keep
**Opsi A (Recommended):** Redirect `/admin/users` → `/admin/links?tab=users` (atau tetap `/admin/links` dengan tabs)
**Opsi B:** Keep `/admin/users` sebagai halaman terpisah, tapi navigasi sidebar tetap mengarah ke `/admin/links`

Deva recommend **Opsi A** — redirect, karena user management sudah masuk di `/admin/links` tabs. Tapi bisa juga keep jika Dipsi prefer keduanya ada.

## Files Changed

| File | Action |
|------|--------|
| `components/admin/admin-sidebar.tsx` | 1 line: fix href |
| `components/admin/dashboard-layout.tsx` | 1 line: fix href |
| `components/admin/admin-mobile-bottom-nav.tsx` | 1 line: fix href |
| `app/admin/dashboard/page.tsx` | Remove LinksTable section, update subtitle |
| `app/admin/links/page.tsx` | Add Tabs + UsersTable, add getUsers() |
| `app/admin/users/page.tsx` | Redirect ke `/admin/links` (opsional) |

## Verification

1. `npm run dev` — pastikan tidak ada error compile
2. Buka `/admin/dashboard` — harus tampil: StatsCards + GrowthChart + AuditStatsWidget + Top 10 Links. **Tidak ada** LinksTable.
3. Buka `/admin/links` — harus ada Tabs: Tab "Link" (LinksTable) dan Tab "User" (UsersTable)
4. Klik tab "User" — harus tampil UsersTable dengan fitur suspend/unsuspend
5. Sidebar "Kelola Link" klik → harus ke `/admin/links` (bukan `/admin/dashboard`)
6. Mobile bottom nav "Link" klik → harus ke `/admin/links`

## Risks

- **Risk:** Low — perubahan terisolasi, no API changes, re-use existing components
- **Open question:** Apakah `/admin/users` perlu redirect atau tetap ada sebagai halaman terpisah?
- **Dependencies:** Pastikan `shadcn/ui Tabs` sudah terinstall (kemungkinan besar sudah ada)
