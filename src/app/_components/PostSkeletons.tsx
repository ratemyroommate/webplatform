import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

const SkeletonCard = () => (
  <Card className="gap-0 overflow-hidden p-0">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  </Card>
);

export const PostSkeletons = () => (
  <>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </>
);
