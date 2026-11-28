import { describe, it, expect } from "vitest";
import {
  toLocalitySlug,
  todayInIst,
  emptyWizardValues,
  wizardValuesFromProfile,
  validateStep,
  validateAll,
  toUpsertDto,
  type WizardValues,
} from "./wizard";
import type { RoommateProfile, Interest } from "@/lib/api/roommates";

function createValidValues(): WizardValues {
  return {
    citySlug: "indore",
    localities: ["vijay-nagar", "bhawarkua"],
    budgetMin: "6000",
    budgetMax: "8000",
    moveInBy: "2026-12-01",
    preferredGender: "any",
    smoking: false,
    drinking: false,
    pets: true,
    diet: "veg",
    sleepSchedule: "early",
    cleanliness: 4,
    guests: "sometimes",
    studyHabits: "quiet",
    bio: "Final-year student who likes a quiet flat.",
    interests: ["reading", "coding"],
    college: "IIPS Indore",
  };
}

describe("wizard logic", () => {
  describe("toLocalitySlug", () => {
    it("converts strings to clean slug format", () => {
      expect(toLocalitySlug("Vijay Nagar ")).toBe("vijay-nagar");
      expect(toLocalitySlug("Vijay__Nagar")).toBe("vijay-nagar");
      expect(toLocalitySlug("  Palasia  ")).toBe("palasia");
      expect(toLocalitySlug("Bhawarkua 123")).toBe("bhawarkua-123");
      expect(toLocalitySlug("---Sector-12---")).toBe("sector-12");
      expect(toLocalitySlug("Vijay & Nagar!")).toBe("vijay-nagar");
    });
  });

  describe("todayInIst", () => {
    it("returns YYYY-MM-DD in Asia/Kolkata timezone", () => {
      // 20:00 UTC on 2026-11-27 is 01:30 IST on 2026-11-28
      const utcInstant = new Date("2026-11-27T20:00:00Z");
      expect(todayInIst(utcInstant)).toBe("2026-11-28");
    });
  });

  describe("emptyWizardValues", () => {
    it("defaults to indore when no city provided or city is unknown", () => {
      const v1 = emptyWizardValues();
      expect(v1.citySlug).toBe("indore");

      const v2 = emptyWizardValues({ citySlug: "unknown-city" });
      expect(v2.citySlug).toBe("indore");
    });

    it("uses provided known city and prefilled college", () => {
      const v = emptyWizardValues({ citySlug: "pune", college: "COEP" });
      expect(v.citySlug).toBe("pune");
      expect(v.college).toBe("COEP");
      expect(v.preferredGender).toBe("any");
      expect(v.smoking).toBeNull();
      expect(v.diet).toBe("");
    });
  });

  describe("wizardValuesFromProfile", () => {
    it("converts paise to rupees and populates fields correctly", () => {
      const profile: RoommateProfile = {
        citySlug: "bhopal",
        preferredLocalities: ["mp-nagar"],
        budgetMinPaise: 750000,
        budgetMaxPaise: 900000,
        moveInBy: "2026-12-15",
        gender: "female",
        preferredGender: "same",
        lifestyle: {
          smoking: false,
          drinking: false,
          diet: "veg",
          pets: false,
          sleepSchedule: "flexible",
          cleanliness: 5,
          guests: "rarely",
          studyHabits: "quiet",
        },
        bio: "Looking for a roommate.",
        interests: ["music", "art"],
        college: "MANIT Bhopal",
        isActive: true,
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-01T00:00:00.000Z",
      };

      const values = wizardValuesFromProfile(profile);
      expect(values.citySlug).toBe("bhopal");
      expect(values.localities).toEqual(["mp-nagar"]);
      expect(values.budgetMin).toBe("7500");
      expect(values.budgetMax).toBe("9000");
      expect(values.moveInBy).toBe("2026-12-15");
      expect(values.preferredGender).toBe("same");
      expect(values.cleanliness).toBe(5);
      expect(values.college).toBe("MANIT Bhopal");
    });
  });

  describe("validateStep 1 (City and localities)", () => {
    const ctx = { today: "2026-11-28" };

    it("passes with valid city and localities", () => {
      const values = createValidValues();
      const errors = validateStep(1, values, ctx);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("passes when localities array is empty", () => {
      const values = { ...createValidValues(), localities: [] };
      const errors = validateStep(1, values, ctx);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("fails when city is empty", () => {
      const values = { ...createValidValues(), citySlug: "   " };
      const errors = validateStep(1, values, ctx);
      expect(errors.citySlug).toBe("Choose a city.");
    });

    it("fails when more than 5 localities are given", () => {
      const values = {
        ...createValidValues(),
        localities: ["loc-1", "loc-2", "loc-3", "loc-4", "loc-5", "loc-6"],
      };
      const errors = validateStep(1, values, ctx);
      expect(errors.localities).toBe("Add up to 5 localities.");
    });

    it("fails when any locality violates slug regex", () => {
      const values = {
        ...createValidValues(),
        localities: ["valid-loc", "Invalid_Loc!"],
      };
      const errors = validateStep(1, values, ctx);
      expect(errors.localities).toBe("Use letters and numbers only for localities.");
    });

    it("fails on duplicate localities", () => {
      const values = {
        ...createValidValues(),
        localities: ["vijay-nagar", "vijay-nagar"],
      };
      const errors = validateStep(1, values, ctx);
      expect(errors.localities).toBe("Each locality can be added once.");
    });
  });

  describe("validateStep 2 (Budget and move-in)", () => {
    const ctx = { today: "2026-11-28" };

    it("passes with valid budget and move-in date", () => {
      const values = createValidValues();
      const errors = validateStep(2, values, ctx);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("fails when budgetMin or budgetMax is not a whole number", () => {
      const v1 = { ...createValidValues(), budgetMin: "abc" };
      expect(validateStep(2, v1, ctx).budgetMin).toBe(
        "Enter your lowest budget in rupees."
      );

      const v2 = { ...createValidValues(), budgetMax: "12.5" };
      expect(validateStep(2, v2, ctx).budgetMax).toBe(
        "Enter your highest budget in rupees."
      );

      const v3 = { ...createValidValues(), budgetMin: "" };
      expect(validateStep(2, v3, ctx).budgetMin).toBe(
        "Enter your lowest budget in rupees."
      );
    });

    it("fails when budget exceeds ₹1,00,000", () => {
      const v1 = { ...createValidValues(), budgetMin: "100001" };
      expect(validateStep(2, v1, ctx).budgetMin).toBe(
        "Budgets go up to ₹1,00,000 a month."
      );

      const v2 = { ...createValidValues(), budgetMax: "150000" };
      expect(validateStep(2, v2, ctx).budgetMax).toBe(
        "Budgets go up to ₹1,00,000 a month."
      );
    });

    it("fails when budgetMin is strictly greater than budgetMax", () => {
      const values = {
        ...createValidValues(),
        budgetMin: "9000",
        budgetMax: "7000",
      };
      const errors = validateStep(2, values, ctx);
      expect(errors.budgetMax).toBe(
        "Your highest budget must be at least your lowest budget."
      );
    });

    it("allows budgetMin equal to budgetMax", () => {
      const values = {
        ...createValidValues(),
        budgetMin: "8000",
        budgetMax: "8000",
      };
      const errors = validateStep(2, values, ctx);
      expect(errors.budgetMax).toBeUndefined();
    });

    it("fails when moveInBy is empty or not YYYY-MM-DD", () => {
      const v1 = { ...createValidValues(), moveInBy: "" };
      expect(validateStep(2, v1, ctx).moveInBy).toBe("Choose a move-in date.");

      const v2 = { ...createValidValues(), moveInBy: "01-12-2026" };
      expect(validateStep(2, v2, ctx).moveInBy).toBe("Choose a move-in date.");
    });

    it("fails when moveInBy is in the past relative to ctx.today", () => {
      const values = { ...createValidValues(), moveInBy: "2026-11-27" };
      const errors = validateStep(2, values, ctx);
      expect(errors.moveInBy).toBe("Choose today or a later date.");
    });

    it("passes when moveInBy is exactly today", () => {
      const values = { ...createValidValues(), moveInBy: "2026-11-28" };
      const errors = validateStep(2, values, ctx);
      expect(errors.moveInBy).toBeUndefined();
    });
  });

  describe("validateStep 3 (Lifestyle)", () => {
    const ctx = { today: "2026-11-28", userGender: "female" };

    it("passes with valid lifestyle and preferredGender", () => {
      const values = createValidValues();
      const errors = validateStep(3, values, ctx);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("fails if any lifestyle field is unset", () => {
      const fields: Array<keyof WizardValues> = [
        "smoking",
        "drinking",
        "pets",
        "diet",
        "sleepSchedule",
        "cleanliness",
        "guests",
        "studyHabits",
      ];

      for (const field of fields) {
        const values = {
          ...createValidValues(),
          [field]: field === "cleanliness" ? null : field === "smoking" || field === "drinking" || field === "pets" ? null : "",
        };
        const errors = validateStep(3, values, ctx);
        expect(errors[field]).toBe("Choose one option.");
      }
    });

    it("validates preferredGender same against userGender", () => {
      const sameValues = {
        ...createValidValues(),
        preferredGender: "same" as const,
      };

      // With missing userGender
      const err1 = validateStep(3, sameValues, { today: "2026-11-28", userGender: null });
      expect(err1.preferredGender).toBe(
        "Set your gender on your profile first, or choose anyone."
      );

      // With undisclosed userGender
      const err2 = validateStep(3, sameValues, { today: "2026-11-28", userGender: "undisclosed" });
      expect(err2.preferredGender).toBe(
        "Set your gender on your profile first, or choose anyone."
      );

      // With set userGender
      const valid = validateStep(3, sameValues, { today: "2026-11-28", userGender: "female" });
      expect(valid.preferredGender).toBeUndefined();
    });
  });

  describe("validateStep 4 (Bio and interests)", () => {
    const ctx = { today: "2026-11-28" };

    it("passes with valid bio, interests and college", () => {
      const values = createValidValues();
      const errors = validateStep(4, values, ctx);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("fails when bio is longer than 300 characters", () => {
      const values = { ...createValidValues(), bio: "a".repeat(301) };
      const errors = validateStep(4, values, ctx);
      expect(errors.bio).toBe("Keep your bio to 300 characters or fewer.");
    });

    it("fails when interests count exceeds 10", () => {
      const values = {
        ...createValidValues(),
        interests: [
          "music",
          "movies",
          "reading",
          "gaming",
          "sports",
          "fitness",
          "cooking",
          "travel",
          "coding",
          "art",
          "dance",
        ] as Interest[],
      };
      const errors = validateStep(4, values, ctx);
      expect(errors.interests).toBe("Choose up to 10 interests.");
    });

    it("fails when college name exceeds 100 characters", () => {
      const values = { ...createValidValues(), college: "a".repeat(101) };
      const errors = validateStep(4, values, ctx);
      expect(errors.college).toBe("Keep the college name to 100 characters or fewer.");
    });
  });

  describe("validateAll", () => {
    it("merges errors across all steps", () => {
      const values = {
        ...createValidValues(),
        citySlug: "",
        budgetMin: "invalid",
        diet: "" as const,
        bio: "a".repeat(301),
      };
      const ctx = { today: "2026-11-28", userGender: "male" };
      const errors = validateAll(values, ctx);

      expect(errors.citySlug).toBe("Choose a city.");
      expect(errors.budgetMin).toBe("Enter your lowest budget in rupees.");
      expect(errors.diet).toBe("Choose one option.");
      expect(errors.bio).toBe("Keep your bio to 300 characters or fewer.");
    });
  });

  describe("toUpsertDto", () => {
    it("multiplies rupees by 100, trims bio, and sets college when present", () => {
      const values = createValidValues();
      const dto = toUpsertDto(values);

      expect(dto.budgetMinPaise).toBe(600000);
      expect(dto.budgetMaxPaise).toBe(800000);
      expect(dto.bio).toBe("Final-year student who likes a quiet flat.");
      expect(dto.college).toBe("IIPS Indore");
      expect(dto.lifestyle).toEqual({
        smoking: false,
        drinking: false,
        pets: true,
        diet: "veg",
        sleepSchedule: "early",
        cleanliness: 4,
        guests: "sometimes",
        studyHabits: "quiet",
      });
    });

    it("omits college when empty or whitespace", () => {
      const values = { ...createValidValues(), college: "   " };
      const dto = toUpsertDto(values);
      expect(dto.college).toBeUndefined();
    });
  });
});
