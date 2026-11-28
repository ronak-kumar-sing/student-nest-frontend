import { describe, it, expect } from "vitest";
import {
  profileFormFromMe,
  validateProfileForm,
  changedFields,
  type ProfileFormValues,
} from "./profile-form";
import type { UserMe } from "@/lib/api";

describe("profile-form utilities", () => {
  const baseMe = {
    id: "user-1",
    role: "student",
    status: "active",
    email: "student@example.com",
    emailVerified: true,
    phoneVerified: false,
    displayName: "Asha Verma",
    bio: "Final year student.",
    gender: "female",
    college: "IIPS Indore",
    city: "indore",
  } as unknown as UserMe;

  it("profileFormFromMe extracts form values from UserMe", () => {
    const values = profileFormFromMe(baseMe);
    expect(values).toEqual({
      displayName: "Asha Verma",
      bio: "Final year student.",
      gender: "female",
      college: "IIPS Indore",
      city: "indore",
    });
  });

  it("validateProfileForm validates displayName, bio and college bounds", () => {
    const valid: ProfileFormValues = {
      displayName: "Asha Verma",
      bio: "Short bio",
      gender: "female",
      college: "IIPS Indore",
      city: "indore",
    };
    expect(validateProfileForm(valid)).toEqual({});

    // Too short name (< 2 chars)
    expect(
      validateProfileForm({ ...valid, displayName: "A" }).displayName
    ).toBe("Enter your name (2 to 50 characters).");

    // Too long name (> 50 chars)
    expect(
      validateProfileForm({ ...valid, displayName: "A".repeat(51) }).displayName
    ).toBe("Enter your name (2 to 50 characters).");

    // Whitespace only name
    expect(
      validateProfileForm({ ...valid, displayName: "   " }).displayName
    ).toBe("Enter your name (2 to 50 characters).");

    // Bio > 300 chars
    expect(
      validateProfileForm({ ...valid, bio: "B".repeat(301) }).bio
    ).toBe("Keep your bio to 300 characters or fewer.");

    // College > 100 chars
    expect(
      validateProfileForm({ ...valid, college: "C".repeat(101) }).college
    ).toBe("Keep the college name to 100 characters or fewer.");
  });

  it("changedFields returns only modified fields with trimmed values", () => {
    const initial: ProfileFormValues = {
      displayName: "Asha Verma",
      bio: "Initial bio",
      gender: "female",
      college: "IIPS Indore",
      city: "indore",
    };

    // No changes
    expect(changedFields(initial, { ...initial })).toEqual({});

    // Whitespace changes only for untrimmed should not trigger change if trimmed equals
    expect(
      changedFields(initial, {
        ...initial,
        displayName: "  Asha Verma  ",
      })
    ).toEqual({});

    // Change displayName and college
    expect(
      changedFields(initial, {
        ...initial,
        displayName: "Asha V Verma",
        college: "DAVV Indore",
      })
    ).toEqual({
      displayName: "Asha V Verma",
      college: "DAVV Indore",
    });

    // Emptied bio and college are sent as ""
    expect(
      changedFields(initial, {
        ...initial,
        bio: "   ",
        college: "",
      })
    ).toEqual({
      bio: "",
      college: "",
    });

    // gender only when not ""
    expect(
      changedFields(
        { ...initial, gender: "" },
        { ...initial, gender: "male" }
      )
    ).toEqual({
      gender: "male",
    });
    expect(
      changedFields(initial, { ...initial, gender: "" })
    ).toEqual({});

    // city only when not ""
    expect(
      changedFields(
        { ...initial, city: "" },
        { ...initial, city: "pune" }
      )
    ).toEqual({
      city: "pune",
    });
    expect(
      changedFields(initial, { ...initial, city: "" })
    ).toEqual({});
  });
});
