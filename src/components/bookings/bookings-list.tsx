"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { getMyBookings } from "@/lib/api";
import { formatRupees, formatDate } from "@/lib/api/format";
import { StatusChip } from "@/components/handbill/status-chip";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { buttonVariants } from "@/components/ui/button";
import { RiArrowRightLine, RiTimeLine, RiPhoneLine, RiMailLine } from "@remixicon/react";

const STATUS_FILTERS = [
  { value: "all", label: "All applications" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "checked_in", label: "Checked in" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function BookingsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, wrongRole } = useRequireAuth("student");

  const currentStatus = searchParams.get("status") || "all";

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bookings", "mine", currentStatus],
    queryFn: async () => {
      return await getMyBookings({
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
    router.push(`/bookings?${params.toString()}`);
  };

  if (!ready || isLoading) {
    return <LoadingState message="Loading your applications..." />;
  }

  if (wrongRole) {
    return (
      <div className="bg-paper border border-border rounded-lg p-6 max-w-lg mx-auto text-center space-y-3">
        <h2 className="font-heading text-title font-semibold text-ink">Student account needed</h2>
        <p className="text-body text-muted-ink">
          Room bookings and applications are for student accounts.
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
        title="Could not load applications"
        message="Could not reach Student Nest. Check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-heading text-title font-semibold text-ink">Your bookings</h1>
          <p className="text-body text-muted-ink mt-0.5">
            Track your room applications and contact details for approved stays
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-caption text-muted-ink shrink-0">
            Filter:
          </label>
          <select
            id="status-filter"
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
          title="No applications found"
          body={
            currentStatus === "all"
              ? "You have not applied for any rooms yet."
              : `No applications with status "${currentStatus}".`
          }
          action={
            <Link
              href="/rooms?city=indore"
              className={buttonVariants({ variant: "default" })}
            >
              Find a room in Indore
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((booking) => {
            const propertyId = booking.property?.id || booking.propertyId;
            const propertyTitle = booking.property?.title || "Room application";
            const locality = booking.property?.locality;

            return (
              <div
                key={booking.id}
                className="bg-paper border border-border rounded-lg p-5 sm:p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <Link
                      href={`/rooms/${propertyId}`}
                      className="font-heading text-lead font-semibold text-ink hover:text-ballpoint hover:underline"
                    >
                      {propertyTitle}
                    </Link>
                    {locality && (
                      <p className="text-caption text-muted-ink mt-0.5">{locality}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <StatusChip status={booking.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-caption">
                  <div>
                    <span className="text-muted-ink block">Move-in date</span>
                    <span className="font-medium text-ink block mt-0.5">
                      {formatDate(booking.moveInDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-ink block">Stay duration</span>
                    <span className="font-medium text-ink block mt-0.5">
                      {booking.durationMonths} months
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-ink block">Agreed rent</span>
                    <span className="font-medium text-ink block mt-0.5">
                      {formatRupees(booking.agreedRentPaise)} / mo
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-ink block">Occupants</span>
                    <span className="font-medium text-ink block mt-0.5">
                      {booking.occupants} {booking.occupants === 1 ? "student" : "students"}
                    </span>
                  </div>
                </div>

                {booking.status === "pending" && (
                  <div className="flex items-center gap-2 p-3 rounded border border-hairline bg-paper text-caption text-ink">
                    <RiTimeLine className="size-4 shrink-0 text-ink" />
                    <span>
                      Awaiting owner response. This application will expire on{" "}
                      <strong>{formatDate(booking.expiresAt)}</strong>.
                    </span>
                  </div>
                )}

                {booking.status === "approved" && booking.contact && (
                  <div className="p-4 rounded-md border border-hairline bg-paper text-caption text-ink space-y-1.5">
                    <p className="font-medium text-body">
                      Approved. Contact the owner directly:
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-1 text-ink">
                      <span className="font-medium">{booking.contact.name}</span>
                      {booking.contact.phone && (
                        <a
                          href={`tel:${booking.contact.phone}`}
                          className="flex items-center gap-1.5 text-ballpoint hover:underline"
                        >
                          <RiPhoneLine className="size-4" />
                          {booking.contact.phone}
                        </a>
                      )}
                      {booking.contact.email && (
                        <a
                          href={`mailto:${booking.contact.email}`}
                          className="flex items-center gap-1.5 text-ballpoint hover:underline"
                        >
                          <RiMailLine className="size-4" />
                          {booking.contact.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {booking.status === "rejected" && booking.rejection && (
                  <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-caption text-ink">
                    <span className="font-medium">Application not accepted:</span>{" "}
                    <span>{booking.rejection.reason.replace(/_/g, " ")}</span>
                    {booking.rejection.note && (
                      <p className="mt-1 text-muted-ink">&ldquo;{booking.rejection.note}&rdquo;</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-caption text-muted-ink pt-2 border-t border-border">
                  <span>Applied on {formatDate(booking.createdAt)}</span>
                  <Link
                    href={`/rooms/${propertyId}`}
                    className="text-ballpoint hover:underline font-medium inline-flex items-center gap-1"
                  >
                    View room listing
                    <RiArrowRightLine className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
