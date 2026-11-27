import { describe, it, expect } from "vitest";
import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("allows safe internal paths", () => {
    expect(safeNextPath("/rooms")).toBe("/rooms");
    expect(safeNextPath("/rooms?city=indore&minRent=5000")).toBe(
      "/rooms?city=indore&minRent=5000"
    );
    expect(safeNextPath("/bookings")).toBe("/bookings");
    expect(safeNextPath("/favorites")).toBe("/favorites");
  });

  it("rejects protocol-relative and external urls", () => {
    expect(safeNextPath("//evil.com")).toBe("/rooms");
    expect(safeNextPath("//google.com/malicious")).toBe("/rooms");
    expect(safeNextPath("/\\evil.com")).toBe("/rooms");
    expect(safeNextPath("https://evil.com")).toBe("/rooms");
    expect(safeNextPath("http://evil.com/login")).toBe("/rooms");
  });

  it("rejects javascript schemes and invalid paths", () => {
    expect(safeNextPath("javascript:alert(1)")).toBe("/rooms");
    expect(safeNextPath("/javascript:void(0)")).toBe("/rooms");
    expect(safeNextPath("")).toBe("/rooms");
    expect(safeNextPath(null)).toBe("/rooms");
    expect(safeNextPath(undefined)).toBe("/rooms");
  });
});
