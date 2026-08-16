import React from 'react';

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-800/60 rounded-md ${className}`}></div>
  );
}

export function RepoCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-gray-800/80 bg-gray-900/10 flex flex-col justify-between h-[190px] animate-pulse">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6 mt-2" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/5" />
      </div>
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-antigravity-border pb-6">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-1/4 mt-2" />
        </div>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-5 border border-antigravity-border bg-antigravity-panel rounded-xl space-y-4">
            <Skeleton className="h-5 w-1/2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
          <div className="p-5 border border-antigravity-border bg-antigravity-panel rounded-xl space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 border border-antigravity-border bg-antigravity-panel rounded-xl h-[300px]">
            <Skeleton className="h-5 w-1/4 mb-6" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
          <div className="p-5 border border-antigravity-border bg-antigravity-panel rounded-xl h-[280px]">
            <Skeleton className="h-5 w-1/4 mb-6" />
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
