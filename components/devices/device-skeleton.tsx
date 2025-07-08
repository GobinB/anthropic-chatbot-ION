'use client'

export function DeviceCardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
          <div className="h-5 w-12 bg-gray-300 rounded-full"></div>
        </div>
        <div className="text-right">
          <div className="h-3 w-12 bg-gray-300 rounded mb-1"></div>
          <div className="h-4 w-8 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Serial Number */}
      <div className="mb-3">
        <div className="h-3 w-20 bg-gray-300 rounded mb-1"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* Location Info */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="h-3 w-16 bg-gray-300 rounded mb-1"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
        </div>
        <div>
          <div className="h-3 w-14 bg-gray-300 rounded mb-1"></div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
        </div>
        <div>
          <div className="h-3 w-12 bg-gray-300 rounded mb-1"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className="h-3 w-10 bg-gray-300 rounded mb-1"></div>
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
      </div>

      {/* Button */}
      <div className="h-8 w-full bg-gray-300 rounded-md"></div>
    </div>
  )
}

export function DeviceListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 animate-pulse">
            <div className="h-4 w-16 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 w-8 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(count)].map((_, i) => (
          <DeviceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}