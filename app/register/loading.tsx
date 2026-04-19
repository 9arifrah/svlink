import { Skeleton } from '@/components/ui/skeleton'

export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-accent-50/20 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo + title skeleton */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-2xl" />
          <Skeleton className="mx-auto h-8 w-56" />
          <Skeleton className="mx-auto mt-2 h-5 w-64" />
        </div>

        {/* Form skeleton */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Links skeleton */}
        <div className="mt-6 flex justify-center">
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>
  )
}
