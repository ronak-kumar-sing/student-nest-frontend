import { describe, it, expect } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it("takes the first and last initials", () => {
    expect(initials("Asha Verma")).toBe("AV");
    expect(initials("Asha V.")).toBe("AV");
    expect(initials("  rahul  kumar singh ")).toBe("RS");
  });

  it("handles a single name and an empty name", () => {
    expect(initials("asha")).toBe("A");
    expect(initials("")).toBe("?");
    expect(initials(null)).toBe("?");
  });
});
