import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  body,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-sm border border-hairline bg-paper p-8 text-center",
        className
      )}
    >
      <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-ink">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
