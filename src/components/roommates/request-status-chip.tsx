import React from "react";
import { cn } from "@/lib/utils";
import type { RoommateRequestStatus } from "@/lib/api/roommates";

export type StatusChipTone = "marigold" | "pink" | "mint";

export interface RequestStatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  status: RoommateRequestStatus;
  className?: string;
}

const STATUS_MAP: Record<
  RoommateRequestStatus,
  { tone: StatusChipTone; label: string }
> = {
  pending: { tone: "marigold", label: "Pending" },
  accepted: { tone: "mint", label: "Accepted" },
  declined: { tone: "pink", label: "Declined" },
  cancelled: { tone: "pink", label: "Cancelled" },
  expired: { tone: "pink", label: "Expired" },
};

export function RequestStatusChip({
  status,
  className,
  ...props
}: RequestStatusChipProps) {
  const meta = STATUS_MAP[status] || {
    tone: "marigold" as StatusChipTone,
    label: status,
  };

  const toneClasses: Record<StatusChipTone, string> = {
    marigold: "bg-marigold text-ink",
    pink: "bg-pink-slip text-ink",
    mint: "bg-mint-slip text-ink",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-caption font-medium border border-hairline/40",
        toneClasses[meta.tone],
        className
      )}
      {...props}
    >
      {meta.label}
    </span>
  );
}
