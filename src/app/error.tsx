"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/states/error-state";

export default function ErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Log unexpected client-side errors for telemetry
    console.error("ErrorBoundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <ErrorState
          title="Something went wrong on this page"
          message="This page hit an unexpected error. Try again, or go back to the room list."
          error={error}
          onRetry={() => unstable_retry()}
        />
      </div>
    </div>
  );
}
