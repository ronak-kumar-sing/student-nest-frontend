import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusChip } from "./status-chip";

describe("StatusChip", () => {
  it("renders mapped booking status correctly", () => {
    render(<StatusChip status="approved" />);
    const chip = screen.getByText("Approved");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass("bg-mint-slip");
    expect(chip).toHaveClass("text-caption");
  });

  it("renders mapped property status correctly", () => {
    render(<StatusChip status="published" />);
    const chip = screen.getByText("Published");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass("bg-mint-slip");
  });

  it("renders rejected status with pink slip tone", () => {
    render(<StatusChip status="rejected" />);
    const chip = screen.getByText("Rejected");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass("bg-pink-slip");
  });

  it("supports label override", () => {
    render(<StatusChip status="rejected" label="No longer available" />);
    expect(screen.getByText("No longer available")).toBeInTheDocument();
  });
});
