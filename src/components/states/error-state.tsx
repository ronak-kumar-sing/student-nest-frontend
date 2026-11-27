import React from "react";
import { Button } from "@/components/ui/button";
import { friendlyMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  const displayMessage = message || friendlyMessage(error);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-sm border border-hairline bg-paper p-8 text-center",
        className
      )}
      role="alert"
    >
      <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-ink">{displayMessage}</p>
      {onRetry && (
        <Button
          variant="default"
          size="sm"
          onClick={onRetry}
          className="mt-5"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
