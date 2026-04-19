# SVLINK — UI/UX IMPROVEMENT PLAN

**Project:** svlink — Platform Manajemen Tautan Profesional  
**Berdasarkan:** UI/UX Review Report (19 April 2026)  
**Skor Awal:** 6.6/10 (B-)  
**Target Skor:** 8.5/10 (A-)  
**Estimasi Total:** 5-7 hari kerja  

---

## FASE 1: CRITICAL FIXES (Hari 1-2)

### Task 1.1 — Fix Mobile Navigation Icons
- **Severity:** Tinggi (Broken UX)
- **File:** `components/user/dashboard-layout.tsx`
- **Estimasi:** 15 menit
- **Detail:**
  - Ganti semua icon `ExternalLink` dan `Menu` di `mobileNavigation`
  - Mapping yang benar:
    - Dashboard → `Home`
    - Kelola Link → `Link2`
    - Kategori → `FolderTree`
    - Pengaturan → `Settings`
- **Verifikasi:** Buka dashboard di mobile, pastikan setiap menu punya icon berbeda

### Task 1.2 — Hapus Console.log Production
- **Severity:** Tinggi (Security & Performance)
- **Estimasi:** 30 menit
- **Detail:**
  - Search semua file: `grep -r "console.log" components/ app/ lib/`
  - Hapus atau ganti dengan logger yang proper
  - Buat utility `lib/logger.ts`:
    ```typescript
    const isDev = process.env.NODE_ENV === 'development'
    export const logger = {
      log: (...args: any[]) => isDev && console.log('[svlink]', ...args),
      error: (...args: any[]) => console.error('[svlink]', ...args),
      warn: (...args: any[]) => isDev && console.warn('[svlink]', ...args),
    }
    ```
  - Replace semua `console.log('[v0]')` dengan `logger.log()`
- **Verifikasi:** `grep -r "console.log" --include="*.tsx" --include="*.ts" | grep -v node_modules`

### Task 1.3 — Unify Design System
- **Severity:** Tinggi (Brand Consistency)
- **Estimasi:** 1 jam
- **Detail:**
  - Pilih **brand blue** (#2563eb) sebagai primary — sudah dipakai di tailwind.config
  - Hapus atau refactor `lib/design-system.ts` yang Slack purple
  - Pindahkan tokens yang berguna (shadows, spacing) ke tailwind.config.ts
  - Pastikan semua komponen pakai `brand-*` color, bukan hardcoded hex
- **File yang diubah:**
  - `lib/design-system.ts` — hapus atau simplify
  - `tailwind.config.ts` — tambahkan missing tokens
  - `app/globals.css` — sinkronkan CSS variables
- **Verifikasi:** Grep warna hardcoded, pastikan konsisten

### Task 1.4 — Fix Sidebar Branding
- **Severity:** Sedang
- **File:** `components/user/dashboard-sidebar.tsx`
- **Estimasi:** 10 menit
- **Detail:**
  - Ganti "User Panel" → "svlink"
  - Ganti icon `ExternalLink` → custom logo atau icon `Link2`
  - Tambah subtitle: "Link Management"

---

## FASE 2: LANDING PAGE (Hari 2-3)

### Task 2.1 — Tambah CTA Above Fold
- **Severity:** Tinggi (Conversion)
- **File:** `app/page.tsx`
- **Estimasi:** 30 menit
- **Detail:**
  - Tambah tombol CTA utama di hero section (sebelum user scroll)
  - Layout:
    ```
    Heading: "Kelola Semua Link Anda dalam Satu Halaman"
    Subheading: "Platform link management profesional untuk personal branding"
    CTA Primary: "Mulai Gratis →" (link ke /register)
    CTA Secondary: "Lihat Demo" (link ke contoh public page)
    Social Proof: "Bergabung dengan 1000+ pengguna"
    ```
  - Style: Primary button besar (px-8 py-4), Secondary outline
- **Verifikasi:** Buka halaman utama, CTA harus visible tanpa scroll

### Task 2.2 — Tambah Social Proof Section
- **Severity:** Tinggi (Trust)
- **File:** `app/page.tsx`
- **Estimasi:** 45 menit
- **Detail:**
  - Tambah section setelah hero:
    - User count badge: "1000+ pengguna aktif"
    - 3 testimonial cards (atau placeholder untuk awal)
    - Trust badges: "Gratis Selamanya", "Tanpa Iklan", "Data Aman"
  - Layout: horizontal scroll di mobile, grid di desktop
- **Verifikasi:** Section muncul setelah hero, responsive di mobile

### Task 2.3 — Tambah Demo/Preview Section
- **Severity:** Sedang
- **File:** `app/page.tsx`
- **Estimasi:** 30 menit
- **Detail:**
  - Tambah section "Lihat Hasilnya" dengan:
    - Screenshot/mockup public page
    - Atau interactive preview frame
    - Label: "Seperti ini halaman publik Anda"
  - Gunakan mockup device frame untuk showcase
- **Verifikasi:** Preview visible dan menarik

### Task 2.4 — Footer Lengkap
- **Severity:** Rendah
- **File:** `app/page.tsx` (atau `components/layout/footer.tsx`)
- **Estimasi:** 15 menit
- **Detail:**
  - Tambah kolom:
    - Product: Fitur, Harga, Demo
    - Company: About, Blog, Contact
    - Legal: Terms, Privacy, Cookie Policy
    - Social: GitHub, Twitter, LinkedIn
  - Copyright di bawah
- **Verifikasi:** Footer muncul di semua halaman

---

## FASE 3: DASHBOARD ENRICHMENT (Hari 3-4)

### Task 3.1 — Tambah Recent Links di Dashboard
- **Severity:** Tinggi (Data Richness)
- **File:** Buat `components/user/recent-links.tsx`
- **Estimasi:** 1 jam
- **Detail:**
  - Card baru di dashboard: "Link Terbaru"
  - Tampilkan 5 link terakhir dengan:
    - Title + URL (truncate)
    - Click count
    - Status badge (Public/Private)
    - Quick actions: Edit, Copy, Delete
  - Link "Lihat Semua" → /dashboard/links
- **Verifikasi:** Card muncul di dashboard, data sesuai

### Task 3.2 — Tambah Click Analytics Mini Chart
- **Severity:** Sedang
- **File:** Buat `components/user/clicks-mini-chart.tsx`
- **Estimasi:** 45 menit
- **Detail:**
  - Line chart kecil menampilkan klik 7 hari terakhir
  - Gunakan sparkline atau chart sederhana
  - Label: "Klik 7 Hari Terakhir"
  - Tooltip saat hover
- **Verifikasi:** Chart muncul dan data akurat

### Task 3.3 — Empty State Onboarding
- **Severity:** Sedang
- **File:** Dashboard page + new component
- **Estimasi:** 45 menit
- **Detail:**
  - Deteksi user baru (0 link, 0 kategori)
  - Tampilkan onboarding card:
    ```
    Selamat Datang di svlink! 👋
    
    Mulai dalam 3 langkah:
    1. ✏️ Buat link pertama Anda
    2. 📁 Atur dalam kategori
    3. 🌐 Bagikan halaman publik Anda
    
    [Buat Link Pertama →]
    ```
  - Hilang otomatis setelah user punya ≥1 link
- **Verifikasi:** Register user baru, onboarding muncul

### Task 3.4 — Top Performing Links
- **Severity:** Rendah
- **File:** Buat `components/user/top-links.tsx`
- **Estimasi:** 30 menit
- **Detail:**
  - Card: "Link Terpopuler"
  - Ranking 5 link dengan klik terbanyak
  - Progress bar visual
- **Verifikasi:** Ranking sesuai data

---

## FASE 4: MOBILE EXPERIENCE (Hari 4-5)

### Task 4.1 — Bottom Navigation untuk Mobile
- **Severity:** Sedang
- **File:** Buat `components/user/mobile-bottom-nav.tsx`
- **Estimasi:** 1 jam
- **Detail:**
  - Fixed bottom nav bar (5 icon):
    - Home (Dashboard)
    - Link (Kelola Link)
    - Plus (Quick Create — center, prominent)
    - Folder (Kategori)
    - Settings (Pengaturan)
  - Active state dengan highlight
  - Hide di desktop (lg:hidden)
- **Verifikasi:** Nav muncul di mobile, semua link berfungsi

### Task 4.2 — PWA Install Prompt
- **Severity:** Rendah
- **File:** Buat `components/pwa-install-prompt.tsx`
- **Estimasi:** 30 menit
- **Detail:**
  - Banner: "Install svlink untuk akses cepat"
  - Tombol "Install" dan "Nanti"
  - Dismiss → simpan preference di localStorage
  - Hanya tampil di mobile browser
- **Verifikasi:** Prompt muncul di Chrome mobile

### Task 4.3 — Touch Gesture Optimization
- **Severity:** Rendah
- **Estimasi:** 30 menit
- **Detail:**
  - Swipe left/right untuk navigate antar tab (opsional)
  - Pull to refresh di dashboard
  - Touch feedback (ripple effect) di link cards
- **Verifikasi:** Gesture smooth di mobile

---

## FASE 5: PUBLIC PAGE ENHANCEMENT (Hari 5-6)

### Task 5.1 — Theme Preview di Settings
- **Severity:** Tinggi (User Experience)
- **File:** `components/user/settings-form.tsx`
- **Estimasi:** 1 jam
- **Detail:**
  - Tambah live preview panel di samping form settings
  - Preview update real-time saat user ubah:
    - Warna tema
    - Logo
    - Judul halaman
    - Bio
  - Tombol "Lihat Halaman" → buka public page di tab baru
- **Verifikasi:** Preview update saat settings berubah

### Task 5.2 — Layout Style Options
- **Severity:** Sedang
- **File:** Settings + Public page
- **Estimasi:** 1 jam
- **Detail:**
  - Tambah pilihan layout:
    - List (default) — vertikal
    - Grid — 2 kolom
    - Compact — minimal, rapat
  - Simpan preference di user_settings
  - Render sesuai pilihan di public page
- **Verifikasi:** Ganti layout, public page berubah

### Task 5.3 — Link Card Enhancement
- **Severity:** Sedang
- **File:** `components/link-card.tsx`
- **Estimasi:** 45 menit
- **Detail:**
  - Tambah favicon dari URL (via Google Favicon API)
  - Tambah description field (opsional, max 100 char)
  - Hover state: slight scale + shadow
  - Skeleton loading saat data belum siap
- **Verifikasi:** Card lebih informatif dan interaktif

### Task 5.4 — Dark Mode Toggle untuk Public Page
- **Severity:** Sedang
- **File:** Public page layout
- **Estimasi:** 30 menit
- **Detail:**
  - Toggle switch di pojok kanan atas public page
  - Simpan preference visitor di localStorage
  - Respect system preference (prefers-color-scheme)
- **Verifikasi:** Toggle berfungsi, theme persist

---

## FASE 6: AUTH & ONBOARDING (Hari 6)

### Task 6.1 — Password Strength Indicator
- **Severity:** Sedang
- **File:** `components/auth/register-form.tsx`
- **Estimasi:** 30 menit
- **Detail:**
  - Progress bar di bawah password field
  - Warna: Merah (lemah) → Kuning (sedang) → Hijaku (kuat)
  - Label: "Lemah", "Sedang", "Kuat", "Sangat Kuat"
  - Checklist: min 8 char, ada huruf besar, angka, simbol
- **Verifikasi:** Strength berubah saat user ketik password

### Task 6.2 — Social Login (Google)
- **Severity:** Sedang
- **File:** Login + Register pages
- **Estimasi:** 2 jam
- **Detail:**
  - Tambah tombol "Masuk dengan Google"
  - OAuth flow via Supabase Auth atau NextAuth
  - Auto-create account jika belum ada
  - Redirect ke dashboard setelah login
- **Verifikasi:** Google login berfungsi

### Task 6.3 — Error Message Improvement
- **Severity:** Sedang
- **File:** Login + Register forms
- **Estimasi:** 15 menit
- **Detail:**
  - Error message dengan icon (AlertCircle)
  - Background merah muda + border merah
  - Auto-scroll ke error
  - Specific messages: "Email sudah terdaftar", "Password salah", dll
- **Verifikasi:** Error tampil jelas dan informatif

---

## FASE 7: POLISH & TESTING (Hari 7)

### Task 7.1 — Font Custom
- **Estimasi:** 15 menit
  - Tambah Google Font: Inter atau Plus Jakarta Sans
  - Update `app/layout.tsx` dengan font import
  - Update `globals.css` dengan font-family
  - Fallback: system-ui

### Task 7.2 — Loading States
- **Estimasi:** 30 menit
  - Tambah skeleton di semua page yang fetch data
  - Button loading spinner saat submit form
  - Page transition loading indicator

### Task 7.3 — Accessibility Audit
- **Estimasi:** 1 jam
  - Run Lighthouse audit
  - Fix contrast issues
  - Verify keyboard navigation
  - Test dengan screen reader

### Task 7.4 — Performance Audit
- **Estimasi:** 30 menit
  - Run Lighthouse performance
  - Optimize images (next/image)
  - Lazy load heavy components
  - Check bundle size

### Task 7.5 — Cross-browser Testing
- **Estimasi:** 30 menit
  - Chrome, Firefox, Safari
  - Mobile: Chrome Android, Safari iOS
  - Verify responsive di semua breakpoint

---

## SUMMARY

| Fase | Task | Estimasi | Priority |
|------|------|----------|----------|
| 1. Critical Fixes | 4 task | 2 jam | 🔴 Tinggi |
| 2. Landing Page | 4 task | 2 jam | 🔴 Tinggi |
| 3. Dashboard | 4 task | 2.5 jam | 🟡 Sedang |
| 4. Mobile | 3 task | 2 jam | 🟡 Sedang |
| 5. Public Page | 4 task | 3 jam | 🟡 Sedang |
| 6. Auth | 3 task | 2.5 jam | 🟡 Sedang |
| 7. Polish | 5 task | 3 jam | 🟢 Rendah |
| **TOTAL** | **27 task** | **~17 jam** | |

---

## CHECKLIST PER FASE

### Fase 1 — Critical Fixes
- [ ] 1.1 Mobile navigation icons fixed
- [ ] 1.2 Console.log removed
- [ ] 1.3 Design system unified
- [ ] 1.4 Sidebar branding fixed

### Fase 2 — Landing Page
- [ ] 2.1 CTA above fold
- [ ] 2.2 Social proof section
- [ ] 2.3 Demo/preview section
- [ ] 2.4 Footer complete

### Fase 3 — Dashboard Enrichment
- [ ] 3.1 Recent links card
- [ ] 3.2 Click analytics chart
- [ ] 3.3 Empty state onboarding
- [ ] 3.4 Top performing links

### Fase 4 — Mobile Experience
- [ ] 4.1 Bottom navigation
- [ ] 4.2 PWA install prompt
- [ ] 4.3 Touch gestures

### Fase 5 — Public Page
- [ ] 5.1 Theme preview
- [ ] 5.2 Layout style options
- [ ] 5.3 Link card enhancement
- [ ] 5.4 Dark mode toggle

### Fase 6 — Auth & Onboarding
- [ ] 6.1 Password strength
- [ ] 6.2 Social login
- [ ] 6.3 Error messages

### Fase 7 — Polish & Testing
- [ ] 7.1 Custom font
- [ ] 7.2 Loading states
- [ ] 7.3 Accessibility audit
- [ ] 7.4 Performance audit
- [ ] 7.5 Cross-browser testing

---

## EXPECTED OUTCOME

| Kategori | Before | After |
|----------|--------|-------|
| Design System | 7/10 | 9/10 |
| Landing Page | 6/10 | 9/10 |
| Auth Flow | 7/10 | 8/10 |
| Dashboard | 6/10 | 8.5/10 |
| Public Page | 7/10 | 9/10 |
| Components | 7/10 | 8.5/10 |
| Accessibility | 7/10 | 9/10 |
| Performance | 7/10 | 8.5/10 |
| Mobile | 5/10 | 8.5/10 |
| **TOTAL** | **6.6/10** | **8.7/10 (A-)** |

---

*Plan generated by Deva — Lead UI/UX*  
*svlink Improvement Plan — April 2026*
