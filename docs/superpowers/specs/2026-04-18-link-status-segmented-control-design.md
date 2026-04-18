# Link Status Segmented Control - Design Specification

**Date:** 2026-04-18
**Author:** AI Assistant (via Brainstorming)
**Status:** Approved

---

## 1. Overview

**Purpose:** Replace the current dual-toggle system (Status + Visibilitas) with a single, intuitive Segmented Control for link status management.

**Problem:** The current UI uses two ambiguous toggles ("Status" and "Visibilitas") that cause user confusion due to overlapping functionality and unclear labels.

**Solution:** A 3-option Segmented Control that clearly communicates who can access the link.

---

## 2. Design Specification

### 2.1 Component: LinkStatusSegmentedControl

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Status Link                                            │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   🌍        │  │    🔒       │  │    📝       │    │
│  │  Publik    │  │  Privat    │  │   Draft     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         ▲                                          ▲     │
│         │──────── Selected (biru) ─────────────────│     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Visual States

| State | Background | Text | Border |
|-------|------------|------|--------|
| Default (unselected) | `bg-slate-100` | `text-slate-600` | `border-transparent` |
| Selected | `bg-blue-600` | `text-white` | subtle shadow |
| Hover (unselected) | `hover:bg-slate-200` | - | - |

### 2.3 Segments

| Segment | Icon | Description |
|---------|------|-------------|
| **Publik** | 🌍 | "Tampil di halaman profil Anda. Short link & QR code berfungsi untuk semua orang." |
| **Privat** | 🔒 | "Hanya Anda yang bisa melihat link ini. Short link & QR code tetap berfungsi untuk Anda." |
| **Draft** | 📝 | "Link disimpan sebagai draft. Short link & QR code tidak berfungsi untuk siapapun." |

---

## 3. Data Model

### 3.1 Link Status Types

```typescript
type LinkStatus = 'public' | 'private' | 'draft'
```

### 3.2 Database Mapping

| Status | is_public | is_active | Behavior |
|--------|-----------|-----------|----------|
| **public** | `true` | `true` | Link appears on profile, short link & QR work for everyone |
| **private** | `false` | `true` | Link hidden from profile, short link & QR work for owner only |
| **draft** | `false` | `false` | Link hidden from profile, short link & QR return 404 |

### 3.3 Helper Functions

```typescript
function linkStatusToFlags(status: LinkStatus): { is_public: boolean, is_active: boolean } {
  switch (status) {
    case 'public': return { is_public: true, is_active: true }
    case 'private': return { is_public: false, is_active: true }
    case 'draft': return { is_public: false, is_active: false }
  }
}

function flagsToLinkStatus(is_public: boolean, is_active: boolean): LinkStatus {
  if (is_public && is_active) return 'public'
  if (!is_public && is_active) return 'private'
  return 'draft'
}
```

---

## 4. Interaction Specification

### 4.1 User Flow

1. User opens link form dialog
2. User sees Segmented Control with 3 options
3. User clicks desired segment
4. Selected segment highlights immediately (no confirmation needed)
5. Description text updates below segments
6. User fills other fields (title, URL, etc.)
7. User clicks "Simpan Link"
8. Form submits with `status` field

### 4.2 Form Behavior

- Default status when creating new link: `public`
- When editing existing link: convert `is_public` + `is_active` to `status` and pre-select
- Form validation: all statuses are valid, no validation needed on status field

---

## 5. Implementation Details

### 5.1 Files to Modify

| File | Changes |
|------|---------|
| `components/user/link-form-dialog.tsx` | Replace 2 Switch components with Segmented Control |
| `components/user/link-status-segmented-control.tsx` | Create new segmented control component |
| `AGENTS.md` | Update documentation to reflect new feature |

### 5.2 Component API

```typescript
type LinkStatusSegmentedControlProps = {
  value: 'public' | 'private' | 'draft'
  onChange: (status: 'public' | 'private' | 'draft') => void
}
```

### 5.3 Usage in Form

```tsx
<LinkStatusSegmentedControl
  value={formData.status}
  onChange={(status) => setFormData({ ...formData, status })}
/>
```

---

## 6. Technical Notes

- Use shadcn/ui `Tabs` or custom implementation with `button` elements
- Ensure keyboard navigation support (arrow keys to switch segments)
- Mobile-responsive: segments should stack or scroll on small screens
- Include ARIA labels for accessibility

---

## 7. Testing Checklist

- [ ] Click each segment → visual state changes correctly
- [ ] Select Public → link appears on profile, short link & QR work
- [ ] Select Private → link hidden from profile, short link & QR work
- [ ] Select Draft → link hidden from profile, short link & QR return 404
- [ ] Form submits correctly with status field
- [ ] Edit existing link → correct status is pre-selected
- [ ] Create new link → default status is `public`
- [ ] Keyboard navigation works (arrow keys)
- [ ] Mobile view displays correctly

---

## 8. Related Documentation

- Previous toggle implementation: `components/user/link-form-dialog.tsx`
- Link creation API: `app/api/links/route.ts`
- Link entity type: `lib/supabase.ts`

---

## 9. Approval

- [x] Design approved by user
- [ ] Implementation completed
- [ ] Tested and verified
