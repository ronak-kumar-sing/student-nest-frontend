"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-provider";
import { formatDate } from "@/lib/api/format";
import {
  listRoommateRequests,
  roommateRequestAction,
  type RequestDirection,
  type RequestAction,
  type RoommateRequest,
} from "@/lib/api/roommates";
import {
  formatBudgetRange,
  formatMoveIn,
  localityLabel,
} from "@/lib/roommates/format";
import { roommateErrorMessage } from "@/lib/roommates/errors";
import { RequestStatusChip } from "./request-status-chip";
import { ContactReveal } from "./contact-reveal";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { RiArrowLeftLine } from "@remixicon/react";

export function RoommateRequests() {
  const { status, role, needsSignup, me, firebaseUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const tabParam = searchParams.get("tab");
  const direction: RequestDirection =
    tabParam === "outgoing" ? "outgoing" : "incoming";

  const [acceptedRequests, setAcceptedRequests] = useState<
    Record<string, RoommateRequest>
  >({});
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  const myUid = me?.id ?? firebaseUser?.uid ?? "";

  const handleTabChange = (newDir: RequestDirection) => {
    if (newDir === "outgoing") {
      router.replace("/roommates/requests?tab=outgoing");
    } else {
      router.replace("/roommates/requests");
    }
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent,
    currentDir: RequestDirection
  ) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const nextDir: RequestDirection =
        currentDir === "incoming" ? "outgoing" : "incoming";
      handleTabChange(nextDir);
      const target = document.getElementById(`tab-${nextDir}`);
      target?.focus();
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["roommates", "requests", direction],
    queryFn: ({ pageParam }) =>
      listRoommateRequests({ direction, cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.hasMore ? (last.nextCursor as unknown as string) : undefined,
    enabled: status === "signed-in" && role === "student" && !needsSignup,
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: RequestAction }) =>
      roommateRequestAction(id, action),
    onSuccess: (updatedRequest, { id, action }) => {
      queryClient.invalidateQueries({ queryKey: ["roommates", "requests"] });
      if (action === "accept" || updatedRequest.status === "accepted") {
        setAcceptedRequests((prev) => ({
          ...prev,
          [id]: updatedRequest,
        }));
      }
      setActionErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    onError: (err, { id }) => {
      setActionErrors((prev) => ({
        ...prev,
        [id]: roommateErrorMessage(err),
      }));
    },
  });

  // 1. Auth loading
  if (status === "loading") {
    return <LoadingState message="Loading roommate requests..." />;
  }

  // 2. Signed out or needs signup -> Guest explainer
  if (status === "signed-out" || needsSignup) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="font-heading text-title sm:text-display font-semibold text-ink">
            Roommate requests
          </h1>
          <p className="text-body text-ink max-w-2xl leading-relaxed">
            Roommate matching pairs you with students in your city who have a
            similar budget, move-in date and habits. You need a student account
            to see your roommate requests.
          </p>
        </div>
        <div>
          <Link
            href="/login?next=%2Froommates%2Frequests"
            className={buttonVariants({ variant: "default" })}
          >
            Log in to see requests
          </Link>
        </div>
      </div>
    );
  }

  // 3. Non-student role
  if (role !== "student") {
    return (
      <div className="bg-paper border border-border rounded-lg p-6 max-w-lg mx-auto text-center space-y-3">
        <h1 className="font-heading text-title font-semibold text-ink">
          Student account needed
        </h1>
        <p className="text-body text-muted-ink">
          Roommate matching is for student accounts.
        </p>
        <div className="pt-2">
          {role === "owner" ? (
            <Link
              href="/owner/listings"
              className={buttonVariants({ variant: "default" })}
            >
              Go to your listings
            </Link>
          ) : (
            <Link
              href="/rooms?city=indore"
              className={buttonVariants({ variant: "default" })}
            >
              Browse rooms
            </Link>
          )}
        </div>
      </div>
    );
  }

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-8">
      {/* Top Navigation and Header */}
      <div className="space-y-4 border-b border-border pb-5">
        <div>
          <Link
            href="/roommates"
            className="inline-flex items-center gap-1.5 text-caption font-medium text-ballpoint hover:underline"
          >
            <RiArrowLeftLine className="size-4" />
            Back to matches
          </Link>
        </div>

        <div>
          <h1 className="font-heading text-title font-semibold text-ink">
            Roommate requests
          </h1>
        </div>

        {/* Tab list */}
        <div
          role="tablist"
          aria-label="Roommate request directions"
          className="flex border-b border-hairline gap-6"
        >
          <button
            type="button"
            role="tab"
            id="tab-incoming"
            aria-selected={direction === "incoming"}
            aria-controls="panel-requests"
            tabIndex={direction === "incoming" ? 0 : -1}
            onClick={() => handleTabChange("incoming")}
            onKeyDown={(e) => handleTabKeyDown(e, "incoming")}
            className={`pb-3 text-body font-medium transition-colors border-b-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ballpoint ${
              direction === "incoming"
                ? "border-ballpoint text-ink font-semibold"
                : "border-transparent text-muted-ink hover:text-ink"
            }`}
          >
            Incoming
          </button>

          <button
            type="button"
            role="tab"
            id="tab-outgoing"
            aria-selected={direction === "outgoing"}
            aria-controls="panel-requests"
            tabIndex={direction === "outgoing" ? 0 : -1}
            onClick={() => handleTabChange("outgoing")}
            onKeyDown={(e) => handleTabKeyDown(e, "outgoing")}
            className={`pb-3 text-body font-medium transition-colors border-b-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ballpoint ${
              direction === "outgoing"
                ? "border-ballpoint text-ink font-semibold"
                : "border-transparent text-muted-ink hover:text-ink"
            }`}
          >
            Outgoing
          </button>
        </div>
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        id="panel-requests"
        aria-labelledby={`tab-${direction}`}
      >
        {isLoading ? (
          <LoadingState message="Loading requests..." />
        ) : isError ? (
          <ErrorState
            title="Could not load requests"
            message={roommateErrorMessage(error)}
            onRetry={() => refetch()}
          />
        ) : items.length === 0 ? (
          direction === "incoming" ? (
            <EmptyState
              title="No requests yet"
              body="When a student sends you a roommate request, it shows up here."
              action={
                <Link
                  href="/roommates"
                  className={buttonVariants({ variant: "default" })}
                >
                  See your matches
                </Link>
              }
            />
          ) : (
            <EmptyState
              title="No sent requests"
              body="You have not sent any roommate requests yet. Send one from your matches."
              action={
                <Link
                  href="/roommates"
                  className={buttonVariants({ variant: "default" })}
                >
                  See your matches
                </Link>
              }
            />
          )
        ) : (
          <div className="space-y-4">
            {items.map((req) => {
              const activeReq = acceptedRequests[req.id] ?? req;
              const counterpart = activeReq.counterpart;
              const isPendingAction =
                actionMutation.isPending &&
                actionMutation.variables?.id === req.id;
              const rowError = actionErrors[req.id];

              const isAccepted = activeReq.status === "accepted";
              const localities = counterpart?.preferredLocalities
                ? counterpart.preferredLocalities
                    .map(localityLabel)
                    .filter(Boolean)
                    .join(", ")
                : null;

              return (
                <div
                  key={req.id}
                  className="border border-border bg-paper rounded-lg p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-heading text-lead font-semibold text-ink">
                        {counterpart
                          ? counterpart.displayName
                          : "A student who has left"}
                      </span>
                      <RequestStatusChip status={activeReq.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-caption text-muted-ink">
                      <span>Sent {formatDate(activeReq.createdAt)}</span>
                      {activeReq.status === "pending" && (
                        <span>Expires {formatDate(activeReq.expiresAt)}</span>
                      )}
                    </div>
                  </div>

                  {counterpart && (
                    <div className="space-y-1 text-caption">
                      <div className="flex flex-wrap items-baseline gap-x-3 text-ink">
                        <span className="font-medium">
                          {formatBudgetRange(
                            counterpart.budgetMinPaise,
                            counterpart.budgetMaxPaise
                          )}
                        </span>
                        <span className="text-muted-ink">
                          {formatMoveIn(counterpart.moveInBy)}
                        </span>
                      </div>
                      {localities && (
                        <p className="text-muted-ink">{localities}</p>
                      )}
                    </div>
                  )}

                  {activeReq.message && (
                    <p className="text-body text-ink italic bg-background/50 border border-hairline/60 rounded p-3">
                      “{activeReq.message}”
                    </p>
                  )}

                  {/* Actions for Pending */}
                  {activeReq.status === "pending" && (
                    <div className="flex items-center gap-3 pt-1">
                      {direction === "incoming" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              actionMutation.mutate({
                                id: req.id,
                                action: "accept",
                              })
                            }
                            disabled={isPendingAction}
                          >
                            Accept
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              actionMutation.mutate({
                                id: req.id,
                                action: "decline",
                              })
                            }
                            disabled={isPendingAction}
                          >
                            Decline
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            actionMutation.mutate({
                              id: req.id,
                              action: "cancel",
                            })
                          }
                          disabled={isPendingAction}
                        >
                          Cancel request
                        </Button>
                      )}
                    </div>
                  )}

                  {rowError && (
                    <div
                      role="alert"
                      className="text-caption text-destructive"
                    >
                      {rowError}
                    </div>
                  )}

                  {/* Contact reveal when accepted */}
                  {isAccepted && activeReq.contact && (
                    <ContactReveal
                      contact={activeReq.contact}
                      myUid={myUid}
                    />
                  )}
                </div>
              );
            })}

            {hasNextPage && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? "Loading more..."
                    : "Load more requests"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
