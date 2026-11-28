"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { initials } from "@/lib/initials";
import { cityName } from "@/lib/search-params";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { StatusChip } from "@/components/handbill/status-chip";
import { Button } from "@/components/ui/button";
import { ProfileEditForm } from "./profile-edit-form";
import { BecomeOwnerDialog } from "./become-owner-dialog";

export function ProfileView() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const { me, refreshMe, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [becomeOwnerOpen, setBecomeOwnerOpen] = useState(false);

  if (!ready) {
    return <LoadingState message="Loading your profile..." />;
  }

  if (!me) {
    return (
      <ErrorState
        title="Could not load your profile"
        message="Please check your connection and try again."
        onRetry={() => refreshMe()}
      />
    );
  }

  const roleLabel =
    me.role === "student"
      ? "Student account"
      : me.role === "owner"
        ? "Owner account"
        : "Admin account";

  const genderDisplay = (() => {
    switch (me.gender) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "non_binary":
        return "Non-binary";
      case "undisclosed":
        return "Prefer not to say";
      default:
        return "Not set";
    }
  })();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span
          className="inline-flex size-14 items-center justify-center rounded-full border border-control-border bg-paper font-heading text-title font-semibold text-ink shrink-0"
          aria-hidden="true"
        >
          {initials(me.displayName)}
        </span>
        <div className="space-y-1">
          <h1 className="font-heading text-title font-bold text-ink">
            {me.displayName || "Your profile"}
          </h1>
          <p className="text-caption text-muted-ink font-medium">{roleLabel}</p>
        </div>
      </div>

      {/* Details or Edit Form */}
      {isEditing ? (
        <section
          aria-labelledby="edit-details-heading"
          className="rounded-sm border border-hairline bg-paper p-5 sm:p-6"
        >
          <h2
            id="edit-details-heading"
            className="font-heading text-lead font-semibold text-ink mb-6"
          >
            Edit details
          </h2>
          <ProfileEditForm
            me={me}
            onCancel={() => setIsEditing(false)}
            onSaved={() => setIsEditing(false)}
          />
        </section>
      ) : (
        <section aria-labelledby="account-details-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              id="account-details-heading"
              className="font-heading text-lead font-semibold text-ink"
            >
              Account details
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit details
            </Button>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 text-body border-t border-hairline pt-4">
            <div>
              <dt className="text-caption text-muted-ink">Name</dt>
              <dd className="font-medium text-ink mt-0.5">
                {me.displayName || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted-ink">Email</dt>
              <dd className="font-medium text-ink mt-0.5">{me.email || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-ink">Phone</dt>
              <dd className="font-medium text-ink mt-0.5 flex items-center gap-2">
                <span>{me.phone || "Not added"}</span>
                {me.phoneVerified && (
                  <StatusChip status="approved" label="Verified" />
                )}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted-ink">Role</dt>
              <dd className="font-medium text-ink mt-0.5">
                {me.role === "owner"
                  ? "Owner"
                  : me.role === "admin"
                    ? "Admin"
                    : "Student"}
              </dd>
            </div>
            {me.role === "student" && (
              <div>
                <dt className="text-caption text-muted-ink">College</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {me.college || "Not set"}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-caption text-muted-ink">Gender</dt>
              <dd className="font-medium text-ink mt-0.5">{genderDisplay}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-ink">City</dt>
              <dd className="font-medium text-ink mt-0.5">
                {cityName(me.city) || "Not set"}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* Verification section */}
      <section
        aria-labelledby="verification-heading"
        className="space-y-4 pt-8 border-t border-hairline"
      >
        <h2
          id="verification-heading"
          className="font-heading text-lead font-semibold text-ink"
        >
          Verification
        </h2>
        <div className="space-y-4 divide-y divide-hairline">
          <div className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-body font-medium text-ink">
                Identity (DigiLocker)
              </p>
              <p className="text-caption text-muted-ink">
                Government ID verification via DigiLocker.
              </p>
            </div>
            <span className="text-caption text-muted-ink">
              Not verified, coming soon
            </span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-body font-medium text-ink">Phone</p>
              <p className="text-caption text-muted-ink">
                Direct contact with property owners.
              </p>
            </div>
            <div>
              {me.phoneVerified ? (
                <StatusChip status="approved" label="Verified" />
              ) : (
                <span className="text-caption text-muted-ink">
                  Not verified. Phone verification is coming soon.
                </span>
              )}
            </div>
          </div>

          {me.role === "owner" && (
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-body font-medium text-ink">Owner KYC</p>
                <p className="text-caption text-muted-ink">
                  Identity proof and property verification.
                </p>
              </div>
              <div>
                {me.kycStatus === "approved" ? (
                  <StatusChip status="approved" label="Approved" />
                ) : me.kycStatus === "pending" ? (
                  <StatusChip status="pending" label="In review" />
                ) : me.kycStatus === "rejected" ? (
                  <StatusChip status="rejected" label="Rejected" />
                ) : (
                  <span className="text-caption text-muted-ink">Not started</span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Become an owner (students only) */}
      {me.role === "student" && (
        <section
          aria-labelledby="become-owner-heading"
          className="space-y-4 pt-8 border-t border-hairline"
        >
          <h2
            id="become-owner-heading"
            className="font-heading text-lead font-semibold text-ink"
          >
            Become an owner
          </h2>
          <p className="text-body text-muted-ink">
            List your own room or PG. Your account switches to an owner account.
          </p>
          {isDemoAccount(me.id) ? (
            <p className="text-body text-muted-ink">
              This is a shared demo account, so switching it is turned off. Use
              &ldquo;Try as an owner&rdquo; on the sign-in page to see the owner side.
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setBecomeOwnerOpen(true)}
            >
              Become an owner
            </Button>
          )}
          <BecomeOwnerDialog
            open={becomeOwnerOpen}
            onOpenChange={setBecomeOwnerOpen}
          />
        </section>
      )}

      {/* Sign out */}
      <section
        aria-labelledby="sign-out-heading"
        className="pt-8 border-t border-hairline"
      >
        <h2 id="sign-out-heading" className="sr-only">
          Sign out
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
        >
          Sign out
        </Button>
      </section>
    </div>
  );
}

/** The shared demo accounts (API decision D30) can't make one-way account changes. */
function isDemoAccount(uid: string | undefined): boolean {
  return uid === "demo_student" || uid === "demo_owner";
}
