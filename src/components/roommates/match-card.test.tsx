import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchCard } from "./match-card";
import type { RoommateMatch } from "@/lib/api/roommates";

const mockMatch: RoommateMatch = {
  score: 86.4,
  reasons: ["Budgets overlap ₹6–8k", "Both vegetarian", "Same college"],
  profile: {
    id: "uid-asha",
    displayName: "Asha V.",
    avatarUrl: null,
    citySlug: "indore",
    preferredLocalities: ["vijay-nagar"],
    budgetMinPaise: 600000,
    budgetMaxPaise: 800000,
    moveInBy: "2026-12-01",
    gender: "female",
    preferredGender: "same",
    lifestyle: {
      smoking: false,
      drinking: false,
      diet: "veg",
      pets: true,
      sleepSchedule: "early",
      cleanliness: 4,
      guests: "sometimes",
      studyHabits: "quiet",
    },
    bio: "Final year student looking for a neat place.",
    interests: ["reading", "music"],
  },
};

describe("MatchCard", () => {
  it("renders match details, score, reasons, and handles sending requests", async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();

    const { rerender } = render(
      <MatchCard
        match={mockMatch}
        sendState="idle"
        onSend={handleSend}
      />
    );

    // Score assertion: 86.4 rounded to 86% match
    expect(screen.getByText("86% match")).toBeInTheDocument();

    // Name and budget range
    expect(screen.getByText("Asha V.")).toBeInTheDocument();
    expect(screen.getByText("₹6,000 to ₹8,000 a month")).toBeInTheDocument();

    // Reasons inside the "Why you match" list
    const reasonsList = screen.getByRole("list", { name: "Why you match" });
    expect(reasonsList).toBeInTheDocument();
    const reasonItems = within(reasonsList).getAllByRole("listitem");
    expect(reasonItems).toHaveLength(3);
    expect(reasonItems[0]).toHaveTextContent("Budgets overlap ₹6–8k");
    expect(reasonItems[1]).toHaveTextContent("Both vegetarian");
    expect(reasonItems[2]).toHaveTextContent("Same college");

    // Click "Send request" reveals the inline message form
    const sendButton = screen.getByRole("button", { name: "Send request" });
    await user.click(sendButton);

    const textarea = screen.getByLabelText("Message (optional)");
    expect(textarea).toBeInTheDocument();

    await user.type(textarea, "Hi");

    const submitButton = screen.getByRole("button", { name: "Send request" });
    await user.click(submitButton);

    expect(handleSend).toHaveBeenCalledWith("uid-asha", "Hi");

    // When sendState is sent, it shows "Request sent" and no button
    rerender(
      <MatchCard
        match={mockMatch}
        sendState="sent"
        onSend={handleSend}
      />
    );

    expect(screen.getByText("Request sent")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send request" })).not.toBeInTheDocument();
  });
});
