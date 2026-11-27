"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { getMyProperties } from "@/lib/api";
import { formatRupees, formatRoomType } from "@/lib/api/format";
import { cityName } from "@/lib/search-params";
import { RoomPhoto } from "@/components/rooms/room-photo";
import { StatusChip } from "@/components/handbill/status-chip";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import {
  RiEyeLine,
  RiHeartLine,
  RiQuestionAnswerLine,
  RiCalendarCheckLine,
  RiArrowRightLine,
} from "@remixicon/react";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "pending_review", label: "Pending review" },
  { value: "draft", label: "Draft" },
  { value: "paused", label: "Paused" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

export function OwnerListings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, wrongRole } = useRequireAuth("owner");

  const currentStatus = searchParams.get("status") || "all";

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["properties", "mine", currentStatus],
    queryFn: async () => {
      return await getMyProperties({
        status: currentStatus === "all" ? undefined : currentStatus,
      });
    },
    enabled: ready && !wrongRole,
  });

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`/owner/listings?${params.toString()}`);
  };

  if (!ready || isLoading) {
    return <LoadingState message="Loading your listings..." />;
  }

  if (wrongRole) {
    return (
      <div className="bg-paper border border-border rounded-lg p-6 max-w-lg mx-auto text-center space-y-3">
        <h2 className="font-heading text-title font-semibold text-ink">Owner account needed</h2>
        <p className="text-body text-muted-ink">
          This section is for property owners managing room listings.
        </p>
        <div className="pt-2">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-body font-medium text-ballpoint hover:underline"
          >
            Browse rooms as a student
            <RiArrowRightLine className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load listings"
        message="Could not load your listings. Check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-heading text-title font-semibold text-ink">Your listings</h1>
          <p className="text-body text-muted-ink mt-0.5">
            Manage your properties, monitor availability and view student interest
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="owner-status-filter" className="text-caption text-muted-ink shrink-0">
            Filter:
          </label>
          <select
            id="owner-status-filter"
            value={currentStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="h-9 px-3 text-caption font-medium rounded-md bg-paper border border-[var(--control-border)] text-ink outline-none focus:border-ballpoint"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No listings yet"
          body={
            currentStatus === "all"
              ? "You have no listings yet. Creating listings is not available on the web yet."
              : `No listings with status "${currentStatus}".`
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((listing) => {
            const coverImage =
              listing.images?.find((img) => img.isCover)?.url ||
              listing.images?.[0]?.url ||
              "";

            return (
              <div
                key={listing.id}
                className="bg-paper border border-border rounded-lg p-5 sm:p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-0 flex-1">
                    <div className="relative w-full sm:w-36 h-28 sm:h-24 rounded overflow-hidden shrink-0">
                      <RoomPhoto
                        src={coverImage}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/rooms/${listing.id}`}
                          className="font-heading text-lead font-semibold text-ink hover:text-ballpoint hover:underline truncate"
                        >
                          {listing.title}
                        </Link>
                        <StatusChip status={listing.status} />
                      </div>

                      <p className="text-caption text-muted-ink">
                        {formatRoomType(listing.roomType)} in {listing.address.locality},{" "}
                        {cityName(listing.address.citySlug || listing.address.city)}
                      </p>

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="font-heading text-body font-bold text-ink">
                          {formatRupees(listing.rentPaise)}
                        </span>
                        <span className="text-caption text-muted-ink">/ month</span>
                        <span aria-hidden="true" className="h-3 w-px bg-ink/30 mx-2" />
                        <span className="text-caption text-ink font-medium">
                          {listing.availableSlots} of {listing.capacity} slots available
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Link
                      href={`/rooms/${listing.id}`}
                      className="inline-flex items-center gap-1.5 text-caption font-medium text-ballpoint hover:underline"
                    >
                      View public listing
                      <RiArrowRightLine className="size-3.5" />
                    </Link>
                  </div>
                </div>

                {listing.stats && (
                  <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-caption text-muted-ink">
                    <div className="flex items-center gap-1.5">
                      <RiEyeLine className="size-4 text-ink shrink-0" />
                      <span>
                        <strong className="text-ink font-semibold">{listing.stats.views}</strong>{" "}
                        views
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <RiHeartLine className="size-4 text-ink shrink-0" />
                      <span>
                        <strong className="text-ink font-semibold">{listing.stats.favorites}</strong>{" "}
                        saves
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <RiQuestionAnswerLine className="size-4 text-ink shrink-0" />
                      <span>
                        <strong className="text-ink font-semibold">{listing.stats.inquiries}</strong>{" "}
                        inquiries
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <RiCalendarCheckLine className="size-4 text-ink shrink-0" />
                      <span>
                        <strong className="text-ink font-semibold">{listing.stats.bookings}</strong>{" "}
                        bookings
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
