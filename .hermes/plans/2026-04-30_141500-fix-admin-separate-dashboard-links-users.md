---
name: fix-admin-separate-dashboard-links-users
date: 2026-04-30
status: proposed
---

# Plan: Pisahkan Admin — Dashboard (Analytics), Links (Manajemen Link), Users (Moderasi User)

## Goal

Memisahkan konten admin sesuai fungsi dengan menu navigasi yang benar:
- **`/admin/dashboard`** → Analytics & statistik platform (fokus analytics, hapus LinksTable duplikat)
- **`/admin/links`** → Manajemen link (CRUD link)
- **`/admin/users`** → Moderasi user (suspend/unsuspend, bulk action, failed login) — tetap berdiri sendiri, tidak ada perubahan
- **Fix navigasi** → Menu "Kelola Link" di sidebar arahkan ke `/admin/links`

## Current Context

### Masalah:
1. **Menu navigasi salah**: 3 file sidebar/nav mengarahkan menu "Link" ke `/admin/dashboard` (bukan `/admin/links`)
2. **Dashboard duplikat**: `/admin/dashboard` menampilkan LinksTable di bagian bawah (duplikat dari `/admin/links`)

### Yang sudah ada dan TIDAK perlu diubah:
- `/admin/links` — LinksTable sudah ada, berfungsi
- `/admin/users` — UsersTable sudah ada dengan fitur suspend/unsuspend, bulk action
- Semua API endpoint moderasi user sudah berfungsi

## Step-by-Step Plan

### Step 1: Fix Navigasi Sidebar (3 files)

**File:** `components/admin/admin-sidebar.tsx` (line 9)
```diff
- { name: 'Kelola Link', href: '/admin/dashboard', icon: ExternalLink },
+ { name: 'Kelola Link', href: '/admin/links', icon: ExternalLink },
```

**File:** `components/admin/dashboard-layout.tsx` (line 20)
```diff
- { name: 'Link', href: '/admin/dashboard', icon: ExternalLink },
+ { name: 'Link', href: '/admin/links', icon: ExternalLink },
```

**File:** `components/admin/admin-mobile-bottom-nav.tsx` (line 10)
```diff
- { name: 'Link', href: '/admin/dashboard', icon: Link2 },
+ { name: 'Link', href: '/admin/links', icon: Link2 },
```

### Step 2: Bersihkan `/admin/dashboard` — Hapus LinksTable Duplikat

**File:** `app/admin/dashboard/page.tsx`

Perubahan:
- Hapus import `LinksTable` (jika ada di bagian import)
- Hapus function `getCategories()` jika hanya dipakai untuk LinksTable
- Hapus Card "Link Terbaru" yang berisi `<LinksTable links={links} categories={categories} />` (line 216-223)
- Update subtitle header (line 104): `"Kelola semua link, kategori, dan user di platform"` → `"Statistik dan analitik platform"`

Yang tetap ada (analytics):
- StatsCards (total links, clicks, users, categories)
- GrowthChart (trend link & user)
- AuditStatsWidget (audit log stats)
- Top 10 Links by Clicks (ini analytics, bukan CRUD management)

### Step 3: Update Header `/admin/links` (opsional, kosmetik)

**File:** `app/admin/links/page.tsx`

Update subtitle biar lebih jelas:
```diff
- <p className="text-sm sm:text-base text-slate-300 mt-1">
-   Manajemen semua link di platform — tambah, edit, hapus, dan cari link
- </p>
+ <p className="text-sm sm:text-base text-slate-300 mt-1">
+   Manajemen link di platform — tambah, edit, hapus, dan cari link
+ </p>
```

### Step 4: Verifikasi

1. `npm run dev` — pastikan tidak ada error compile
2. Buka `/admin/dashboard` — harus tampil: StatsCards + GrowthChart + AuditStatsWidget + Top 10 Links. **Tidak ada** LinksTable.
3. Buka `/admin/links` — harus tampil: LinksTable (CRUD link)
4. Buka `/admin/users` — harus tampil: UsersTable (suspend, unsuspend, bulk action) — tidak berubah
5. Sidebar "Kelola Link" klik → harus ke `/admin/links` (bukan `/admin/dashboard`)
6. Mobile bottom nav "Link" klik → harus ke `/admin/links`

## Files Changed

| File | Perubahan |
|------|-----------|
| `components/admin/admin-sidebar.tsx` | 1 line: fix href `/admin/dashboard` → `/admin/links` |
| `components/admin/dashboard-layout.tsx` | 1 line: fix href `/admin/dashboard` → `/admin/links` |
| `components/admin/admin-mobile-bottom-nav.tsx` | 1 line: fix href `/admin/dashboard` → `/admin/links` |
| `app/admin/dashboard/page.tsx` | Hapus LinksTable section + getCategories(), update subtitle |
| `app/admin/links/page.tsx` | Update subtitle (opsional, kosmetik) |

**Total:** 4 file diubah (1 opsional), sekitar 6-8 baris perubahan

## Risks

- **Risk:** Sangat rendah — hanya perubahan href dan hapus section duplikat
- **No API changes** — semua API endpoint tetap sama
- **No new dependencies** — semua komponen sudah ada
