"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchRooms, type RoomCard } from "@/lib/api";
import {
  parseSearchParams,
  filtersToSearchParams,
  filtersToApiQuery,
  cityName,
  type RoomFilters,
} from "@/lib/search-params";
import { FiltersForm } from "./filters-form";
import { RoomRow } from "./room-row";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RiFilter3Line } from "@remixicon/react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuth } from "@/lib/auth/auth-provider";

export function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const { status: authStatus, firebaseUser } = useAuth();

  const filters = parseSearchParams(searchParams);
  // The URL updates on every keystroke; the API is queried once typing pauses
  // (guests are limited to 60 searches a minute).
  // Debounce the serialized params (a stable string) to avoid re-render loops.
  const debouncedParams = useDebouncedValue(searchParams.toString(), 400);
  const queryFilters = parseSearchParams(new URLSearchParams(debouncedParams));

  const updateFilters = (nextFilters: RoomFilters) => {
    const params = filtersToSearchParams(nextFilters);
    const qs = params.toString();
    router.replace(`/rooms${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleClearFilters = () => {
    updateFilters({
      city: filters.city,
      roomType: [],
      amenities: [],
    });
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    // Results carry a per-user isFavorite flag: key by user, wait for auth to settle.
    queryKey: ["rooms", queryFilters, firebaseUser?.uid ?? "guest"],
    enabled: authStatus !== "loading",
    queryFn: async ({ pageParam }) => {
      const apiQuery = filtersToApiQuery(queryFilters);
      return await searchRooms({
        ...apiQuery,
        cursor: pageParam,
        limit: 12,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && typeof lastPage.nextCursor === "string") {
        return lastPage.nextCursor;
      }
      return undefined;
    },
  });

  const allRooms: RoomCard[] = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? allRooms.length;
  const currentCityName = cityName(filters.city);

  // Count active non-default filters
  let activeFiltersCount = 0;
  if (filters.q) activeFiltersCount++;
  if (filters.minRent !== undefined) activeFiltersCount++;
  if (filters.maxRent !== undefined) activeFiltersCount++;
  if (filters.roomType.length > 0) activeFiltersCount += filters.roomType.length;
  if (filters.genderPolicy) activeFiltersCount++;
  if (filters.amenities.length > 0) activeFiltersCount += filters.amenities.length;
  if (filters.tenancyType) activeFiltersCount++;
  if (filters.food) activeFiltersCount++;
  if (filters.sort && filters.sort !== "newest") activeFiltersCount++;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Top Bar for Mobile: Filters button & summary */}
      <div className="flex lg:hidden items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-title font-bold text-ink">
            Rooms in {currentCityName}
          </h1>
          <p className="text-caption text-muted-ink">
            {isLoading ? "Searching..." : `${total} ${total === 1 ? "room" : "rooms"}`}
          </p>
        </div>

        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-control-border text-ink"
              />
            }
          >
            <RiFilter3Line className="size-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-ballpoint px-1.5 text-caption font-semibold text-ballpoint-foreground">
                {activeFiltersCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="left" className="bg-paper p-6 w-80 overflow-y-auto">
            <FiltersForm
              filters={filters}
              onChange={updateFilters}
              onClear={handleClearFilters}
              onCloseSheet={() => setMobileSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Desktop Sidebar Filters */}
        <aside
          aria-label="Filters"
          className="hidden lg:block lg:col-span-3 rounded-sm border border-hairline bg-paper p-5 h-fit sticky top-20"
        >
          <FiltersForm
            filters={filters}
            onChange={updateFilters}
            onClear={handleClearFilters}
          />
        </aside>

        {/* Results Area */}
        <section className="lg:col-span-9" aria-label="Search results">
          {/* Desktop Heading */}
          <div className="hidden lg:flex items-baseline justify-between border-b border-hairline pb-4 mb-6">
            <h1 className="font-heading text-title font-bold text-ink">
              Rooms in {currentCityName}
            </h1>
            <span className="text-caption text-muted-ink">
              {isLoading ? "Searching..." : `${total} ${total === 1 ? "room" : "rooms"}`}
            </span>
          </div>

          {/* Loading State */}
          {isLoading && <LoadingState message="Loading rooms" rows={4} />}

          {/* Error State */}
          {isError && (
            <ErrorState
              title="Could not load rooms"
              error={error}
              onRetry={() => refetch()}
            />
          )}

          {/* Empty State */}
          {!isLoading && !isError && allRooms.length === 0 && (
            <EmptyState
              title="No rooms match these filters"
              body="Try increasing your budget, clearing some filters, or checking a nearby locality."
              action={
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="border-control-border"
                >
                  Clear filters
                </Button>
              }
            />
          )}

          {/* Room Results List */}
          {!isLoading && !isError && allRooms.length > 0 && (
            <div className="space-y-6">
              <ol className="space-y-4">
                {allRooms.map((room) => (
                  <RoomRow key={room.id} room={room} />
                ))}
              </ol>

              {/* Show more button */}
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="border-control-border text-ink hover:bg-muted"
                  >
                    {isFetchingNextPage ? "Loading more..." : "Show more rooms"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
