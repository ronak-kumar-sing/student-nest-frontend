import React from "react";
import { cn } from "@/lib/utils";
import type { BookingStatus, PropertyStatus } from "@/lib/api";

export type StatusChipTone = "marigold" | "pink" | "mint";

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: BookingStatus | PropertyStatus;
  tone?: StatusChipTone;
  label?: string;
}

const STATUS_MAP: Record<string, { tone: StatusChipTone; label: string }> = {
  // Booking statuses
  pending: { tone: "marigold", label: "Pending" },
  approved: { tone: "mint", label: "Approved" },
  checked_in: { tone: "mint", label: "Checked in" },
  completed: { tone: "mint", label: "Completed" },
  rejected: { tone: "pink", label: "Rejected" },
  cancelled: { tone: "pink", label: "Cancelled" },
  withdrawn: { tone: "pink", label: "Withdrawn" },
  expired: { tone: "pink", label: "Expired" },

  // Property statuses
  published: { tone: "mint", label: "Published" },
  pending_review: { tone: "marigold", label: "In review" },
  draft: { tone: "marigold", label: "Draft" },
  paused: { tone: "pink", label: "Paused" },
  suspended: { tone: "pink", label: "Suspended" },
  deleted: { tone: "pink", label: "Deleted" },
};

export function StatusChip({
  status,
  tone: overrideTone,
  label: overrideLabel,
  className,
  ...props
}: StatusChipProps) {
  const meta = STATUS_MAP[status.toLowerCase()] || {
    tone: "marigold" as StatusChipTone,
    label: status,
  };
  const tone = overrideTone || meta.tone;
  const label = overrideLabel || meta.label;

  const toneClasses: Record<StatusChipTone, string> = {
    marigold: "bg-marigold text-ink",
    pink: "bg-pink-slip text-ink",
    mint: "bg-mint-slip text-ink",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-caption font-medium border border-hairline/40",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}
