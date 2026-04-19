import { LinksTableSkeleton } from '@/components/user/links-table-skeleton'

export default function LinksLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <LinksTableSkeleton />
    </div>
  )
}
