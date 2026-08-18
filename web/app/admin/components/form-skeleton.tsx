import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="w-full max-w-sm" aria-busy="true" aria-live="polite">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="mt-8 flex flex-col gap-5 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <Skeleton className="mx-auto mt-6 h-4 w-36" />
    </div>
  );
}
