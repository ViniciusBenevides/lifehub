import { Skeleton } from "@/components/ui/skeleton";

export default function AtividadesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-9 w-56 rounded-full" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
