export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-[#E5E4DD] rounded-2xl" />
          <div className="mt-3 space-y-2 px-1">
            <div className="h-4 bg-[#E5E4DD] rounded w-3/4" />
            <div className="h-3 bg-[#E5E4DD] rounded w-1/2" />
            <div className="h-3 bg-[#E5E4DD] rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonFeatured() {
  return (
    <div className="animate-pulse grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="sm:col-span-2">
        <div className="aspect-[4/3] bg-[#E5E4DD] rounded-2xl" />
        <div className="mt-3 space-y-2 px-1">
          <div className="h-5 bg-[#E5E4DD] rounded w-2/3" />
          <div className="h-3 bg-[#E5E4DD] rounded w-1/3" />
          <div className="h-3 bg-[#E5E4DD] rounded w-1/2" />
        </div>
      </div>
      <div className="hidden sm:block">
        <div className="aspect-[4/5] bg-[#E5E4DD] rounded-2xl" />
        <div className="mt-3 space-y-2 px-1">
          <div className="h-4 bg-[#E5E4DD] rounded w-3/4" />
          <div className="h-3 bg-[#E5E4DD] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
