import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "./error-state";
import { ApiError } from "@/lib/api/errors";

describe("ErrorState", () => {
  it("renders the friendly message and calls onRetry when Try again is clicked", async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    const apiError = new ApiError(
      403,
      "PHONE_REQUIRED",
      "Phone required error from backend"
    );

    render(
      <ErrorState
        title="Application issue"
        error={apiError}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText("Application issue")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Booking needs a verified phone number on your account. Phone verification isn't available on the web yet."
      )
    ).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders custom message when message prop is provided", () => {
    render(
      <ErrorState
        title="Custom error"
        message="This is a custom error message."
      />
    );
    expect(screen.getByText("Custom error")).toBeInTheDocument();
    expect(screen.getByText("This is a custom error message.")).toBeInTheDocument();
  });
});
