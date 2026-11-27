import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TearOffStrip } from "./tear-off-strip";

describe("TearOffStrip", () => {
  it("renders active link and empty decorative tabs in horizontal orientation", () => {
    const { container } = render(
      <TearOffStrip label="Contact owner" href="/rooms/123" count={4} activeTabIndex={0} />
    );

    const link = screen.getByRole("link", { name: "Contact owner" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/rooms/123");

    // Decorative tabs must have aria-hidden and not repeat the label text
    const decorativeTabs = container.querySelectorAll('[aria-hidden="true"]');
    expect(decorativeTabs.length).toBe(3);
    decorativeTabs.forEach((tab) => {
      expect(tab.textContent).toBe("");
    });
  });

  it("supports vertical orientation", () => {
    const { container } = render(
      <TearOffStrip
        label="Contact owner"
        href="/rooms/123"
        orientation="vertical"
        count={3}
        activeTabIndex={0}
      />
    );

    const strip = container.querySelector(".handbill-tear-strip-v");
    expect(strip).toBeInTheDocument();
  });
});
