import { describe, it, expect } from "vitest";
import {
  formatRupees,
  formatRoomType,
  formatAmenity,
  formatGenderPolicy,
  formatFood,
  formatBookingStatus,
  formatPropertyStatus,
  formatDate,
} from "./format";

describe("api/format", () => {
  it("formats paise into rounded rupees using en-IN grouping", () => {
    expect(formatRupees(850000)).toBe("₹8,500");
    expect(formatRupees(1700000)).toBe("₹17,000");
    expect(formatRupees(0)).toBe("₹0");
    expect(formatRupees(15000000)).toBe("₹1,50,000");
  });

  it("formats room types to human readable strings", () => {
    expect(formatRoomType("1rk")).toBe("1 RK");
    expect(formatRoomType("1bhk")).toBe("1 BHK");
    expect(formatRoomType("pg")).toBe("PG");
    expect(formatRoomType("shared_room")).toBe("Shared room");
    expect(formatRoomType("unknown")).toBe("unknown");
  });

  it("formats amenities to human readable strings", () => {
    expect(formatAmenity("wifi")).toBe("Wi-Fi");
    expect(formatAmenity("ac")).toBe("AC");
    expect(formatAmenity("power_backup")).toBe("Power backup");
    expect(formatAmenity("washing_machine")).toBe("Washing machine");
    expect(formatAmenity("unknown")).toBe("unknown");
  });

  it("formats gender policies and food inclusion", () => {
    expect(formatGenderPolicy("male_only")).toBe("Men only");
    expect(formatGenderPolicy("female_only")).toBe("Women only");
    expect(formatGenderPolicy("any")).toBe("Anyone");
    expect(formatFood("none")).toBe("No food included");
    expect(formatFood("breakfast")).toBe("Breakfast included");
  });

  it("formats booking and property statuses", () => {
    expect(formatBookingStatus("approved")).toBe("Approved");
    expect(formatBookingStatus("pending")).toBe("Pending");
    expect(formatPropertyStatus("published")).toBe("Published");
    expect(formatPropertyStatus("pending_review")).toBe("Under review");
  });

  it("formats date strings into readable date", () => {
    const formatted = formatDate("2026-11-15T00:00:00.000Z");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Nov");
  });
});
