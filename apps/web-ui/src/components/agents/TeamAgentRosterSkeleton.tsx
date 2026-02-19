/**
 * TeamAgentRosterSkeleton Component
 * Story 3.2: Agent Roster Display
 *
 * Loading skeleton for the agent roster page
 */

import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TeamAgentRosterSkeleton() {
  return (
    <div className="w-full">
      {/* Header with Back Button and Team Info */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled
          aria-label="Back to Teams"
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="size-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Skeleton className="h-11 w-full" />
      </div>

      {/* Filter Chips */}
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
