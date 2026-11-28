import { CITIES } from "@/lib/search-params";
import type {
  RoommateProfile,
  UpsertRoommateProfile,
  Lifestyle,
  Interest,
} from "@/lib/api/roommates";

export const WIZARD_STEPS = [
  { id: 1, title: "City and localities" },
  { id: 2, title: "Budget and move-in" },
  { id: 3, title: "Lifestyle" },
  { id: 4, title: "Bio and interests" },
] as const;

export interface WizardValues {
  citySlug: string;
  localities: string[];
  budgetMin: string;
  budgetMax: string;
  moveInBy: string;
  preferredGender: "any" | "same";
  smoking: boolean | null;
  drinking: boolean | null;
  pets: boolean | null;
  diet: Lifestyle["diet"] | "";
  sleepSchedule: Lifestyle["sleepSchedule"] | "";
  cleanliness: number | null;
  guests: Lifestyle["guests"] | "";
  studyHabits: Lifestyle["studyHabits"] | "";
  bio: string;
  interests: Interest[];
  college: string;
}

export function emptyWizardValues(defaults?: {
  citySlug?: string;
  college?: string;
}): WizardValues {
  const isKnownCity = defaults?.citySlug
    ? CITIES.some(
        (c) => c.slug.toLowerCase() === defaults.citySlug?.toLowerCase()
      )
    : false;
  const citySlug = isKnownCity
    ? defaults!.citySlug!.toLowerCase()
    : "indore";

  return {
    citySlug,
    localities: [],
    budgetMin: "",
    budgetMax: "",
    moveInBy: "",
    preferredGender: "any",
    smoking: null,
    drinking: null,
    pets: null,
    diet: "",
    sleepSchedule: "",
    cleanliness: null,
    guests: "",
    studyHabits: "",
    bio: "",
    interests: [],
    college: defaults?.college?.trim() ?? "",
  };
}

export function wizardValuesFromProfile(p: RoommateProfile): WizardValues {
  return {
    citySlug: p.citySlug,
    localities: [...p.preferredLocalities],
    budgetMin: String(Math.round(p.budgetMinPaise / 100)),
    budgetMax: String(Math.round(p.budgetMaxPaise / 100)),
    moveInBy: p.moveInBy,
    preferredGender: p.preferredGender,
    smoking: p.lifestyle.smoking,
    drinking: p.lifestyle.drinking,
    pets: p.lifestyle.pets,
    diet: p.lifestyle.diet,
    sleepSchedule: p.lifestyle.sleepSchedule,
    cleanliness: p.lifestyle.cleanliness,
    guests: p.lifestyle.guests,
    studyHabits: p.lifestyle.studyHabits,
    bio: p.bio ?? "",
    interests: [...p.interests],
    college: p.college ?? "",
  };
}

export function toLocalitySlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function todayInIst(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type WizardErrors = Partial<Record<keyof WizardValues, string>>;

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateStep(
  step: 1 | 2 | 3 | 4,
  values: WizardValues,
  ctx: { today: string; userGender?: string | null }
): WizardErrors {
  const errors: WizardErrors = {};

  if (step === 1) {
    if (!values.citySlug.trim()) {
      errors.citySlug = "Choose a city.";
    }
    if (values.localities.length > 5) {
      errors.localities = "Add up to 5 localities.";
    } else if (values.localities.some((loc) => !SLUG_REGEX.test(loc))) {
      errors.localities = "Use letters and numbers only for localities.";
    } else {
      const seen = new Set<string>();
      let hasDuplicates = false;
      for (const loc of values.localities) {
        if (seen.has(loc)) {
          hasDuplicates = true;
          break;
        }
        seen.add(loc);
      }
      if (hasDuplicates) {
        errors.localities = "Each locality can be added once.";
      }
    }
  } else if (step === 2) {
    const minStr = values.budgetMin.trim();
    const maxStr = values.budgetMax.trim();
    const isMinWholeNumber = /^\d+$/.test(minStr);
    const isMaxWholeNumber = /^\d+$/.test(maxStr);

    if (!isMinWholeNumber) {
      errors.budgetMin = "Enter your lowest budget in rupees.";
    } else if (Number(minStr) > 100000) {
      errors.budgetMin = "Budgets go up to ₹1,00,000 a month.";
    }

    if (!isMaxWholeNumber) {
      errors.budgetMax = "Enter your highest budget in rupees.";
    } else if (Number(maxStr) > 100000) {
      errors.budgetMax = "Budgets go up to ₹1,00,000 a month.";
    } else if (isMinWholeNumber && Number(minStr) <= 100000) {
      if (Number(minStr) > Number(maxStr)) {
        errors.budgetMax = "Your highest budget must be at least your lowest budget.";
      }
    }

    const moveIn = values.moveInBy.trim();
    if (!moveIn || !/^\d{4}-\d{2}-\d{2}$/.test(moveIn)) {
      errors.moveInBy = "Choose a move-in date.";
    } else if (moveIn < ctx.today) {
      errors.moveInBy = "Choose today or a later date.";
    }
  } else if (step === 3) {
    if (values.smoking === null) {
      errors.smoking = "Choose one option.";
    }
    if (values.drinking === null) {
      errors.drinking = "Choose one option.";
    }
    if (values.pets === null) {
      errors.pets = "Choose one option.";
    }
    if (!values.diet) {
      errors.diet = "Choose one option.";
    }
    if (!values.sleepSchedule) {
      errors.sleepSchedule = "Choose one option.";
    }
    if (values.cleanliness === null) {
      errors.cleanliness = "Choose one option.";
    }
    if (!values.guests) {
      errors.guests = "Choose one option.";
    }
    if (!values.studyHabits) {
      errors.studyHabits = "Choose one option.";
    }
    if (values.preferredGender === "same") {
      if (!ctx.userGender || ctx.userGender === "undisclosed") {
        errors.preferredGender =
          "Set your gender on your profile first, or choose anyone.";
      }
    }
  } else if (step === 4) {
    if (values.bio.length > 300) {
      errors.bio = "Keep your bio to 300 characters or fewer.";
    }
    if (values.interests.length > 10) {
      errors.interests = "Choose up to 10 interests.";
    }
    if (values.college.length > 100) {
      errors.college = "Keep the college name to 100 characters or fewer.";
    }
  }

  return errors;
}

export function validateAll(
  values: WizardValues,
  ctx: { today: string; userGender?: string | null }
): WizardErrors {
  return {
    ...validateStep(1, values, ctx),
    ...validateStep(2, values, ctx),
    ...validateStep(3, values, ctx),
    ...validateStep(4, values, ctx),
  };
}

export function toUpsertDto(values: WizardValues): UpsertRoommateProfile {
  const dto: UpsertRoommateProfile = {
    citySlug: values.citySlug,
    preferredLocalities: [...values.localities],
    budgetMinPaise: Math.round(Number(values.budgetMin.trim()) * 100),
    budgetMaxPaise: Math.round(Number(values.budgetMax.trim()) * 100),
    moveInBy: values.moveInBy.trim(),
    preferredGender: values.preferredGender,
    lifestyle: {
      smoking: values.smoking === true,
      drinking: values.drinking === true,
      pets: values.pets === true,
      diet: values.diet as Lifestyle["diet"],
      sleepSchedule: values.sleepSchedule as Lifestyle["sleepSchedule"],
      cleanliness: values.cleanliness ?? 1,
      guests: values.guests as Lifestyle["guests"],
      studyHabits: values.studyHabits as Lifestyle["studyHabits"],
    },
    bio: values.bio.trim(),
    interests: [...values.interests],
  };

  const collegeTrimmed = values.college.trim();
  if (collegeTrimmed) {
    dto.college = collegeTrimmed;
  }

  return dto;
}
