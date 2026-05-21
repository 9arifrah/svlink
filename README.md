# svlink

Platform manajemen tautan profesional yang memungkinkan pengguna mengatur, membagikan, dan menampilkan tautan penting dengan halaman publik yang dapat dikustomisasi.

## 🚀 Fitur Utama

### Untuk Pengguna:
- 🔐 **Autentikasi Aman** - Sistem login/registrasi dengan password hashing (bcrypt), rate limiting, account lock setelah 5x gagal
- 📊 **Dashboard Personal** - Statistik link, kategori, grafik klik 7 hari, recent links, top links
- 🔗 **Manajemen Tautan** - Tambah, edit, hapus link dengan pelacakan klik, status publik/draft/private
- 🔗 **URL Shortener** - Setiap link auto-generate short code 6 karakter, bisa di-edit custom
- 📁 **Organisasi Kategori** - Kelompokkan link berdasarkan kategori dengan ikon Lucide React
- 🌐 **Multi-Page Publik** - Buat N halaman publik dengan slug unik, tema, dan layout kustom per halaman
- 🎨 **PageForm UX** - Phone mockup preview, auto-slug, color picker, logo upload, link reorder
- 🔍 **Pencarian** - Search bar dengan dropdown hasil di halaman publik
- 📱 **Mobile-First** - Bottom navigation (Home/Link/Pages/Kategori/Setting), responsive di semua device
- 🔑 **Password Strength** - Indikator 5 kriteria saat registrasi dengan visual bar
- 🖼️ **QR Code** - Auto-generate QR code tiap link, bisa download PNG, preview modal
- 🔗 **Table Sorting** - Sortir link berdasarkan judul, klik, status, tanggal di dashboard

### Untuk Admin:
- 📈 **Dashboard Analytics** — Statistik platform, grafik pertumbuhan, audit stats, top 10 link by clicks
- 🔗 **Manajemen Link** — CRUD semua link platform dengan search/filter/sort, inline create category
- 👥 **Manajemen Pengguna** — Suspend/activate user, bulk operations, monitoring failed login, export CSV
- 📁 **Kategori Global** — CRUD kategori global dengan ikon Lucide, sort order
- 🌐 **Halaman Publik** — Kelola public page user (activate/deactivate, delete)
- 📊 **Analitik** — Grafik pertumbuhan user dan link
- 📋 **Audit Logs** — Riwayat aksi admin di platform
- ⚙️ **Pengaturan** — Maintenance mode, announcements, backfill QR/short code
- 📱 **Responsive Admin** — 18 komponen admin responsif dengan mobile bottom nav

## 🛠️ Tech Stack

- **Frontend:** Next.js 15.5.15, React 18.3.1
- **Backend:** SQLite (Development) / Supabase (Production)
- **UI:** shadcn/ui (Radix UI + Tailwind CSS) — 57 primitives + 52 domain components = 109 total
- **Autentikasi:** Custom JWT dengan jose + bcryptjs (unified `svlink_session` cookie)
- **Bahasa:** TypeScript 5.7.3
- **Linting:** ESLint 9 (flat config)
- **Font:** Plus Jakarta Sans (Google Fonts)
- **QR Code:** qrcode package
- **Icons:** Lucide React
- **Forms:** react-hook-form + Zod
- **Animations:** CSS keyframes (float, scale-in, fade-in)

> **💡 Mode Development Lokal:** Project ini sekarang support SQLite untuk development lokal tanpa perlu setup Supabase. Lihat [SETUP_LOCAL_DEV.md](SETUP_LOCAL_DEV.md) untuk panduan lengkap.

## 📦 Instalasi

### Quick Start (Development Lokal dengan SQLite)

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment variables untuk SQLite
cp .env.example .env.local
# Edit .env.local dan pastikan DB_TYPE=sqlite

# Jalankan development server
npm run dev
```

Database SQLite akan otomatis dibuat di `data/svlink.db`. Tidak perlu setup Supabase untuk development!

### Production (dengan Supabase)

```bash
# Setup environment variables untuk Supabase
cp .env.example .env.local
# Edit .env.local:
# - Set DB_TYPE=supabase
# - Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY

# Install dependencies
npm install

# Build untuk production
npm run build

# Start production server
npm start
```

📖 **Panduan Lengkap:** Lihat [SETUP_LOCAL_DEV.md](SETUP_LOCAL_DEV.md) untuk panduan setup development lokal dengan SQLite.

## 🔧 Environment Variables

### Untuk Development Lokal (SQLite):

```env
# Database Type
DB_TYPE=sqlite

# Supabase (tidak diperlukan untuk SQLite)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# JWT Secret (tetap diperlukan)
JWT_SECRET=development-secret-change-in-production-minimum-32-chars

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### Untuk Production (Supabase):

```env
# Database Type
DB_TYPE=supabase

# Supabase (WAJIB diisi untuk production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Secret
JWT_SECRET=your-strong-production-secret-minimum-32-characters

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

## 🗄️ Database

Project ini mendukung dua jenis database:

### Development: SQLite
- File-based database, otomatis dibuat di `data/svlink.db`
- Tidak perlu setup database server
- Data persisten antar restart
- Mudah di-reset (hapus file database)

### Production: Supabase
- Cloud PostgreSQL database
- Scalable dan reliable
- Mudah migrasi dari SQLite

### Struktur Tabel (sama untuk SQLite dan Supabase):

- **users** — Data pengguna + security fields (failed_login_count, locked_until, is_suspended)
- **user_settings** — Pengaturan profil per user (theme_color, logo_url, page_title, profile_description, layout_style)
- **links** — Tautan dengan short_code, qr_code, click_count, is_public, is_active, category_id
- **categories** — Kategori tautan dengan icon, sort_order
- **public_pages** — Multi-page publik (slug unik, theme, layout, show_categories, is_active)
- **public_page_links** — Junction table: 1 page → N links, 1 link → N pages
- **admin_users** — Junction table penanda admin
- **announcements** — System announcements
- **audit_logs** — Admin action audit trail

### Skema Database

#### users
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
email VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
custom_slug VARCHAR(50) UNIQUE            -- deprecated (diganti multi-page)
display_name VARCHAR(100)
is_suspended INTEGER DEFAULT 0
failed_login_count INTEGER DEFAULT 0
last_failed_login DATETIME
locked_until DATETIME
created_at TIMESTAMP DEFAULT NOW()
```

#### user_settings
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
theme_color VARCHAR(7) DEFAULT '#3b82f6'
logo_url TEXT
page_title VARCHAR(100)
show_categories INTEGER DEFAULT 1
profile_description TEXT
layout_style TEXT DEFAULT 'list'          -- 'list' | 'grid' | 'compact'
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

#### links
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES users(id) ON DELETE CASCADE
title VARCHAR(200) NOT NULL
url TEXT NOT NULL
description TEXT
category_id UUID REFERENCES categories(id) ON DELETE SET NULL
is_public INTEGER DEFAULT 0
is_active INTEGER DEFAULT 1
click_count INTEGER DEFAULT 0
qr_code TEXT                              -- base64 data URI
short_code TEXT UNIQUE                    -- 6-char random / custom
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

#### categories
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name VARCHAR(100) NOT NULL
icon VARCHAR(50)
sort_order INTEGER DEFAULT 0
user_id UUID REFERENCES users(id) ON DELETE CASCADE
created_at TIMESTAMP DEFAULT NOW()
```

#### public_pages
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES users(id) ON DELETE CASCADE
slug VARCHAR(50) UNIQUE NOT NULL
title VARCHAR(200) NOT NULL
description TEXT
logo_url TEXT
theme_color VARCHAR(7) DEFAULT '#3b82f6'
layout_style TEXT DEFAULT 'list'
show_categories INTEGER DEFAULT 0
is_active INTEGER DEFAULT 1
click_count INTEGER DEFAULT 0
sort_order INTEGER DEFAULT 0
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

#### public_page_links
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id UUID REFERENCES public_pages(id) ON DELETE CASCADE
link_id UUID REFERENCES links(id) ON DELETE CASCADE
sort_order INTEGER DEFAULT 0
created_at TIMESTAMP DEFAULT NOW()
UNIQUE(page_id, link_id)
```

#### admin_users
```sql
user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
created_at TIMESTAMP DEFAULT NOW()
```

## 🔗 URL Shortener

Fitur URL shortener memungkinkan setiap link memiliki short code untuk share link individual.

**Fitur:**
- ✅ Auto-generate short code (6 karakter random) saat create link
- ✅ Custom short code yang bisa di-edit
- ✅ Validasi real-time untuk ketersediaan short code
- ✅ Redirect otomatis ke URL target
- ✅ Auto-increment click count sebelum redirect
- ✅ Copy button untuk mudah share short link

**Validasi Short Code:**
- Case-insensitive (disimpan sebagai lowercase)
- Minimal 3 karakter, maksimal 30 karakter
- Hanya huruf kecil, angka, dan tanda hubung (-)
- Harus diawali dan diakhiri dengan huruf atau angka
- Tidak boleh menggunakan reserved words (admin, api, login, dll.)

**API Endpoints:**
- `POST /api/links/generate-short-code` - Generate short code random
- `GET /api/links/check-short-code?code=xxx&exclude=yyy` - Cek ketersediaan short code

**Cara Menggunakan:**
1. Create new link - short code otomatis di-generate
2. Edit short code sesuai keinginan (opsional)
3. Copy short link dan bagikan
4. Short link format: `domain.com/[shortCode]`

**Migration:**
```bash
# SQLite
npm run migrate:shortener

# Supabase
# Apply supabase/migrations/20260409_add_short_code.sql
```

## 📝 Perintah Development

```bash
npm run dev      # Start development server
npm run build    # Build untuk production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚀 Deploy ke Vercel

### Environment Variables (WAJIB diset di Vercel Dashboard)

Project ini **tidak bisa menggunakan SQLite di Vercel** karena serverless functions bersifat ephemeral. Anda harus menggunakan Supabase:

```
DB_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=minimum-32-character-secret-key-here
NEXT_PUBLIC_SITE_URL=https://svlink.vercel.app
```

> **Penting:** Environment variables harus diset di Vercel Dashboard (Settings → Environment Variables), bukan di file `.env`. File `.env` tidak ter-deploy ke Vercel.

### Database Setup

1. Buat project di [Supabase](https://supabase.com)
2. Copy URL dan Anon Key dari Settings → API
3. Set environment variables di Vercel Dashboard
4. Apply schema database (ada di `supabase/migrations/`)

### Catatan Deploy

- SQLite **tidak support** di Vercel serverless
- `better-sqlite3` di-exclude dari bundling via `serverExternalPackages` di `next.config.mjs`
- ESLint menggunakan flat config (ESLint 9) dengan ignore patterns untuk `.next/`, `node_modules/`, `data/`, dan `public/uploads/`

## 🌐 Halaman Utama

### Halaman Publik:
- `/` - Landing page (CTA, social proof, demo preview)
- `/login` - Login pengguna (unified — admin redirect ke `/admin/dashboard`)
- `/register` - Registrasi pengguna baru
- `/[slug]` - Dual purpose: short code redirect (priority 1) atau public page render (priority 2)

### Dashboard Pengguna (Protected):
- `/dashboard` - Dashboard pengguna dengan statistik + recent links + top links + quick create
- `/dashboard/links` - Manajemen tautan (CRUD, filter, sort, inline create category)
- `/dashboard/pages` - Manajemen halaman publik (multi-page feature)
- `/dashboard/pages/new` - Buat halaman publik baru (PageForm 3-tab)
- `/dashboard/pages/[id]/edit` - Edit halaman publik
- `/dashboard/categories` - Manajemen kategori dengan link count badge
- `/dashboard/settings` - Pengaturan profil (logo upload, theme, layout)

### Panel Admin (Protected):
- `/admin/dashboard` — Dashboard analytics platform (stats, growth chart, audit stats, top 10 link)
- `/admin/links` — Manajemen link global (CRUD, search, filter, sort, export CSV)
- `/admin/users` — Moderasi user (suspend/activate, bulk actions, failed login, export CSV)
- `/admin/categories` — Manajemen kategori global (CRUD, icon, sort order)
- `/admin/pages` — Kelola public page user (activate/deactivate, delete)
- `/admin/stats` — Analitik dan grafik detail
- `/admin/audit-logs` — Audit trail aksi admin
- `/admin/settings` — Pengaturan platform (maintenance, announcements, backfill)

## 🔐 Keamanan

### Yang Sudah Diimplementasikan:
- ✅ Password hashing dengan bcryptjs (10 salt rounds)
- ✅ httpOnly session cookies (unified `svlink_session` cookie)
- ✅ `secure: false` di dev (harus `true` saat deploy HTTPS)
- ✅ SameSite 'lax' CSRF protection
- ✅ Minimum password length: 8 karakter + uppercase, lowercase, number, special char
- ✅ Account lock setelah 5x gagal login (15 menit)
- ✅ Suspended account check di login
- ✅ Rate limiting pada auth endpoints (in-memory)
- ✅ Verifikasi kepemilikan resource sebelum mutasi
- ✅ Timing attack mitigation saat cek email exist (register)

### Catatan Penting:
- Jangan simpan password dalam plain text
- Selalu verifikasi userId cocok dengan pemilik resource sebelum mutasi
- Gunakan bcrypt.compare() untuk verifikasi password, jangan pernah bandingkan langsung

## 🏗️ Arsitektur

### Autentikasi
**Implementasi Kustom (Bukan Supabase Auth):**
- Unified cookie-based session management menggunakan `svlink_session` cookie
- Password di-hash dengan bcryptjs (10 salt rounds)
- Sessions disimpan sebagai httpOnly cookies dengan expiry 7 hari (30 hari dengan remember me)
- Admin users diidentifikasi via tabel `admin_users` (junction table)
- Single `/login` endpoint — admin redirect ke `/admin/dashboard`, user ke `/dashboard`
- JWT library: `jose` (SignJWT, jwtVerify) — payload: `{ userId, isAdmin, iat, exp }`

### API Routes
**Autentikasi Check:**
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

**API Routes Utama:**
- `POST /api/links` - Create link
- `PATCH /api/links/[id]` - Update link (ownership verified)
- `DELETE /api/links/[id]` - Delete link (ownership verified)
- `POST /api/track-click` - Increment click count (uses RPC function)
- `PATCH /api/user/settings` - Update profile settings

### Komponen
**Organisasi:**
```
components/
├── ui/              # 57 shadcn/ui primitives (Button, Card, Dialog, dll.)
├── auth/            # Authentication forms (login-form, register-form)
├── admin/           # Admin dashboard (18 components)
├── user/            # User dashboard (25 components)
├── shared/          # Shared domain (icon-picker, qr-code-modal, theme-toggle)
├── link-card.tsx    # Shared link card component
├── search-bar.tsx   # Shared search component
├── theme-provider.tsx        # Dark mode provider
└── structured-data-script.tsx # SEO structured data
```
**Total:** 109 components

## 🧪 Testing

### Test Authentication Flow:
1. Register new user di `/register` → verifikasi user_settings dibuat otomatis
2. Verifikasi password strength indicator (5 kriteria checklist)
3. Login di `/login` (harus set `svlink_session` cookie)
4. Akses `/dashboard` (harus berhasil)
5. Logout (cookie harus clear)
6. Coba akses `/dashboard` (harus redirect ke login)
7. Test 5x gagal login → account lock 15 menit
8. Test rate limiting (5 req/menit untuk login)

### Test Public Page:
1. Create public page via `/dashboard/pages/new`
2. Add links to page
3. Visit `/[slug]` (harus render dengan theme, layout, kategori grouping)
4. Test search functionality (dropdown hasil)
5. Click link (harus increment link + page click_count)
6. Test 404 untuk slug tidak valid

### Test Admin:
1. Pastikan user exists di tabel `admin_users`
2. Login di `/login` (admin user akan redirect ke `/admin/dashboard`)
3. Akses `/admin/dashboard` (harus show platform stats, growth chart, audit stats, top 10 link)
4. Akses `/admin/links` — harus tampil LinksTable CRUD dengan sort/filter
5. Akses `/admin/users` — harus tampil UsersTable dengan suspend/activate, bulk actions
6. Akses `/admin/categories` — harus tampil CRUD kategori global
7. Akses `/admin/pages` — harus tampil daftar public page dengan toggle active/nonaktif
8. Akses `/admin/audit-logs` — harus tampil audit trail
9. Sidebar + mobile bottom nav harus konsisten di semua device

### Test URL Shortener:
1. Login dan buat new link (short code otomatis di-generate 6 karakter)
2. Edit link dan ubah ke custom short code
3. Coba gunakan reserved words (harus error: "Short code ini sudah digunakan oleh sistem")
4. Coba gunakan short code yang sudah ada (harus error: "Short code sudah digunakan")
5. Akses short link via browser (harus redirect HTTP 302 ke URL target)
6. Verifikasi click_count bertambah setelah redirect
7. Test 404 untuk short code tidak valid atau draft (is_active=false)

## 🎨 UI/UX Overview

### Highlights:
- **Custom Font:** Plus Jakarta Sans untuk typography modern
- **Responsive:** Semua 109 komponen mobile-first dengan Tailwind breakpoints
- **Loading States:** Skeleton loading di semua halaman (5 loading.tsx + inline skeletons)
- **Mobile Navigation:** Fixed bottom nav dengan 5 item (Home/Link/Pages/Kategori/Setting)
- **Dashboard Enrichment:** Recent links, top links, click chart, quick create, auto-refresh stats
- **Landing Page:** CTA above fold, social proof, demo preview, sticky navbar
- **Auth UX:** Password strength indicator, error messages dengan AlertCircle, scroll-into-view
- **PageForm:** 3-tab form (Info/Link/Gaya) dengan phone mockup preview, auto-slug, logo upload
- **Accessibility:** WCAG 2.1 AA color contrast, semantic HTML, aria labels
- **Animations:** float, scale-in, fade-in keyframes untuk transisi halus
- **Dark Mode:** Toggle di public page dengan kontras yang dioptimasi
- **Supabase Compatible:** Dual DB support (SQLite dev + Supabase prod) dengan query abstraction

## 📄 Lisensi

MIT License

## 🤝 Kontribusi

Contributions, issues, and feature requests are welcome!

## 👤 Author

**Your Name** - [GitHub Profile](https://github.com/yourusername)
