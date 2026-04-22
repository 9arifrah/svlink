# SVLink — Responsive Fix Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add responsive breakpoint classes to 17 non-UI components that currently have zero or minimal responsive support, ensuring all 3 modes (desktop, tablet, mobile) render correctly.

**Architecture:** Apply Tailwind responsive breakpoint patterns (`sm:`, `md:`, `lg:`) to existing components. No structural changes — only className modifications for padding, font sizes, icon sizes, spacing, flex directions, and grid columns. Each component gets a consistent responsive treatment following the established patterns from `stats-cards.tsx` and `recent-links.tsx` (already good examples).

**Tech Stack:** Next.js 15, TypeScript, shadcn/ui, Tailwind CSS (breakpoints: sm=640px, md=768px, lg=1024px)

**Reference Patterns (from already-fixed components):**
- Padding: `p-4 sm:p-6`, `px-3 sm:px-4`, `py-2 sm:py-3`
- Font size: `text-xs sm:text-sm`, `text-sm sm:text-base`, `text-base sm:text-lg`
- Icon size: `h-4 w-4 sm:h-5 sm:w-5`, `h-5 w-5 sm:h-6 sm:w-6`
- Spacing: `gap-2 sm:gap-3`, `gap-3 sm:gap-4`, `space-y-4 sm:space-y-6`
- Flex: `flex-col sm:flex-row`, `items-center justify-between`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Heights: `h-[160px] sm:h-[200px]`
- Width: `w-full` on mobile buttons, `sm:w-auto` on desktop
- Hidden: `hidden sm:block` / `sm:hidden`

---

## Phase 1: User Dashboard Components (Highest Impact)

### Task 1.1: Make page-form.tsx responsive — Tab Navigation

**Objective:** Make the tab navigation bar responsive — smaller text, tighter padding on mobile.

**Files:**
- Modify: `components/user/page-form.tsx` (lines 206-225)

**Step 1: Update tab nav responsive classes**

Change the tab navigation from fixed to responsive:

```tsx
// Line 206: border-b
<div className="border-b border-slate-200 overflow-x-auto">

// Line 207: nav
<nav className="flex gap-0.5 sm:gap-1">

// Line 213: button className
className={cn(
  'px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
  ...
)}

// Line 220: icon+label spacing
<span className="mr-1 sm:mr-2">{tab.icon}</span>
```

**Step 2: Update form container spacing**

```tsx
// Line 204: form root spacing
<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

// Line 228: tab content min-height
<div className="min-h-[300px] sm:min-h-[400px]">
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/page-form.tsx
git commit -m "fix: make page-form tabs responsive"
```

---

### Task 1.2: Make page-form.tsx responsive — Info Tab

**Objective:** Make Info tab fields (title, slug, description, status) responsive with smaller labels, padding, and spacing.

**Files:**
- Modify: `components/user/page-form.tsx` (lines 229-348)

**Step 1: Update form field spacing**

```tsx
// Line 231: space-y-6
<div className="space-y-4 sm:space-y-6">

// Line 232: space-y-2
<div className="space-y-1.5 sm:space-y-2">

// Label (line 233): add responsive font
<Label htmlFor="title" className="text-xs sm:text-sm">

// Helper text (line 242): smaller
<p className="text-[10px] sm:text-xs text-slate-500">

// Slug row (line 247): stack on mobile
<div className="flex flex-col sm:flex-row sm:items-center gap-2">

// Slug prefix (line 248): hide or shrink on mobile
<span className="text-[10px] sm:text-sm text-slate-500 whitespace-nowrap">svlink.id/</span>
```

**Step 2: Update status toggle (line 300-347)**

```tsx
// Line 300: space-y-3
<div className="space-y-2 sm:space-y-3">

// Line 302: label
<Label className="text-xs sm:text-sm">Status</Label>

// Line 303: flex gap
<div className="flex gap-2 sm:gap-4">

// Line 304, 324: label buttons - smaller padding on mobile
className={cn(
  'flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border cursor-pointer transition-colors flex-1',
  ...
)}

// Inner indicator (line 317): smaller
className={cn(
  'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center',
  ...
)}

// Helper text (line 345): smaller
<p className="text-[10px] sm:text-xs text-slate-500">
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/page-form.tsx
git commit -m "fix: make page-form Info tab responsive"
```

---

### Task 1.3: Make page-form.tsx responsive — Links Tab

**Objective:** Make Links tab (selected links list + add link search) responsive.

**Files:**
- Modify: `components/user/page-form.tsx` (lines 351-441)

**Step 1: Update Links tab container**

```tsx
// Line 353: space-y-6
<div className="space-y-4 sm:space-y-6">

// Line 354: space-y-3
<div className="space-y-2 sm:space-y-3">

// Label
<Label className="text-xs sm:text-sm">Link Terpilih ({selectedLinks.length})</Label>

// Empty state card (line 357-362): smaller padding
<CardContent className="py-6 sm:py-8 text-center text-slate-500">
  <p className="mb-1.5 sm:mb-2 text-sm">Belum ada link dipilih</p>
  <p className="text-xs">Pilih dari daftar link di bawah</p>
</CardContent>
```

**Step 2: Update selected link items (line 365-402)**

```tsx
// Line 368: link row
className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-50 rounded-lg border"

// Icon size (line 370): smaller on mobile
<GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 cursor-grab" />

// Title text (line 372): smaller
<p className="font-medium text-slate-900 truncate text-sm">{link.title}</p>

// URL text (line 373): smaller
<p className="text-[10px] sm:text-xs text-slate-500 truncate">{link.url}</p>

// Action buttons container (line 375): tighter gap
<div className="flex items-center gap-0.5 sm:gap-1">

// Each button: smaller
className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"

// Each icon: smaller
<ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
<ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
<Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
```

**Step 3: Update add link section (line 406-439)**

```tsx
// Line 406: border-t with responsive padding
<div className="border-t pt-4 sm:pt-6 space-y-2 sm:space-y-3">

<Label className="text-xs sm:text-sm">Tambah Link</Label>

// Search icon: smaller
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />

// Available links container (line 419): smaller padding
className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border"

// Link text: smaller
<p className="font-medium text-slate-900 truncate text-sm">{link.title}</p>
<p className="text-[10px] sm:text-xs text-slate-500 truncate">{link.url}</p>

// Plus icon
<Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />

// No results text
<p className="text-xs sm:text-sm text-slate-500 text-center py-3 sm:py-4">
```

**Step 4: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 5: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/page-form.tsx
git commit -m "fix: make page-form Links tab responsive"
```

---

### Task 1.4: Make page-form.tsx responsive — Style Tab

**Objective:** Make Style tab (logo, theme color, layout selector, categories toggle) responsive.

**Files:**
- Modify: `components/user/page-form.tsx` (lines 443+)

**Step 1: Update Style tab container**

```tsx
// Line 446: space-y-6
<div className="space-y-4 sm:space-y-6">
```

**Step 2: Logo upload section (line 447-477)**

```tsx
// Line 447: space-y-3
<div className="space-y-2 sm:space-y-3">

<Label className="text-xs sm:text-sm">Logo Halaman</Label>

// Line 449: logo row
<div className="flex items-center gap-3 sm:gap-4">

// Logo image (line 455): slightly smaller on mobile
className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border"

// Delete button (line 460): smaller
className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
<X className="w-3 h-3 sm:w-4 sm:h-4" />

// Placeholder (line 466): smaller
className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed"
<ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />

// Helper text (line 477)
<p className="text-[10px] sm:text-xs text-slate-500">
```

**Step 3: Theme color section (line 480-497)**

```tsx
// Line 480: space-y-3
<div className="space-y-2 sm:space-y-3">

<Label className="text-xs sm:text-sm">Warna Tema</Label>

// Line 482: color row
<div className="flex items-center gap-2 sm:gap-3">

// Color picker button (line 486): smaller
className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 border-current flex items-center justify-center"
<div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg" />

// Hex input (line 494): narrower on mobile
className="w-24 sm:w-32 font-mono border-slate-200 text-xs sm:text-sm"

// Color swatches (line 497): tighter gap
<div className="flex flex-wrap gap-1.5 sm:gap-2">

// Each swatch: smaller on mobile
className={cn(
  'w-6 h-6 sm:w-8 sm:h-8 rounded-lg transition-transform hover:scale-110',
  ...
)}
```

**Step 4: Layout style selector**

```tsx
// Label
<Label className="text-xs sm:text-sm">Gaya Layout</Label>

// Grid (line ~510): tighter gap
<div className="grid grid-cols-3 gap-2 sm:gap-3">

// Each button (line ~515): smaller padding
className={cn(
  'p-3 sm:p-4 rounded-xl border-2 text-center transition-colors',
  ...
)}
<div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{style.icon}</div>
<div className="text-xs sm:text-sm font-medium">{style.name}</div>
```

**Step 5: Show categories toggle**

```tsx
// Label
<Label className="text-xs sm:text-sm">Tampilkan Kategori</Label>

// Toggle row
<div className="flex gap-2 sm:gap-4">

// Label buttons (same pattern as status toggle)
className={cn(
  'flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border cursor-pointer transition-colors flex-1',
  ...
)}

// Helper text
<p className="text-[10px] sm:text-xs text-slate-500">
```

**Step 6: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 7: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/page-form.tsx
git commit -m "fix: make page-form Style tab responsive"
```

---

### Task 1.5: Make page-form.tsx responsive — Preview Tab & Submit Button

**Objective:** Make Preview tab render correctly on mobile and submit button row responsive.

**Files:**
- Modify: `components/user/page-form.tsx` (lines 575+)

**Step 1: Update Preview tab**

The preview tab likely uses `PublicPageHeader` and `LinkCard` components. Wrap the preview container:

```tsx
// Preview container: full width, no overflow
<div className="overflow-hidden rounded-xl border">
  {/* existing preview content */}
</div>
```

**Step 2: Update submit button row**

```tsx
// Submit row: stack buttons on mobile
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t">
  {/* Cancel button: full width on mobile */}
  <Button variant="outline" className="w-full sm:w-auto" ...>
  {/* Submit button: full width on mobile */}
  <Button className="w-full sm:w-auto" ...>
</div>

// Error/Success messages: smaller text
{error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
{success && <p className="text-xs sm:text-sm text-green-600">✓ Berhasil!</p>}
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/page-form.tsx
git commit -m "fix: make page-form Preview tab and submit row responsive"
```

---

### Task 1.6: Make profile-forms.tsx responsive

**Objective:** Add responsive breakpoints to the profile forms (Display Name form, Password form, Delete Account form).

**Files:**
- Modify: `components/user/profile-forms.tsx` (324 lines, 0 responsive classes)

**Step 1: Read and identify all sections**

Run: `grep -n "Card\|Label\|Button\|Input\|className=" /home/ubuntu/project/svlink/components/user/profile-forms.tsx | head -50`

The component likely has:
- ProfileForm (display name)
- PasswordForm (change password)  
- DeleteAccountForm (danger zone)

**Step 2: Apply responsive patterns**

For ALL Card components in the file:
```tsx
// CardHeader padding
className="flex flex-col space-y-1.5 p-4 sm:p-6"

// CardContent padding
className="p-4 pt-0 sm:p-6"

// CardTitle font
className="text-base font-semibold sm:text-lg"
```

For ALL form fields:
```tsx
// Label
<Label className="text-xs sm:text-sm">

// Input
<Input className="text-sm" />

// Helper/description text
<p className="text-[10px] sm:text-xs text-slate-500">
```

For ALL button rows:
```tsx
// Button container
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
  <Button className="w-full sm:w-auto">Save</Button>
</div>
```

For Delete Account form specifically:
```tsx
// Warning box
<div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
  <p className="text-xs sm:text-sm text-red-800">
    ⚠️ Tindakan ini tidak bisa dibatalkan...
  </p>
</div>

// Delete confirmation input
<Input className="text-sm" placeholder="Ketik HAPUS..." />

// Delete button
<Button variant="destructive" className="w-full sm:w-auto" disabled={...}>
  Hapus Akun
</Button>
```

**Step 3: Spacing between forms**

If there's a root wrapper with space-y:
```tsx
<div className="space-y-4 sm:space-y-6">
  <ProfileForm ... />
  <PasswordForm ... />
  <DeleteAccountForm ... />
</div>
```

**Step 4: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 5: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/profile-forms.tsx
git commit -m "fix: make profile-forms responsive — all 3 form sections"
```

---

### Task 1.7: Make settings-form.tsx responsive

**Objective:** Add more responsive breakpoints to settings-form (currently only 3 breakpoints, needs comprehensive treatment).

**Files:**
- Modify: `components/user/settings-form.tsx` (569 lines, 3 responsive classes)

**Step 1: Read file to identify sections**

Run: `grep -n "Card\|Label\|Button\|Input\|Select\|Switch\|className=" /home/ubuntu/project/svlink/components/user/settings-form.tsx | head -80`

**Step 2: Apply responsive patterns**

Apply the same responsive patterns as Task 1.6:
- Card padding: `p-4 sm:p-6`
- Labels: `text-xs sm:text-sm`
- Inputs: `text-sm`
- Helper text: `text-[10px] sm:text-xs`
- Button rows: `flex-col sm:flex-row gap-2 sm:gap-3`
- Button width: `w-full sm:w-auto`
- Section spacing: `space-y-4 sm:space-y-6`
- Form field spacing: `space-y-1.5 sm:space-y-2`

**Step 3: Check for any fixed-width elements**

Look for `w-[xxx]`, `h-[xxx]`, `min-w-[xxx]` patterns and add responsive variants:
```tsx
// If there's a fixed width input
className="w-48 sm:w-64"

// If there's a fixed height container
className="h-[200px] sm:h-[300px]"
```

**Step 4: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 5: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/settings-form.tsx
git commit -m "fix: make settings-form fully responsive"
```

---

### Task 1.8: Make pages-list.tsx responsive

**Objective:** Add responsive breakpoints to the public pages list cards.

**Files:**
- Modify: `components/user/pages-list.tsx` (174 lines, 0 responsive classes)

**Step 1: Read file to understand card structure**

Run: `cat /home/ubuntu/project/svlink/components/user/pages-list.tsx`

**Step 2: Apply responsive patterns**

For card container:
```tsx
// Card root
<Card className="...">
  <CardContent className="p-3 sm:p-6">
```

For page title:
```tsx
<p className="font-semibold text-sm sm:text-base truncate">{page.title}</p>
```

For slug/link:
```tsx
<p className="text-[10px] sm:text-xs text-slate-500 truncate">svlink.id/{page.slug}</p>
```

For metadata (link count, click count):
```tsx
<div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
  <span>{page.link_count || 0} links</span>
  <span>{page.click_count || 0} klik</span>
</div>
```

For action buttons:
```tsx
// Button row
<div className="flex flex-wrap gap-1.5 sm:gap-2">
  <Button size="sm" variant="outline" className="text-xs px-2 sm:px-3">Edit</Button>
  <Button size="sm" variant="outline" className="text-xs px-2 sm:px-3">Lihat</Button>
  <Button size="sm" variant="destructive" className="text-xs px-2 sm:px-3">Hapus</Button>
</div>
```

For status badge:
```tsx
<Badge variant={page.is_active ? 'success' : 'secondary'} className="text-[10px] sm:text-xs">
  {page.is_active ? 'Aktif' : 'Nonaktif'}
</Badge>
```

For empty state:
```tsx
<CardContent className="py-8 sm:py-12 text-center">
  <h3 className="text-base sm:text-lg font-semibold mb-2">Belum ada Public Page</h3>
  <p className="text-xs sm:text-sm text-slate-500 mb-4">Buat halaman publik pertama Anda</p>
  <Button size="sm" className="text-sm">Buat Page Pertama</Button>
</CardContent>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/pages-list.tsx
git commit -m "fix: make pages-list cards responsive"
```

---

### Task 1.9: Make public-page-header.tsx responsive

**Objective:** Add responsive breakpoints to the public page header (logo, title, description).

**Files:**
- Modify: `components/user/public-page-header.tsx` (89 lines, 0 responsive classes)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/user/public-page-header.tsx`

**Step 2: Apply responsive patterns**

```tsx
// Header container: smaller padding on mobile
<header className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">

// Logo: smaller on mobile
{logoUrl && (
  <img
    src={logoUrl}
    alt="Logo"
    className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl object-cover mb-4"
  />
)}

// Title: responsive font size
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{title}</h1>

// Description: responsive
{description && (
  <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-2xl">{description}</p>
)}

// Stats row
<div className="flex flex-wrap gap-3 sm:gap-6 mt-4 sm:mt-6">
  <div className="flex items-center gap-1.5 sm:gap-2">
    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
    <span className="text-xs sm:text-sm">{clickCount || 0} views</span>
  </div>
</div>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/public-page-header.tsx
git commit -m "fix: make public-page-header responsive"
```

---

### Task 1.10: Make categories-table.tsx responsive

**Objective:** Add responsive breakpoints to the categories table — add horizontal scroll wrapper for mobile.

**Files:**
- Modify: `components/user/categories-table.tsx` (135 lines, 0 responsive classes)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/user/categories-table.tsx`

**Step 2: Add horizontal scroll wrapper**

Wrap the table in a scrollable container:

```tsx
// Table wrapper
<div className="overflow-x-auto -mx-4 sm:-mx-6">
  <div className="min-w-[600px] px-4 sm:px-6">
    <Table>
      {/* existing table content */}
    </Table>
  </div>
</div>
```

**Step 3: Make table cells responsive**

```tsx
// TableHeaderCell
<TableHead className="text-xs sm:text-sm whitespace-nowrap">

// TableBodyCell
<TableCell className="text-xs sm:text-sm">

// Action buttons in table
<div className="flex items-center gap-1 sm:gap-2">
  <Button size="sm" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
  </Button>
  <Button size="sm" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:h-4" />
  </Button>
</div>
```

**Step 4: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 5: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/categories-table.tsx
git commit -m "fix: make categories-table responsive with horizontal scroll on mobile"
```

---

### Task 1.11: Make user link-form-dialog.tsx responsive

**Objective:** Add responsive breakpoints to the user's link creation/edit dialog.

**Files:**
- Modify: `components/user/link-form-dialog.tsx` (315 lines, 1 responsive class)

**Step 1: Read file to identify form sections**

Run: `grep -n "Dialog\|Label\|Input\|Button\|className=" /home/ubuntu/project/svlink/components/user/link-form-dialog.tsx | head -40`

**Step 2: Apply responsive patterns**

The dialog uses shadcn/ui `DialogContent` which already handles responsive width. Focus on internal form layout:

```tsx
// Dialog content - ensure max-width on mobile
<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">

// Dialog header
<DialogHeader>
  <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
</DialogHeader>

// Form fields
<div className="space-y-4 sm:space-y-6 py-4">
  <div className="space-y-1.5 sm:space-y-2">
    <Label className="text-xs sm:text-sm">{label}</Label>
    <Input className="text-sm" />
    <p className="text-[10px] sm:text-xs text-slate-500">{hint}</p>
  </div>
</div>

// Dialog footer (buttons)
<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
  <Button variant="outline" className="w-full sm:w-auto">Batal</Button>
  <Button className="w-full sm:w-auto">Simpan</Button>
</DialogFooter>
```

**Step 3: Check for icon picker or category selector inside the dialog**

If there's a category dropdown or icon picker, make those responsive:

```tsx
// Category select
<SelectTrigger className="text-sm">

// Icon grid (if present)
<div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
```

**Step 4: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 5: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/link-form-dialog.tsx
git commit -m "fix: make user link-form-dialog responsive"
```

---

### Task 1.12: Make quick-create-dialog.tsx responsive

**Objective:** Add responsive breakpoints to the quick-create dialog.

**Files:**
- Modify: `components/user/quick-create-dialog.tsx` (167 lines, 1 responsive class)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/user/quick-create-dialog.tsx`

**Step 2: Apply responsive patterns**

Same pattern as link-form-dialog:

```tsx
<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle className="text-base sm:text-lg">Quick Create</DialogTitle>
  </DialogHeader>
  
  <div className="space-y-4 sm:space-y-6 py-4">
    {/* Form fields with text-sm, text-xs sm:text-sm labels */}
  </div>

  <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
    <Button variant="outline" className="w-full sm:w-auto">Batal</Button>
    <Button className="w-full sm:w-auto">Buat</Button>
  </DialogFooter>
</DialogContent>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/user/quick-create-dialog.tsx
git commit -m "fix: make quick-create-dialog responsive"
```

---

## Phase 2: Admin Components

### Task 2.1: Make admin link-form-dialog.tsx responsive

**Objective:** Add responsive breakpoints to admin link form dialog.

**Files:**
- Modify: `components/admin/link-form-dialog.tsx` (189 lines, 1 responsive class)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/admin/link-form-dialog.tsx`

**Step 2: Apply responsive patterns**

Same pattern as Task 1.11:

```tsx
<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle className="text-base sm:text-lg">...</DialogTitle>
  </DialogHeader>
  
  <div className="space-y-4 sm:space-y-6 py-4">
    {/* form fields with responsive text sizes */}
  </div>

  <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
    <Button variant="outline" className="w-full sm:w-auto">...</Button>
    <Button className="w-full sm:w-auto">...</Button>
  </DialogFooter>
</DialogContent>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/admin/link-form-dialog.tsx
git commit -m "fix: make admin link-form-dialog responsive"
```

---

### Task 2.2: Make admin user-form-dialog.tsx responsive

**Objective:** Add responsive breakpoints to admin user form dialog.

**Files:**
- Modify: `components/admin/user-form-dialog.tsx` (261 lines, 1 responsive class)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/admin/user-form-dialog.tsx`

**Step 2: Apply responsive patterns**

Same pattern as Task 1.11. The user form likely has more fields (email, role, etc.) — apply responsive patterns to all of them:

```tsx
// All labels
<Label className="text-xs sm:text-sm">

// All inputs
<Input className="text-sm" />
<SelectTrigger className="text-sm" />

// All helper text
<p className="text-[10px] sm:text-xs text-slate-500">

// All button rows
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
  <Button className="w-full sm:w-auto">...</Button>
</div>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/admin/user-form-dialog.tsx
git commit -m "fix: make admin user-form-dialog responsive"
```

---

### Task 2.3: Make admin growth-chart.tsx responsive

**Objective:** Add overflow-hidden and responsive height to the growth chart component.

**Files:**
- Modify: `components/admin/growth-chart.tsx` (107 lines, 0 responsive classes)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/admin/growth-chart.tsx`

**Step 2: Add responsive height and overflow**

```tsx
// Chart container
<div className="h-[200px] sm:h-[250px] lg:h-[300px] overflow-hidden">
  <ResponsiveContainer width="100%" height="100%">
    {/* existing chart content */}
  </ResponsiveContainer>
</div>

// Chart title
<h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Growth Chart</h3>

// If there are stats/labels below the chart
<div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-4">
  <span className="text-xs sm:text-sm text-slate-500">...</span>
</div>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/admin/growth-chart.tsx
git commit -m "fix: make admin growth-chart responsive with overflow-hidden"
```

---

### Task 2.4: Make admin delete-confirm-dialog.tsx responsive

**Objective:** Add responsive breakpoints to the delete confirmation dialog.

**Files:**
- Modify: `components/admin/delete-confirm-dialog.tsx` (52 lines, 0 responsive classes)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/admin/delete-confirm-dialog.tsx`

**Step 2: Apply responsive patterns**

```tsx
<AlertDialog>
  <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-base sm:text-lg">Konfirmasi Hapus</AlertDialogTitle>
      <AlertDialogDescription className="text-xs sm:text-sm">
        Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak bisa dibatalkan.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
      <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
      <AlertDialogAction className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
        Hapus
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/admin/delete-confirm-dialog.tsx
git commit -m "fix: make admin delete-confirm-dialog responsive"
```

---

### Task 2.5: Make admin login-form.tsx responsive

**Objective:** Add responsive breakpoints to admin login form.

**Files:**
- Modify: `components/admin/login-form.tsx` (110 lines, 0 responsive classes)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/admin/login-form.tsx`

**Step 2: Apply responsive patterns**

```tsx
// Form container
<div className="w-full max-w-md mx-auto px-4 sm:px-0">

// Title
<h1 className="text-xl sm:text-2xl font-bold text-center mb-2">Admin Login</h1>
<p className="text-xs sm:text-sm text-slate-500 text-center mb-6 sm:mb-8">
  Masukkan kredensial admin Anda
</p>

// Form fields
<div className="space-y-3 sm:space-y-4">
  <div className="space-y-1.5 sm:space-y-2">
    <Label className="text-xs sm:text-sm">Email</Label>
    <Input className="text-sm" />
  </div>
  <div className="space-y-1.5 sm:space-y-2">
    <Label className="text-xs sm:text-sm">Password</Label>
    <Input className="text-sm" type="password" />
  </div>
</div>

// Login button
<Button className="w-full mt-4 sm:mt-6" size="lg">
  Login
</Button>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/admin/login-form.tsx
git commit -m "fix: make admin login-form responsive"
```

---

## Phase 3: Auth & Shared Components

### Task 3.1: Make auth login-form.tsx responsive

**Objective:** Add responsive breakpoints to the user login form.

**Files:**
- Modify: `components/auth/login-form.tsx` (157 lines, 0 responsive classes)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/auth/login-form.tsx`

**Step 2: Apply responsive patterns**

```tsx
// Card container
<Card className="w-full max-w-md mx-4 sm:mx-0">
  <CardHeader className="p-4 sm:p-6">
    <CardTitle className="text-lg sm:text-xl text-center">Login ke svlink</CardTitle>
  </CardHeader>
  <CardContent className="p-4 pt-0 sm:p-6">
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-xs sm:text-sm">Email</Label>
        <Input className="text-sm" />
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-xs sm:text-sm">Password</Label>
        <Input className="text-sm" type="password" />
      </div>
    </div>
    <Button className="w-full mt-4 sm:mt-6" size="lg">Login</Button>
    
    {/* Register link */}
    <p className="text-center text-xs sm:text-sm text-slate-500 mt-4">
      Belum punya akun? <Link href="/register" className="text-brand-600 hover:underline">Daftar</Link>
    </p>
  </CardContent>
</Card>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/auth/login-form.tsx
git commit -m "fix: make auth login-form responsive"
```

---

### Task 3.2: Make auth register-form.tsx responsive

**Objective:** Add responsive breakpoints to the user registration form.

**Files:**
- Modify: `components/auth/register-form.tsx` (238 lines, 0 responsive classes)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/auth/register-form.tsx`

**Step 2: Apply responsive patterns**

Same pattern as login-form. Register form has additional fields (displayName, confirmPassword):

```tsx
<Card className="w-full max-w-md mx-4 sm:mx-0">
  <CardHeader className="p-4 sm:p-6">
    <CardTitle className="text-lg sm:text-xl text-center">Daftar Akun Baru</CardTitle>
  </CardHeader>
  <CardContent className="p-4 pt-0 sm:p-6">
    <div className="space-y-3 sm:space-y-4">
      {/* Each field group */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-xs sm:text-sm">Display Name</Label>
        <Input className="text-sm" />
      </div>
      {/* ... repeat for email, password, confirmPassword */}
    </div>
    <Button className="w-full mt-4 sm:mt-6" size="lg">Daftar</Button>
    
    <p className="text-center text-xs sm:text-sm text-slate-500 mt-4">
      Sudah punya akun? <Link href="/login" className="text-brand-600 hover:underline">Login</Link>
    </p>
  </CardContent>
</Card>
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/auth/register-form.tsx
git commit -m "fix: make auth register-form responsive"
```

---

### Task 3.3: Make shared icon-picker.tsx responsive

**Objective:** Add responsive grid and spacing to the icon picker component.

**Files:**
- Modify: `components/shared/icon-picker.tsx` (139 lines, 0 responsive classes)

**Step 1: Read file**

Run: `cat /home/ubuntu/project/svlink/components/shared/icon-picker.tsx`

**Step 2: Apply responsive patterns**

```tsx
// Icon grid
<div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
  {icons.map(icon => (
    <button
      key={icon.name}
      className={cn(
        'flex items-center justify-center p-2 sm:p-3 rounded-lg border transition-colors',
        selected ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
      )}
    >
      <icon.component className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  ))}
</div>

// Search bar
<div className="relative mb-3 sm:mb-4">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
  <Input className="pl-10 text-sm" placeholder="Cari icon..." />
</div>

// Selected icon preview
{selected && (
  <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 p-2 sm:p-3 bg-slate-50 rounded-lg">
    <selectedIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-600" />
    <span className="text-xs sm:text-sm font-medium">{selected.name}</span>
  </div>
)}
```

**Step 3: Verify TypeScript**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors

**Step 4: Commit**

```bash
cd /home/ubuntu/project/svlink && git add components/shared/icon-picker.tsx
git commit -m "fix: make shared icon-picker responsive with responsive grid"
```

---

## Phase 4: Final Verification & Build

### Task 4.1: Full TypeScript check

**Objective:** Ensure no TypeScript errors across all modified files.

**Step 1: Run TypeScript check**

Run: `cd /home/ubuntu/project/svlink && npx tsc --noEmit 2>&1`

Expected: 0 new errors. Pre-existing lint warnings are acceptable.

**Step 2: If errors found, fix them**

Common issues:
- Mismatched parentheses/brackets from className edits
- Missing imports (unlikely since we only modify classNames)

---

### Task 4.2: Full build check

**Objective:** Ensure the app builds successfully.

**Step 1: Run build**

Run: `cd /home/ubuntu/project/svlink && npm run build 2>&1 | tail -15`

Expected: Build succeeds with no errors.

**Step 2: Check build output**

Look for:
- ✓ Compiled successfully
- No "Type error" messages
- Route summaries are normal

---

### Task 4.3: Deploy and smoke test

**Objective:** Deploy to PM2 and verify basic functionality.

**Step 1: Restart PM2**

```bash
pm2 restart svlink --update-env && sleep 3
curl -s http://localhost:3000/dashboard -o /dev/null -w "Dashboard: %{http_code}\n"
```

Expected: Dashboard returns 200

**Step 2: Test key pages**

```bash
curl -s http://localhost:3000/login -o /dev/null -w "Login: %{http_code}\n"
curl -s http://localhost:3000/register -o /dev/null -w "Register: %{http_code}\n"
curl -s http://localhost:3000/dashboard/pages -o /dev/null -w "Pages: %{http_code}\n"
curl -s http://localhost:3000/dashboard/settings -o /dev/null -w "Settings: %{http_code}\n"
```

Expected: All return 200

---

## Summary Checklist

| Phase | Task | Component | Lines | Expected Responsive Classes | Status |
|-------|------|-----------|-------|---------------------------|--------|
| 1 | 1.1 | page-form (tabs) | 679 | ~8 | 🔲 |
| 1 | 1.2 | page-form (Info tab) | 679 | ~15 | 🔲 |
| 1 | 1.3 | page-form (Links tab) | 679 | ~20 | 🔲 |
| 1 | 1.4 | page-form (Style tab) | 679 | ~20 | 🔲 |
| 1 | 1.5 | page-form (Preview + submit) | 679 | ~10 | 🔲 |
| 1 | 1.6 | profile-forms | 324 | ~25 | 🔲 |
| 1 | 1.7 | settings-form | 569 | ~20 | 🔲 |
| 1 | 1.8 | pages-list | 174 | ~15 | 🔲 |
| 1 | 1.9 | public-page-header | 89 | ~8 | 🔲 |
| 1 | 1.10 | categories-table | 135 | ~10 | 🔲 |
| 1 | 1.11 | link-form-dialog (user) | 315 | ~15 | 🔲 |
| 1 | 1.12 | quick-create-dialog | 167 | ~10 | 🔲 |
| 2 | 2.1 | link-form-dialog (admin) | 189 | ~15 | 🔲 |
| 2 | 2.2 | user-form-dialog | 261 | ~15 | 🔲 |
| 2 | 2.3 | growth-chart | 107 | ~5 | 🔲 |
| 2 | 2.4 | delete-confirm-dialog | 52 | ~5 | 🔲 |
| 2 | 2.5 | admin login-form | 110 | ~10 | 🔲 |
| 3 | 3.1 | auth login-form | 157 | ~12 | 🔲 |
| 3 | 3.2 | auth register-form | 238 | ~15 | 🔲 |
| 3 | 3.3 | icon-picker | 139 | ~10 | 🔲 |
| 4 | 4.1 | TypeScript check | - | - | 🔲 |
| 4 | 4.2 | Build check | - | - | 🔲 |
| 4 | 4.3 | Deploy + smoke test | - | - | 🔲 |

---

## Consistent Responsive Pattern Reference

Every component should follow these patterns:

```tsx
// === PADDING ===
<CardHeader className="p-4 sm:p-6">
<CardContent className="p-4 pt-0 sm:p-6">
<CardFooter className="p-4 pt-0 sm:p-6">

// === TEXT SIZES ===
<Label className="text-xs sm:text-sm">
<p className="text-sm sm:text-base">
<h2 className="text-base sm:text-lg">
<h1 className="text-lg sm:text-xl">
<p className="text-[10px] sm:text-xs text-slate-500">  // helper text

// === ICON SIZES ===
<Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />  // small icons
<Icon className="h-4 w-4 sm:h-5 sm:w-5" />       // medium icons
<Icon className="h-5 w-5 sm:h-6 sm:w-6" />        // large icons

// === SPACING ===
<div className="space-y-4 sm:space-y-6">  // section spacing
<div className="space-y-1.5 sm:space-y-2">  // field spacing
<div className="gap-2 sm:gap-3">  // flex gap
<div className="gap-3 sm:gap-4">  // larger flex gap

// === FLEX LAYOUTS ===
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
<div className="flex items-center gap-2 sm:gap-3">

// === BUTTONS ===
<Button className="w-full sm:w-auto">  // full width on mobile

// === GRID ===
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// === HEIGHTS ===
<div className="h-[200px] sm:h-[250px] lg:h-[300px]">

// === OVERFLOW ===
<div className="overflow-x-auto">  // for tables
<div className="overflow-hidden">  // for charts
```

---

## File Map

### Files to Modify (17 files):
- `components/user/page-form.tsx` (679 lines) — 5 tasks (tabs, info, links, style, preview)
- `components/user/profile-forms.tsx` (324 lines) — 1 task
- `components/user/settings-form.tsx` (569 lines) — 1 task
- `components/user/pages-list.tsx` (174 lines) — 1 task
- `components/user/public-page-header.tsx` (89 lines) — 1 task
- `components/user/categories-table.tsx` (135 lines) — 1 task
- `components/user/link-form-dialog.tsx` (315 lines) — 1 task
- `components/user/quick-create-dialog.tsx` (167 lines) — 1 task
- `components/admin/link-form-dialog.tsx` (189 lines) — 1 task
- `components/admin/user-form-dialog.tsx` (261 lines) — 1 task
- `components/admin/growth-chart.tsx` (107 lines) — 1 task
- `components/admin/delete-confirm-dialog.tsx` (52 lines) — 1 task
- `components/admin/login-form.tsx` (110 lines) — 1 task
- `components/auth/login-form.tsx` (157 lines) — 1 task
- `components/auth/register-form.tsx` (238 lines) — 1 task
- `components/shared/icon-picker.tsx` (139 lines) — 1 task

### No New Files Created
All changes are className modifications to existing files. No new components, no new API routes, no database changes.
