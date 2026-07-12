import { Skeleton } from "@/components/ui/skeleton";

export default function HabitosLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-44 rounded-2xl" />
    </div>
  );
}
