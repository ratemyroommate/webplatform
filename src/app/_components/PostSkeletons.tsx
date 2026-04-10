const SkeletonCard = () => (
  <div className="card bg-base-100 overflow-hidden shadow-xl">
    <div className="skeleton aspect-[4/3] w-full rounded-none" />
    <div className="flex flex-col gap-3 p-4">
      {/* Avatar row */}
      <div className="flex items-center gap-2">
        <div className="skeleton h-8 w-8 rounded-full" />
        <div className="skeleton h-8 w-8 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
      {/* Badges */}
      <div className="flex gap-1.5">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

export const PostSkeletons = () => (
  <>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </>
);
