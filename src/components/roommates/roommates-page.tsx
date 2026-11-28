"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-provider";
import { isApiError } from "@/lib/api/errors";
import { cityName } from "@/lib/search-params";
import {
  getRoommateProfile,
  getRoommateMatches,
  roommateProfileAction,
  sendRoommateRequest,
  type RoommateRequest,
} from "@/lib/api/roommates";
import {
  emptyWizardValues,
  wizardValuesFromProfile,
} from "@/lib/roommates/wizard";
import { roommateErrorMessage } from "@/lib/roommates/errors";
import { RoommateIntro } from "./roommate-intro";
import { RoommateWizard } from "./roommate-wizard";
import { MatchCard } from "./match-card";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SendCardState {
  state: "idle" | "sending" | "sent" | "error";
  error?: string | null;
  result?: RoommateRequest | null;
}

export function RoommatesPage() {
  const { status, role, needsSignup, me } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
  const [sendStates, setSendStates] = useState<Record<string, SendCardState>>({});

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["roommates", "profile"],
    queryFn: getRoommateProfile,
    retry: false,
    enabled: status === "signed-in" && role === "student" && !needsSignup,
  });

  const isProfileActive = Boolean(profile && profile.isActive);

  const {
    data: matchesData,
    isLoading: isMatchesLoading,
    error: matchesError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ["roommates", "matches"],
    queryFn: () => getRoommateMatches(),
    enabled: Boolean(isProfileActive),
    retry: false,
  });

  const profileActionMutation = useMutation({
    mutationFn: (action: "activate" | "deactivate") =>
      roommateProfileAction(action),
    onSuccess: (newProfile, action) => {
      queryClient.setQueryData(["roommates", "profile"], newProfile);
      queryClient.invalidateQueries({ queryKey: ["roommates", "matches"] });
      if (action === "deactivate") {
        setIsHideDialogOpen(false);
        toast.success("Your profile is hidden");
      } else {
        toast.success("Your profile is visible again");
      }
    },
    onError: (err) => {
      toast.error(roommateErrorMessage(err));
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({
      toUid,
      message,
    }: {
      toUid: string;
      message: string;
    }) => {
      const key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now());
      return await sendRoommateRequest(
        { toUid, message: message.trim() || undefined },
        key
      );
    },
    onMutate: ({ toUid }) => {
      setSendStates((prev) => ({
        ...prev,
        [toUid]: { state: "sending", error: null },
      }));
    },
    onSuccess: (result, { toUid }) => {
      setSendStates((prev) => ({
        ...prev,
        [toUid]: { state: "sent", result },
      }));
      queryClient.invalidateQueries({ queryKey: ["roommates", "requests"] });
    },
    onError: (err, { toUid }) => {
      setSendStates((prev) => ({
        ...prev,
        [toUid]: { state: "error", error: roommateErrorMessage(err) },
      }));
    },
  });

  // 1. Auth loading
  if (status === "loading") {
    return <LoadingState message="Loading roommates..." />;
  }

  // 2. Signed out or needs signup -> Guest explainer
  if (status === "signed-out" || needsSignup) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="font-heading text-title sm:text-display font-semibold text-ink">
            Find a roommate
          </h1>
          <p className="text-body text-ink max-w-2xl leading-relaxed">
            Roommate matching pairs you with students in your city who have a
            similar budget, move-in date and habits. You need a student account
            to create a roommate profile and see matches.
          </p>
        </div>
        <div>
          <Link
            href="/login?next=%2Froommates"
            className={buttonVariants({ variant: "default" })}
          >
            Log in to find a roommate
          </Link>
        </div>
      </div>
    );
  }

  // 3. Role not student
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

  // 4. Profile loading
  if (isProfileLoading) {
    return <LoadingState message="Loading roommates..." />;
  }

  // 5. 404 NOT_FOUND -> No profile yet, show intro + wizard
  if (profileError) {
    if (isApiError(profileError) && profileError.status === 404) {
      return (
        <RoommateIntro>
          <RoommateWizard
            mode="create"
            initial={emptyWizardValues({
              citySlug: me?.city ?? undefined,
              college: me?.college ?? undefined,
            })}
            userGender={me?.gender}
            onSaved={(newProfile) => {
              queryClient.setQueryData(["roommates", "profile"], newProfile);
              queryClient.invalidateQueries({
                queryKey: ["roommates", "matches"],
              });
              toast.success("Roommate profile saved");
            }}
          />
        </RoommateIntro>
      );
    }
    return (
      <ErrorState
        title="Could not load roommate profile"
        error={profileError}
        onRetry={() => refetchProfile()}
      />
    );
  }

  // If profile exists
  if (!profile) {
    return null;
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-title font-semibold text-ink">
            Edit roommate profile
          </h1>
          <p className="text-body text-muted-ink mt-0.5">
            Update your budget, preferred localities, or living habits.
          </p>
        </div>
        <RoommateWizard
          mode="edit"
          initial={wizardValuesFromProfile(profile)}
          userGender={me?.gender}
          onCancel={() => setIsEditing(false)}
          onSaved={(newProfile) => {
            queryClient.setQueryData(["roommates", "profile"], newProfile);
            queryClient.invalidateQueries({
              queryKey: ["roommates", "matches"],
            });
            setIsEditing(false);
            toast.success("Roommate profile saved");
          }}
        />
      </div>
    );
  }

  const isProfileRequiredError =
    isApiError(matchesError) && matchesError.code === "PROFILE_REQUIRED";

  return (
    <div className="space-y-8">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-heading text-title font-semibold text-ink">
            Roommate matches
          </h1>
          <p className="text-body text-muted-ink mt-0.5">
            {cityName(profile.citySlug)} matches for your budget and move-in
            date
          </p>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit my roommate profile
          </Button>

          {profile.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHideDialogOpen(true)}
            >
              Hide my profile
            </Button>
          )}

          <Link
            href="/roommates/requests"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Roommate requests
          </Link>
        </div>
      </div>

      {/* Hide Confirmation Dialog */}
      <Dialog open={isHideDialogOpen} onOpenChange={setIsHideDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Hide your roommate profile?</DialogTitle>
            <DialogDescription>
              Other students will stop seeing you, pending requests you received
              are declined and requests you sent are cancelled. You can show it
              again any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsHideDialogOpen(false)}
              disabled={profileActionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => profileActionMutation.mutate("deactivate")}
              disabled={profileActionMutation.isPending}
            >
              {profileActionMutation.isPending ? "Hiding..." : "Hide my profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Profile Block */}
      {!profile.isActive || isProfileRequiredError ? (
        <div className="border border-border bg-paper rounded-lg p-6 space-y-4">
          <p className="text-body text-ink">
            Your roommate profile is hidden. Other students cannot see you, and
            you cannot see matches.
          </p>
          <Button
            variant="default"
            onClick={() => profileActionMutation.mutate("activate")}
            disabled={profileActionMutation.isPending}
          >
            {profileActionMutation.isPending ? "Showing..." : "Show again"}
          </Button>
        </div>
      ) : isMatchesLoading ? (
        <LoadingState message="Loading roommate matches..." />
      ) : matchesError ? (
        <ErrorState
          title="Could not load matches"
          message={roommateErrorMessage(matchesError)}
          onRetry={() => refetchMatches()}
        />
      ) : matchesData && matchesData.items.length === 0 ? (
        <EmptyState
          title="No matches yet"
          body={`No matches in ${cityName(
            profile.citySlug
          )} yet. Widen your budget or add localities.`}
          action={
            <Button variant="default" onClick={() => setIsEditing(true)}>
              Edit my roommate profile
            </Button>
          }
        />
      ) : matchesData ? (
        <ul className="space-y-4">
          {matchesData.items.map((match) => {
            const cardState = sendStates[match.profile.id] || {
              state: "idle",
            };
            return (
              <li key={match.profile.id}>
                <MatchCard
                  match={match}
                  sendState={cardState.state}
                  sendError={cardState.error}
                  result={cardState.result}
                  onSend={(toUid, message) =>
                    sendMutation.mutate({ toUid, message })
                  }
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
