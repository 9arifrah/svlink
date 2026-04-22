# Unified Login — Merge Admin & User Auth Plan

**Tanggal:** April 22, 2026
**Scope:** Merge `/admin/login` dan `/login` menjadi single login dengan role-based routing
**Prinsip:** Zero breaking changes, backward compatible transition, semua admin API tetap secure

---

## 🎯 Goal

Satu halaman login (`/login`) untuk semua user. Setelah login:
- **User biasa** → redirect ke `/dashboard`
- **Admin** → redirect ke `/admin/dashboard` (atau `/dashboard` dengan admin sidebar link)

Satu cookie: `svlink_session` (menggantikan `user_session` + `admin_session`).

---

## 📊 Context: Current State

**JWT payload SUDAH punya `isAdmin: boolean`** — ini kunci!
```typescript
interface SessionPayload {
  userId: string
  isAdmin: boolean  // ← sudah ada!
  iat: number
  exp: number;
}
```

**Saat ini:**
- `/login` → `POST /api/auth/login` → set `user_session` cookie (isAdmin: false)
- `/admin/login` → `POST /api/admin/login` → set `admin_session` cookie (isAdmin: true)
- Admin pages pakai `getVerifiedAdminSession()` → baca `admin_session` + DB check
- User pages pakai `getUserSession()` → baca `user_session`

**Yang berubah:** Cookie name (unified → `svlink_session`), satu login endpoint, redirect logic
**Yang TIDAK berubah:** DB verification (`getVerifiedAdminSession`), admin API routes, middleware

---

## 📋 Step-by-Step Plan

### Step 1: Unify Session Management di `lib/auth.ts`

**Tujuan:** Satu fungsi untuk set/get session, satu cookie name.

**Perubahan di `lib/auth.ts`:**
```typescript
// Cookie name baru — unified
const SESSION_COOKIE = 'svlink_session'

// Fungsi unified — set session dengan isAdmin flag dari DB
export async function setUnifiedSession(userId: string, maxAge: number = 60 * 60 * 24 * 7) {
  const isAdmin = await db.isAdminUser(userId)  // check DB
  const token = await createSessionToken(userId, isAdmin)
  const cookieStore = await cookies()
  
  // Set unified cookie
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: false, sameSite: 'lax', maxAge, path: '/'
  })
}

// Fungsi unified — get session dari single cookie
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session) return null
  return await verifySessionToken(session.value)
}

// getVerifiedAdminSession — tetap sama, tapi pakai unified cookie
export async function getVerifiedAdminSession(): Promise<SessionPayload | null> {
  const payload = await getSession()  // ← changed: was getAdminSession()
  if (!payload) return null
  if (!payload.isAdmin) return null
  
  // Double-check di DB
  const isAdmin = await verifyAdminAccess(payload.userId)
  if (!isAdmin) return null
  return payload
}

// Backward compatibility — tetap ada tapi pakai unified cookie
export async function getUserSession() { return getSession() }
export async function getAdminSession() { return getSession() }  // ← changed
export async function setUserSession(userId: string, maxAge: number) { 
  return setUnifiedSession(userId, maxAge) 
}
export async function setAdminSession(userId: string, maxAge: number) { 
  return setUnifiedSession(userId, maxAge)  // ← now same as user
}
export async function clearUserSession() { 
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete('user_session')  // cleanup old cookie
  cookieStore.delete('admin_session') // cleanup old cookie
}
export async function clearAdminSession() { return clearUserSession() }  // ← now same
```

### Step 2: Update User Login (`/api/auth/login`)

**Tujuan:** Satu endpoint untuk semua login, handle suspend/lock + redirect info.

**Perubahan di `app/api/auth/login/route.ts`:**
```typescript
// Setelah successful login:
await setUnifiedSession(user.id, maxAge)  // ← otomatis set isAdmin flag dari DB

return NextResponse.json({
  success: true,
  redirect: isAdmin ? '/admin/dashboard' : '/dashboard',  // ← return redirect info
  user: { id, email, display_name, isAdmin }
})
```

**Catatan:** Failed login tracking dan suspend/lock checks sudah ada, tidak perlu diubah.

### Step 3: Hapus Admin Login Endpoint & Page

**File yang dihapus:**
- `app/api/admin/login/route.ts` — tidak diperlukan lagi
- `app/admin/login/page.tsx` — tidak diperlukan lagi
- `components/admin/login-form.tsx` — tidak diperlukan lagi

**File yang dipertahankan:**
- `app/api/admin/logout/route.ts` — tetap ada (untuk explicit admin logout, tapi bisa redirect ke unified logout)

### Step 4: Update Admin Pages Auth

**Semua admin pages** (`app/admin/*/page.tsx`) sudah pakai `getVerifiedAdminSession()` dari `lib/admin-auth.ts`.

**Perubahan di `lib/admin-auth.ts`:**
```typescript
import { getSession, type SessionPayload } from './auth'

export async function getVerifiedAdminSession(): Promise<SessionPayload | null> {
  const payload = await getSession()  // ← changed: was getAdminSession()
  if (!payload || !payload.isAdmin) return null
  const isAdmin = await verifyAdminAccess(payload.userId)
  if (!isAdmin) return null
  return payload
}
```

**Admin page pages** (`app/admin/*/page.tsx`) — NO CHANGES needed, karena sudah pakai `getVerifiedAdminSession()`.

### Step 5: Update Middleware

**Perubahan di `middleware.ts`:**
```typescript
async function isAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('svlink_session')?.value  // ← changed cookie name
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.isAdmin === true
  } catch {
    return false
  }
}
```

### Step 6: Update Logout

**Perubahan di `app/api/auth/logout/route.ts`:**
```typescript
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('svlink_session')    // unified cookie
  cookieStore.delete('user_session')      // cleanup old
  cookieStore.delete('admin_session')     // cleanup old
  return NextResponse.json({ success: true })
}
```

**`app/api/admin/logout/route.ts`** — bisa dihapus atau redirect ke unified logout.

### Step 7: Update User Dashboard Redirect

**Perubahan di `app/dashboard/page.tsx`** (jika ada redirect untuk non-auth):
- Tidak perlu diubah — `getUserSession()` sudah backward compatible

### Step 8: Update Admin Sidebar untuk User Admin

**Perubahan di `components/user/dashboard-sidebar.tsx`:**
- Jika user adalah admin, tambahkan link ke "Admin Panel" di sidebar user
- Ini memungkinkan admin yang login via `/login` untuk akses `/admin/*`

```typescript
// Di sidebar user:
if (session?.isAdmin) {
  navigation.push({ name: 'Admin Panel', href: '/admin/dashboard', icon: Shield })
}
```

---

## 📁 File Changes Summary

| File | Action | Reason |
|------|--------|--------|
| `lib/auth.ts` | **MODIFY** | Unified session functions, single cookie |
| `lib/admin-auth.ts` | **MODIFY** | Use `getSession()` instead of `getAdminSession()` |
| `app/api/auth/login/route.ts` | **MODIFY** | Return redirect + isAdmin in response |
| `app/api/auth/logout/route.ts` | **MODIFY** | Clear unified + old cookies |
| `middleware.ts` | **MODIFY** | Use `svlink_session` cookie |
| `app/api/admin/login/route.ts` | **DELETE** | No longer needed |
| `app/admin/login/page.tsx` | **DELETE** | No longer needed |
| `components/admin/login-form.tsx` | **DELETE** | No longer needed |
| `app/api/admin/logout/route.ts` | **DELETE or MODIFY** | Redirect to unified logout |
| `components/user/dashboard-sidebar.tsx` | **MODIFY** | Add Admin Panel link for admins |
| `app/admin/dashboard/page.tsx` | NO CHANGE | Already uses `getVerifiedAdminSession()` |
| All `app/admin/*/page.tsx` | NO CHANGE | Already use `getVerifiedAdminSession()` |
| All `app/api/admin/*/route.ts` | NO CHANGE | Already use `getVerifiedAdminSession()` |

---

## 🧪 Testing Checklist

- [ ] User biasa login → redirect ke `/dashboard` ✓
- [ ] Admin login → redirect ke `/admin/dashboard` ✓
- [ ] Admin bisa akses `/dashboard` (user view) ✓
- [ ] User biasa coba akses `/admin/dashboard` → redirect ke `/login` ✓
- [ ] Admin bisa akses `/admin/dashboard` ✓
- [ ] Logout clear semua cookie ✓
- [ ] Suspended user tidak bisa login ✓
- [ ] Locked user (failed login) tidak bisa login ✓
- [ ] Admin API routes tetap secure (DB check) ✓
- [ ] Middleware maintenance mode masih bekerja ✓
- [ ] Old `user_session` / `admin_session` cookies dibersihkan ✓

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Session invalidation saat deploy | Medium | Old cookies tetap di-clear, user perlu login ulang |
| Admin API routes broken | High | `getVerifiedAdminSession()` tetap return null jika tidak admin |
| Race condition pada cookie set | Low | Sequential cookie operations |
| Old bookmarks `/admin/login` | Low | Redirect `/admin/login` → `/login` di next.config.js |

---

## 🔄 Migration Strategy

1. **Deploy unified auth** — new code handles both old and new cookie names
2. **User login ulang** — session akan di-create dengan cookie baru
3. **Cleanup** — setelah semua user login ulang, old cookie references bisa dihapus
4. **Redirect** — `/admin/login` → `/login` untuk backward compatibility

---

## 💡 Notes

- JWT payload `isAdmin` sudah ada — ini berarti infrastructur SUDAH READY
- `getVerifiedAdminSession()` selalu check DB — ini security layer yang TIDAK BERUBAH
- Cookie name change dari `user_session`/`admin_session` → `svlink_session`
- Semua admin pages dan API routes **tidak perlu diubah** karena pakai abstraction layer
- Estimated timeline: 2-3 jam implementasi
