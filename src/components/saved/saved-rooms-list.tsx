"use client";

import React from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { getFavorites, removeFavorite } from "@/lib/api";
import { formatRupees, formatDate } from "@/lib/api/format";
import { cityName } from "@/lib/search-params";
import { RoomPhoto } from "@/components/rooms/room-photo";
import { StatusChip } from "@/components/handbill/status-chip";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RiDeleteBinLine, RiArrowRightLine } from "@remixicon/react";

export function SavedRoomsList() {
  const { ready, wrongRole } = useRequireAuth("student");
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["favorites"],
    queryFn: async ({ pageParam }) => {
      return await getFavorites({ cursor: pageParam, limit: 20 });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? ((lastPage.nextCursor as unknown) as string) : undefined,
    enabled: ready && !wrongRole,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await removeFavorite(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  if (!ready || isLoading) {
    return <LoadingState message="Loading your saved rooms..." />;
  }

  if (wrongRole) {
    return (
      <div className="bg-paper border border-border rounded-lg p-6 max-w-lg mx-auto text-center space-y-3">
        <h2 className="font-heading text-title font-semibold text-ink">Student account needed</h2>
        <p className="text-body text-muted-ink">
          Saved rooms are for student accounts looking for accommodation.
        </p>
        <div className="pt-2">
          <Link
            href="/owner/listings"
            className="inline-flex items-center gap-1.5 text-body font-medium text-ballpoint hover:underline"
          >
            Go to your owner listings
            <RiArrowRightLine className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load saved rooms"
        message="Could not reach Student Nest. Check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="No saved rooms yet"
        body="Save a room from the search results and it will show up here."
        action={
          <Link
            href="/rooms?city=indore"
            className={buttonVariants({ variant: "default" })}
          >
            Browse rooms in Indore
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-heading text-title font-semibold text-ink">Saved rooms</h1>
          <p className="text-body text-muted-ink mt-0.5">
            {items.length} {items.length === 1 ? "room" : "rooms"} saved for later review
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((room) => {
          const isPendingRemoval =
            removeMutation.isPending && removeMutation.variables === room.id;

          return (
            <div
              key={room.id}
              className={`bg-paper border border-border rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-opacity ${
                isPendingRemoval ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full min-w-0">
                <div className="relative w-full sm:w-36 h-28 sm:h-24 rounded overflow-hidden shrink-0">
                  <RoomPhoto
                    src={room.coverImageUrl}
                    alt={room.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/rooms/${room.id}`}
                      className="font-heading text-lead font-semibold text-ink hover:text-ballpoint hover:underline truncate"
                    >
                      {room.title}
                    </Link>
                    {!room.available && (
                      <StatusChip status="rejected" label="No longer available" />
                    )}
                  </div>

                  <p className="text-caption text-muted-ink">
                    {room.locality}, {cityName(room.citySlug)}
                  </p>

                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="font-heading text-body font-bold text-ink">
                      {formatRupees(room.rentPaise)}
                    </span>
                    <span className="text-caption text-muted-ink">/ month</span>
                  </div>

                  <p className="text-caption text-muted-ink">
                    Saved on {formatDate(room.savedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMutation.mutate(room.id)}
                  disabled={isPendingRemoval}
                  className="text-muted-ink hover:text-destructive hover:border-destructive/40 text-caption gap-1.5"
                  aria-label={`Remove ${room.title} from saved`}
                >
                  <RiDeleteBinLine className="size-4" />
                  Remove
                </Button>

                <Link
                  href={`/rooms/${room.id}`}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-ballpoint text-[var(--ballpoint-foreground)] hover:bg-ballpoint/90 text-caption"
                  )}
                >
                  View room
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {hasNextPage && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="border-border text-ink hover:bg-muted"
          >
            {isFetchingNextPage ? "Loading more..." : "Load more saved rooms"}
          </Button>
        </div>
      )}
    </div>
  );
}
