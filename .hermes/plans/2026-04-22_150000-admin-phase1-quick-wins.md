# Admin Panel Phase 1 — Quick Wins Implementation Plan

**Tanggal:** April 22, 2026
**Scope:** 8 fitur prioritas tinggi dengan effort rendah
**Target:** Semua fitur diimplementasi tanpa breaking changes ke existing code

---

## 🎯 Goal

Meningkatkan fungsionalitas admin panel SVLink dengan menambahkan 8 fitur quick wins yang memberikan value immediate dengan effort minimal.

---

## 📋 Fitur yang Akan Diimplementasi

### 1. Top Performing Links (Rendah effort, Tinggi impact)
**Lokasi:** `/admin/dashboard` — tambah section baru di bawah stats cards
**Implementasi:** Query links yang sudah ada, sort by `click_count DESC`, tampilkan top 10
**File yang berubah:** `app/admin/dashboard/page.tsx`, `components/admin/links-table.tsx`

### 2. View Semua Public Pages (Rendah effort, Tinggi impact)
**Lokasi:** Halaman baru `/admin/pages`
**Implementasi:** CRUD sederhana untuk view/suspend public pages user
**File baru:** `app/admin/pages/page.tsx`, `app/api/admin/pages/route.ts`
**Database:** Query `public_pages` + join `users`

### 3. Bulk User Operations (Rendah effort, Tinggi impact)
**Lokasi:** `/admin/users` — tambah checkbox + bulk actions dropdown
**Implementasi:** Multi-select di UsersTable, endpoint baru `POST /api/admin/users/bulk`
**File yang berubah:** `components/admin/users-table.tsx`, `app/api/admin/users/route.ts`

### 4. Account Suspension (Rendah effort, Tinggi impact)
**Lokasi:** `/admin/users` — action button per user
**Implementasi:** 
- Tambah kolom `is_suspended` di tabel `users` (default false)
- Bedakan dengan `is_active` (user bisa suspend tanpa delete)
- UI: badge + toggle suspend/unsuspend
**File yang berubah:** Migration script, `components/admin/users-table.tsx`, `app/api/admin/users/[id]/route.ts`

### 5. Export CSV/Excel (Rendah effort, Tinggi impact)
**Lokasi:** `/admin/dashboard`, `/admin/users` — tombol export di header
**Implementasi:** Generate CSV dari existing queries, download file
**Library:** `csv-stringify` (npm package)
**File yang berubah:** `app/api/admin/links/export/route.ts`, `app/api/admin/users/export/route.ts`

### 6. System Announcements (Rendah effort, Sedang impact)
**Lokasi:** `/admin/settings` — CRUD announcements + tampilan di dashboard user
**Implementasi:** 
- Tabel `announcements` (id, title, message, is_active, created_at, expires_at)
- CRUD di admin settings
- Banner di `/dashboard` user untuk active announcements
**File baru:** Migration, `app/admin/settings/page.tsx` (update), `app/api/admin/announcements/route.ts`

### 7. Failed Login Monitoring (Rendah effort, Sedang impact)
**Lokasi:** `/admin/dashboard` — section security
**Implementasi:** 
- Tambah kolom `failed_login_count`, `last_failed_login`, `locked_until` di `users`
- Track di `/api/auth/login` dan `/api/admin/login`
- UI: warning badge di users table
**File yang berubah:** Migration, `lib/auth.ts`, `app/api/admin/login/route.ts`

### 8. Maintenance Mode (Rendah effort, Sedang impact)
**Lokasi:** `/admin/settings` — toggle on/off
**Implementasi:** 
- Config flag di database atau env var
- Middleware yang redirect ke maintenance page saat mode on
- Exception untuk admin access
**File baru:** `middleware.ts` (update), `app/maintenance/page.tsx`

---

## 📁 Struktur File yang Akan Dibuat/Diubah

```
app/
├── admin/
│   ├── pages/page.tsx                    # NEW - View public pages
│   ├── settings/page.tsx                 # MODIFY - Add announcements + maintenance
│   └── dashboard/page.tsx                # MODIFY - Add top links section
├── api/admin/
│   ├── pages/route.ts                    # NEW - Admin pages API
│   ├── users/route.ts                    # MODIFY - Add bulk operations
│   ├── users/export/route.ts             # NEW - Export users CSV
│   ├── users/[id]/route.ts               # MODIFY - Add suspend/unsuspend
│   ├── links/export/route.ts             # NEW - Export links CSV
│   └── announcements/route.ts            # NEW - Announcements CRUD
├── maintenance/page.tsx                  # NEW - Maintenance page
components/admin/
│   ├── users-table.tsx                   # MODIFY - Add bulk select + suspend
│   ├── links-table.tsx                   # MODIFY - Add export button
│   └── announcements-manager.tsx         # NEW - Announcements UI
lib/
│   ├── db.ts                             # MODIFY - Add new methods
│   ├── auth.ts                           # MODIFY - Track failed logins
│   └── middleware.ts                      # MODIFY - Add maintenance check
migrations/
│   ├── 001_add_user_suspension.sql       # NEW
│   ├── 002_add_failed_login_tracking.sql # NEW
│   └── 003_add_announcements_table.sql   # NEW
```

---

## 🔧 Implementation Steps (Sequential Order)

### Step 1: Database Migrations
1. Create `001_add_user_suspension.sql` — ALTER TABLE users ADD COLUMN is_suspended
2. Create `002_add_failed_login_tracking.sql` — ADD failed_login_count, last_failed_login, locked_until
3. Create `003_add_announcements_table.sql` — CREATE TABLE announcements
4. Run migrations for both SQLite dan Supabase

### Step 2: Account Suspension
1. Update `lib/db.ts` — tambah method `suspendUser()`, `unsuspendUser()`
2. Update `app/api/admin/users/[id]/route.ts` — tambah endpoint PATCH untuk suspend/unsuspend
3. Update `components/admin/users-table.tsx` — tambah action button + badge

### Step 3: Bulk User Operations
1. Tambah `POST /api/admin/users/bulk` — handle array of IDs + action (suspend/activate/delete)
2. Update `components/admin/users-table.tsx` — checkbox multi-select + dropdown actions
3. Implementasi optimistic UI updates

### Step 4: View Public Pages
1. Create `GET /api/admin/pages` — query semua public_pages dengan user info
2. Create `app/admin/pages/page.tsx` — table view dengan search + filter
3. Tambah navigation item di sidebar

### Step 5: Export CSV
1. Install `csv-stringify`
2. Create `GET /api/admin/links/export` — generate CSV dari all links
3. Create `GET /api/admin/users/export` — generate CSV dari all users
4. Tambah export button di respective tables

### Step 6: Top Performing Links
1. Update `app/admin/dashboard/page.tsx` — query links ORDER BY click_count DESC LIMIT 10
2. Tampilkan dalam card/table baru di bawah GrowthChart

### Step 7: Failed Login Monitoring
1. Update `lib/auth.ts` — increment failed_login_count on failed login
2. Update `app/api/auth/login/route.ts` — lock user setelah 5 failed attempts
3. Update `app/api/admin/login/route.ts` — sama seperti user login
4. Tampilkan warning di users table untuk locked accounts

### Step 8: Maintenance Mode & Announcements
1. Create announcements CRUD API
2. Update admin settings page dengan 2 section baru
3. Create maintenance page
4. Update middleware untuk maintenance mode check
5. Tambah announcement banner di user dashboard

---

## 🧪 Testing & Validation

### Manual Testing Checklist
- [ ] Admin bisa suspend/unsuspend user
- [ ] Bulk operations (suspend/activate/delete) bekerja dengan 1+ users
- [ ] Export CSV download file yang valid
- [ ] Public pages admin view menampilkan semua pages
- [ ] Top links menampilkan 10 link dengan click_count tertinggi
- [ ] Failed login tracking: 5x gagal → account locked
- [ ] Announcements: create/edit/delete works, tampil di user dashboard
- [ ] Maintenance mode: redirect ke maintenance page, admin bisa bypass

### Verification Commands
```bash
cd /home/ubuntu/project/svlink

# Build verification
npm run build

# Type checking
npx tsc --noEmit

# Run existing tests (jika ada)
npm test

# Database migration test (SQLite)
npm run migrate:sqlite
```

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes ke user auth | High | Feature flag untuk failed login tracking |
| Migration conflicts | Medium | Test di SQLite dulu, backup sebelum apply ke Supabase |
| Performance issue di bulk operations | Low | Implementasi batch processing untuk 100+ users |
| Maintenance mode lock admin | Critical | Always allow admin access dengan valid session |

---

## 📊 Dependencies

| Fitur | Depends On | Reason |
|-------|------------|--------|
| Suspension | Migration 001 | Butuh kolom baru |
| Bulk Operations | Suspension | Menggunakan suspend functionality |
| Failed Login | Migration 002 | Butuh kolom tracking |
| Announcements | Migration 003 | Butuh tabel baru |
| Export CSV | None | Pure data extraction |
| Top Links | None | Existing data |
| View Pages | None | Existing data |
| Maintenance Mode | None | Config-based |

---

## 🎯 Success Criteria

- Semua 8 fitur bisa diakses dari admin panel tanpa error
- Tidak ada regression di existing functionality
- Database migrations berhasil di SQLite (dev) dan Supabase (prod)
- Admin bisa perform bulk operations tanpa crash
- Export CSV menghasilkan file yang bisa dibuka di spreadsheet
- Maintenance mode bisa di-toggle dan redirect working

---

## 💡 Notes

- Semua fitur menggunakan existing auth system (`getVerifiedAdminSession`)
- UI mengikuti existing design system (shadcn/ui + Tailwind)
- API endpoints mengikuti existing pattern (Next.js App Router)
- Database queries compatible dengan SQLite dan Supabase (via `db.ts` abstraction)
- Estimated timeline: 2-4 hari implementasi full-time
