import { describe, it, expect } from "vitest";
import {
  formatMoveIn,
  formatMatchScore,
  formatBudgetRange,
  localityLabel,
} from "./format";

describe("roommate format helpers", () => {
  it("formats move-in date safely across any timezone", () => {
    expect(formatMoveIn("2026-12-01")).toBe("Moving in by 1 Dec 2026");
  });

  it("formats match score rounded to percentage", () => {
    expect(formatMatchScore(86.4)).toBe("86% match");
  });

  it("formats budget range in rupees", () => {
    expect(formatBudgetRange(600000, 800000)).toBe(
      "₹6,000 to ₹8,000 a month"
    );
  });

  it("formats locality slug into sentence case", () => {
    expect(localityLabel("vijay-nagar")).toBe("Vijay nagar");
  });
});
