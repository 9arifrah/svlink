'use client'

import { cn } from '@/lib/utils'

type LinkStatus = 'public' | 'private' | 'draft'

type LinkStatusSegmentedControlProps = {
  value: LinkStatus
  onChange: (status: LinkStatus) => void
}

const segments: { value: LinkStatus; label: string; icon: string; description: string }[] = [
  {
    value: 'public',
    label: 'Publik',
    icon: '🌍',
    description: 'Tampil di halaman profil Anda. Short link & QR code berfungsi untuk semua orang.'
  },
  {
    value: 'private',
    label: 'Privat',
    icon: '🔒',
    description: 'Hanya Anda yang bisa melihat link ini. Short link & QR code tetap berfungsi untuk Anda.'
  },
  {
    value: 'draft',
    label: 'Draft',
    icon: '📝',
    description: 'Link disimpan sebagai draft. Short link & QR code tidak berfungsi untuk siapapun.'
  }
]

export function LinkStatusSegmentedControl({ value, onChange }: LinkStatusSegmentedControlProps) {
  const selectedSegment = segments.find(s => s.value === value)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Status Link</span>
      </div>

      <div className="flex gap-1.5">
        {segments.map((segment) => (
          <button
            key={segment.value}
            type="button"
            onClick={() => onChange(segment.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              value === segment.value
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            )}
          >
            <span className="text-base">{segment.icon}</span>
            <span className="hidden sm:inline">{segment.label}</span>
            <span className="sm:hidden text-xs">{segment.label.charAt(0)}</span>
          </button>
        ))}
      </div>

      {selectedSegment && (
        <p className="text-xs text-slate-500 px-1">
          {selectedSegment.description}
        </p>
      )}
    </div>
  )
}

export function linkStatusToFlags(status: LinkStatus): { is_public: boolean; is_active: boolean } {
  switch (status) {
    case 'public':
      return { is_public: true, is_active: true }
    case 'private':
      return { is_public: false, is_active: true }
    case 'draft':
      return { is_public: false, is_active: false }
  }
}

export function flagsToLinkStatus(is_public: boolean, is_active: boolean): LinkStatus {
  if (is_public && is_active) return 'public'
  if (!is_public && is_active) return 'private'
  return 'draft'
}