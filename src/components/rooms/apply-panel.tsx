"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-provider";
import { createBooking, type PropertyPublic } from "@/lib/api";
import { formatRupees } from "@/lib/api/format";
import { friendlyMessage, isApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ApplyPanelProps {
  property: PropertyPublic;
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function ApplyPanel({ property }: ApplyPanelProps) {
  const { status, role } = useAuth();

  const todayStr = new Date().toISOString().split("T")[0];
  const minDateStr =
    property.availableFrom && property.availableFrom > todayStr
      ? property.availableFrom.split("T")[0]
      : todayStr;

  // The backend accepts move-in dates up to 120 days from today.
  const maxDateStr = new Date(new Date(`${todayStr}T00:00:00Z`).getTime() + 120 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [moveInDate, setMoveInDate] = useState(minDateStr);
  const [durationMonths, setDurationMonths] = useState(
    Math.max(property.minStayMonths || 1, 1)
  );
  const [occupants, setOccupants] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey());

  const isWholeUnit = property.tenancyType === "whole_unit";
  const isStudent = role === "student";
  const isOwner = role === "owner";

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDurationMonths(Number(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!moveInDate) {
      setErrorMsg("Please select a move-in date.");
      return;
    }

    setSubmitting(true);

    try {
      await createBooking(
        {
          propertyId: property.id,
          moveInDate,
          durationMonths,
          occupants: isWholeUnit ? occupants : 1,
          message: message.trim() || undefined,
        },
        idempotencyKeyRef.current
      );

      // On success, reset idempotency key and show success state
      idempotencyKeyRef.current = generateIdempotencyKey();
      setSuccess(true);
    } catch (err: unknown) {
      // If 4xx error (validation or business rule conflict), generate a new key for subsequent distinct attempt
      if (isApiError(err) && err.status >= 400 && err.status < 500) {
        idempotencyKeyRef.current = generateIdempotencyKey();
      }
      setErrorMsg(friendlyMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Duration options: minStayMonths to 24
  const minStay = Math.max(property.minStayMonths || 1, 1);
  const durationOptions: number[] = [];
  for (let m = minStay; m <= 24; m++) {
    durationOptions.push(m);
  }

  return (
    <div className="rounded-sm border border-hairline bg-paper p-5 sm:p-6 shadow-xs space-y-5">
      {/* Rent Header */}
      <div className="border-b border-hairline pb-4">
        <span className="text-caption text-muted-ink">Monthly rent</span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-heading text-title font-bold text-ink">
            {formatRupees(property.rentPaise)}
          </span>
          <span className="text-caption text-muted-ink">/month</span>
        </div>
        {property.depositPaise !== undefined && property.depositPaise > 0 && (
          <p className="text-caption text-muted-ink mt-1">
            Deposit: {formatRupees(property.depositPaise)}
          </p>
        )}
      </div>

      {/* Success State */}
      {success ? (
        <div className="space-y-4">
          <div className="rounded border border-hairline bg-paper p-4 text-ink">
            <h3 className="font-heading text-lead font-semibold text-ink">
              Application sent
            </h3>
            <p className="text-caption text-ink mt-1">
              The owner has 72 hours to respond.
            </p>
          </div>
          <Link
            href="/bookings"
            className="block text-center text-caption font-semibold text-ballpoint hover:underline"
          >
            See your bookings
          </Link>
        </div>
      ) : status === "loading" ? (
        <div className="py-6 text-center text-caption text-muted-ink">
          Checking account status...
        </div>
      ) : status !== "signed-in" ? (
        <div className="space-y-4 pt-2">
          <p className="text-caption text-muted-ink">
            Sign in with your student account to apply directly to the owner.
          </p>
          <Link
            href={`/login?next=/rooms/${property.id}`}
            className="block w-full text-center py-2.5 rounded bg-ballpoint text-ballpoint-foreground font-semibold text-caption hover:opacity-95"
          >
            Log in to apply
          </Link>
        </div>
      ) : isOwner ? (
        <div className="py-4 text-center text-caption text-muted-ink">
          Owners cannot apply to rooms.
        </div>
      ) : !isStudent ? (
        <div className="py-4 text-center text-caption text-muted-ink">
          Complete your student profile to apply.
        </div>
      ) : (
        /* Apply Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-heading text-lead font-semibold text-ink">
            Apply to book
          </h3>

          {/* Move-in Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="apply-move-in-date"
              className="block text-caption font-medium text-ink"
            >
              Move-in date
            </label>
            <input
              id="apply-move-in-date"
              type="date"
              min={minDateStr}
              max={maxDateStr}
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              required
              className="w-full rounded border border-control-border bg-paper px-3 py-2 text-caption text-ink focus-visible:outline-2 focus-visible:outline-ballpoint"
            />
          </div>

          {/* Duration Months */}
          <div className="space-y-1.5">
            <label
              htmlFor="apply-duration"
              className="block text-caption font-medium text-ink"
            >
              Stay duration
            </label>
            <select
              id="apply-duration"
              value={durationMonths}
              onChange={handleDurationChange}
              className="w-full rounded border border-control-border bg-paper px-3 py-2 text-caption text-ink focus-visible:outline-2 focus-visible:outline-ballpoint"
            >
              {durationOptions.map((m) => (
                <option key={m} value={m}>
                  {m} {m === 1 ? "month" : "months"}
                </option>
              ))}
            </select>
          </div>

          {/* Occupants (for whole unit only) */}
          {isWholeUnit && (
            <div className="space-y-1.5">
              <label
                htmlFor="apply-occupants"
                className="block text-caption font-medium text-ink"
              >
                Occupants
              </label>
              <select
                id="apply-occupants"
                value={occupants}
                onChange={(e) => setOccupants(Number(e.target.value))}
                className="w-full rounded border border-control-border bg-paper px-3 py-2 text-caption text-ink focus-visible:outline-2 focus-visible:outline-ballpoint"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="apply-message"
                className="block text-caption font-medium text-ink"
              >
                Message for owner (optional)
              </label>
              <span className="text-caption text-muted-ink">
                {message.length}/500
              </span>
            </div>
            <Textarea
              id="apply-message"
              placeholder="Introduce yourself (e.g. which college and year you study in)"
              value={message}
              maxLength={500}
              onChange={(e) => setMessage(e.target.value)}
              className="border-control-border text-caption"
            />
          </div>

          {/* Inline Error */}
          {errorMsg && (
            <div
              role="alert"
              className="rounded border border-destructive/40 bg-destructive/10 p-3 text-caption text-destructive"
            >
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-ballpoint text-ballpoint-foreground font-semibold h-10"
          >
            {submitting ? "Submitting application..." : "Apply to book"}
          </Button>
        </form>
      )}
    </div>
  );
}
