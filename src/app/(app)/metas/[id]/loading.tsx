import { Skeleton } from "@/components/ui/skeleton";

export default function GoalDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
