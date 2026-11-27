import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("keeps both text-caption (font-size) and text-ink (text-color)", () => {
    const merged = cn("text-caption", "text-ink");
    expect(merged).toContain("text-caption");
    expect(merged).toContain("text-ink");
  });

  it("handles custom text scale font-sizes correctly", () => {
    expect(cn("text-body", "text-muted-ink")).toBe("text-body text-muted-ink");
    expect(cn("text-lead", "text-ink")).toBe("text-lead text-ink");
    expect(cn("text-title", "text-ballpoint")).toBe("text-title text-ballpoint");
    expect(cn("text-display", "text-ink")).toBe("text-display text-ink");
    expect(cn("text-hero", "text-ink")).toBe("text-hero text-ink");
  });

  it("overrides earlier font sizes with later ones", () => {
    expect(cn("text-caption", "text-lead")).toBe("text-lead");
  });

  it("overrides earlier text colors with later ones", () => {
    expect(cn("text-ink", "text-muted-ink")).toBe("text-muted-ink");
  });
});
