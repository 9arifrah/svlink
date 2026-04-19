import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="rounded-lg border border-slate-200/60 p-6 space-y-6">
        {/* Profile section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Theme section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
        {/* Save button */}
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  )
}
