import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  rows?: number;
  className?: string;
}

export function LoadingState({
  message = "Loading rooms",
  rows = 3,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "w-full rounded-sm border border-hairline bg-paper p-6 space-y-4",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{message}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-3/4 bg-hairline/60" />
          <Skeleton className="h-4 w-1/2 bg-hairline/40" />
        </div>
      ))}
    </div>
  );
}
