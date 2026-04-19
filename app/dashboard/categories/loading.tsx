import { Skeleton } from '@/components/ui/skeleton'

export default function CategoriesLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="rounded-lg border border-slate-200/60">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-5 w-32" />
              <div className="ml-auto">
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
