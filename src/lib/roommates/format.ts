import { formatRupees, formatDate } from "@/lib/api/format";
import type { Lifestyle, Interest } from "@/lib/api/roommates";

export const DIET_LABELS: Record<Lifestyle["diet"], string> = {
  veg: "Vegetarian",
  non_veg: "Non-vegetarian",
  eggetarian: "Eggetarian",
};

export const SLEEP_LABELS: Record<Lifestyle["sleepSchedule"], string> = {
  early: "Early riser",
  late: "Night owl",
  flexible: "Flexible",
};

export const GUESTS_LABELS: Record<Lifestyle["guests"], string> = {
  rarely: "Guests rarely",
  sometimes: "Guests sometimes",
  often: "Guests often",
};

export const STUDY_LABELS: Record<Lifestyle["studyHabits"], string> = {
  quiet: "Quiet study",
  music: "Studies with music",
  flexible: "Flexible study",
};

export const INTEREST_LABELS: Record<Interest, string> = {
  music: "Music",
  movies: "Movies",
  reading: "Reading",
  gaming: "Gaming",
  sports: "Sports",
  fitness: "Fitness",
  cooking: "Cooking",
  travel: "Travel",
  coding: "Coding",
  art: "Art",
  photography: "Photography",
  dance: "Dance",
  anime: "Anime",
  yoga: "Yoga",
  writing: "Writing",
  theatre: "Theatre",
};

export function formatCleanliness(score: number): string {
  if (score === 1) return "1, relaxed";
  if (score === 5) return "5, spotless";
  return String(score);
}

export function formatBudgetRange(minPaise: number, maxPaise: number): string {
  return `${formatRupees(minPaise)} to ${formatRupees(maxPaise)} a month`;
}

export function formatMoveIn(date: string | Date | number): string {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    const d = new Date(date.trim() + "T00:00:00Z");
    const formatted = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
    return `Moving in by ${formatted}`;
  }
  return `Moving in by ${formatDate(date)}`;
}

export function formatMatchScore(score: number): string {
  return `${Math.round(score)}% match`;
}

export function localityLabel(slug: string): string {
  const words = slug.trim().replace(/[-_]+/g, " ");
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}
