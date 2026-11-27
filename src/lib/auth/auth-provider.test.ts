import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({ getFirebaseAuth: vi.fn(), firebaseAuth: {} }));

import { ApiError } from "@/lib/api/errors";
import { isProfileMissing } from "./auth-provider";

describe("isProfileMissing", () => {
  it("treats the API's 403 PROFILE_REQUIRED as a user who still needs to sign up", () => {
    expect(isProfileMissing(new ApiError(403, "PROFILE_REQUIRED", "Complete signup"))).toBe(true);
  });

  it("also accepts a 404 for /users/me", () => {
    expect(isProfileMissing(new ApiError(404, "NOT_FOUND", "Not found"))).toBe(true);
  });

  it("does not treat other errors as a missing profile", () => {
    expect(isProfileMissing(new ApiError(403, "FORBIDDEN", "No"))).toBe(false);
    expect(isProfileMissing(new Error("network"))).toBe(false);
    expect(isProfileMissing(undefined)).toBe(false);
  });
});
