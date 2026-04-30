---
name: fix-admin-navigation-duplicate-links
date: 2026-04-30
status: proposed
---

# Plan: Fix Admin Navigation — Duplicate Dashboard Links

## Goal

Perbaiki bug di mana menu "Link" / "Kelola Link" di admin panel mengarah ke `/admin/dashboard` (sama dengan menu Dashboard), padahal harusnya mengarah ke `/admin/links`.

## Current Context

Ada 3 file yang memiliki navigasi admin dengan href yang salah:

| File | Lokasi | Baris | Nama Menu | href Saat Ini | href Seharusnya |
|------|--------|-------|-----------|---------------|-----------------|
| `components/admin/admin-sidebar.tsx` | Line 9 | Sidebar desktop | `Kelola Link` | `/admin/dashboard` | `/admin/links` |
| `components/admin/dashboard-layout.tsx` | Line 20 | Mobile nav array | `Link` | `/admin/dashboard` | `/admin/links` |
| `components/admin/admin-mobile-bottom-nav.tsx` | Line 10 | Bottom nav mobile | `Link` | `/admin/dashboard` | `/admin/links` |

Page `/admin/links` sudah ada (`app/admin/links/page.tsx`) dan berfungsi normal. Hanya navigasinya yang salah.

## Proposed Approach

Minimal change — hanya ubah `href` dari `/admin/dashboard` ke `/admin/links` di 3 file. Tidak ada perubahan logic, component, atau API.

## Step-by-Step Plan

### Step 1: Fix `admin-sidebar.tsx`
- **File:** `components/admin/admin-sidebar.tsx`
- **Line 9:** Ubah `{ name: 'Kelola Link', href: '/admin/dashboard', icon: ExternalLink }` → `{ name: 'Kelola Link', href: '/admin/links', icon: ExternalLink }`

### Step 2: Fix `dashboard-layout.tsx`
- **File:** `components/admin/dashboard-layout.tsx`
- **Line 20:** Ubah `{ name: 'Link', href: '/admin/dashboard', icon: ExternalLink }` → `{ name: 'Link', href: '/admin/links', icon: ExternalLink }`

### Step 3: Fix `admin-mobile-bottom-nav.tsx`
- **File:** `components/admin/admin-mobile-bottom-nav.tsx`
- **Line 10:** Ubah `{ name: 'Link', href: '/admin/dashboard', icon: Link2 }` → `{ name: 'Link', href: '/admin/links', icon: Link2 }`

## Files Changed

| File | Change |
|------|--------|
| `components/admin/admin-sidebar.tsx` | 1 line: href change |
| `components/admin/dashboard-layout.tsx` | 1 line: href change |
| `components/admin/admin-mobile-bottom-nav.tsx` | 1 line: href change |

## Verification

1. Jalankan `npm run dev` — pastikan tidak ada error compile
2. Buka `/admin/dashboard` — sidebar harus muncul, menu "Kelola Link" klik harus ke `/admin/links`
3. Di mobile view — bottom nav item "Link" klik harus ke `/admin/links`
4. Pastikan halaman `/admin/links` menampilkan LinksTable (bukan dashboard stats)

## Risks

- **Risk:** Rendah — hanya perubahan href statis, tidak ada logic change
- **Tradeoff:** Tidak ada, ini fix straightforward
