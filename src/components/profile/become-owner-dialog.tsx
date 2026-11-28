"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-provider";
import { becomeOwner } from "@/lib/api";
import { friendlyMessage } from "@/lib/api/errors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiErrorWarningLine } from "@remixicon/react";

export interface BecomeOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BecomeOwnerDialog({ open, onOpenChange }: BecomeOwnerDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshMe } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    const trimmed = businessName.trim();
    if (trimmed.length > 0 && (trimmed.length < 2 || trimmed.length > 80)) {
      setValidationError("Keep business name between 2 and 80 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await becomeOwner(trimmed ? { businessName: trimmed } : {});
      await refreshMe();
      await queryClient.invalidateQueries();
      onOpenChange(false);
      router.replace("/owner/listings");
    } catch (err: unknown) {
      setError(friendlyMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) {
      if (!nextOpen) {
        setError(null);
        setValidationError(null);
        setBusinessName("");
      }
      onOpenChange(nextOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleConfirm} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Switch to an owner account?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Your account becomes an owner account, so you can
              list rooms but can no longer save rooms, apply to book or use roommate
              matching. Your roommate profile will be hidden.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-ink"
            >
              <RiErrorWarningLine className="size-4 text-destructive shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="become-owner-business-name"
              className="text-body font-medium text-ink"
            >
              Business name (optional)
            </Label>
            <Input
              id="become-owner-business-name"
              type="text"
              placeholder="e.g. Sharma Student Homes"
              maxLength={80}
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isSubmitting}
              className="border-[var(--control-border)]"
              aria-invalid={Boolean(validationError)}
              aria-describedby={
                validationError ? "business-name-error" : undefined
              }
            />
            {validationError && (
              <p
                id="business-name-error"
                className="text-caption text-destructive"
                role="alert"
              >
                {validationError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-ballpoint hover:bg-ballpoint/90 text-[var(--ballpoint-foreground)]"
            >
              {isSubmitting ? "Switching..." : "Become an owner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
