"use client";

import React, { useState, useId } from "react";
import { initials } from "@/lib/initials";
import {
  formatMatchScore,
  formatBudgetRange,
  formatMoveIn,
  localityLabel,
} from "@/lib/roommates/format";
import { ContactReveal } from "./contact-reveal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  RoommateMatch,
  RoommateRequest,
  PublicRoommate,
} from "@/lib/api/roommates";

export interface MatchCardProps {
  match: RoommateMatch;
  sendState: "idle" | "sending" | "sent" | "error";
  sendError?: string | null;
  result?: RoommateRequest | null;
  onSend: (toUid: string, message: string) => void;
}

export function MatchCard({
  match,
  sendState,
  sendError,
  result,
  onSend,
}: MatchCardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const headingId = useId();
  const messageInputId = useId();

  const profile = match.profile;
  const college = (profile as PublicRoommate & { college?: string }).college;
  const localityText = profile.preferredLocalities
    .map(localityLabel)
    .filter(Boolean)
    .join(", ");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(profile.id, message);
  };

  const isMutualAccept = result?.status === "accepted";
  const isSent = sendState === "sent" || isMutualAccept;

  return (
    <article
      aria-labelledby={headingId}
      className="border border-border bg-paper rounded-lg p-5 flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Left + Middle */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Avatar */}
          <div
            className="size-12 rounded-full bg-hairline/60 text-ink font-heading text-body font-semibold flex items-center justify-center shrink-0 select-none"
            aria-hidden="true"
          >
            {initials(profile.displayName)}
          </div>

          {/* Middle info */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3
              id={headingId}
              className="font-heading text-lead font-semibold text-ink"
            >
              {profile.displayName}
            </h3>

            {college && (
              <p className="text-caption text-muted-ink">{college}</p>
            )}

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-caption">
              <span className="font-medium text-ink">
                {formatBudgetRange(
                  profile.budgetMinPaise,
                  profile.budgetMaxPaise
                )}
              </span>
              <span className="text-muted-ink">
                {formatMoveIn(profile.moveInBy)}
              </span>
            </div>

            {localityText && (
              <p className="text-caption text-muted-ink">{localityText}</p>
            )}

            {profile.bio && (
              <p className="text-body text-ink line-clamp-2 pt-1">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Right / Top score */}
        <div className="shrink-0 self-start sm:self-center">
          <span className="font-heading text-lead font-bold text-ink">
            {formatMatchScore(match.score)}
          </span>
        </div>
      </div>

      {/* Reasons chips */}
      {match.reasons && match.reasons.length > 0 && (
        <ul
          aria-label="Why you match"
          className="flex flex-wrap gap-1.5 pt-1"
        >
          {match.reasons.map((reason, idx) => (
            <li
              key={idx}
              className="rounded border border-hairline px-2 py-0.5 text-caption text-ink"
            >
              {reason}
            </li>
          ))}
        </ul>
      )}

      {/* Actions and Status */}
      <div className="pt-2 border-t border-hairline/60">
        {isMutualAccept ? (
          <div className="space-y-3">
            <p className="text-body font-medium text-ink">
              You both want to room together.
            </p>
            {result?.contact && (
              <ContactReveal
                contact={result.contact}
                myUid={result.fromUid}
              />
            )}
          </div>
        ) : isSent ? (
          <p className="text-body font-medium text-ink">Request sent</p>
        ) : !isFormOpen ? (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setIsFormOpen(true)}
          >
            Send request
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
            <div className="space-y-1">
              <Label htmlFor={messageInputId} className="text-caption text-ink">
                Message (optional)
              </Label>
              <Textarea
                id={messageInputId}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                placeholder="Say hello or ask a question..."
                className="text-sm"
              />
              <div className="flex justify-between items-center text-caption text-muted-ink pt-0.5">
                <span>
                  Contact details are shared only when you both accept.
                </span>
                <span>{message.length} / 300</span>
              </div>
            </div>

            {sendError && (
              <div role="alert" className="text-caption text-destructive">
                {sendError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={sendState === "sending"}
              >
                {sendState === "sending" ? "Sending..." : "Send request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsFormOpen(false);
                  setMessage("");
                }}
                disabled={sendState === "sending"}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}
