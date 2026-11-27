import { describe, it, expect } from "vitest";
import {
  parseSearchParams,
  filtersToSearchParams,
  cityName,
  DEFAULT_CITY,
  type RoomFilters,
  type TenancyType,
  type SortOption,
} from "./search-params";
import type { RoomType, GenderPolicy, Amenity } from "@/lib/api";

describe("search-params", () => {
  it("defaults to indore when city is missing or empty", () => {
    const fromEmptyObj = parseSearchParams({});
    expect(fromEmptyObj.city).toBe(DEFAULT_CITY);

    const fromEmptyParams = parseSearchParams(new URLSearchParams());
    expect(fromEmptyParams.city).toBe("indore");

    const fromBlankCity = parseSearchParams({ city: "" });
    expect(fromBlankCity.city).toBe("indore");
  });

  it("drops invalid enums and invalid numbers", () => {
    const parsed = parseSearchParams({
      city: "bhopal",
      roomType: ["invalid_room_type", "pg", "not_a_type", "1bhk"] as unknown as RoomType[],
      genderPolicy: "alien_only" as unknown as GenderPolicy,
      amenities: ["wifi", "invalid_amenity", "gym"] as unknown as Amenity[],
      minRent: "not-a-number",
      maxRent: "-100",
      tenancyType: "invalid_tenancy" as unknown as TenancyType,
      sort: "by_popularity" as unknown as SortOption,
    });

    expect(parsed.city).toBe("bhopal");
    expect(parsed.roomType).toEqual(["pg", "1bhk"]);
    expect(parsed.genderPolicy).toBeUndefined();
    expect(parsed.amenities).toEqual(["wifi", "gym"]);
    expect(parsed.minRent).toBeUndefined();
    expect(parsed.maxRent).toBeUndefined();
    expect(parsed.tenancyType).toBeUndefined();
    expect(parsed.sort).toBeUndefined();
  });

  it("handles round trip correctly", () => {
    const original: RoomFilters = {
      city: "pune",
      q: "near MIT college",
      minRent: 6000,
      maxRent: 18000,
      roomType: ["1rk", "pg"],
      genderPolicy: "male_only",
      amenities: ["wifi", "geyser"],
      tenancyType: "per_bed",
      food: "breakfast",
      sort: "rent_asc",
    };

    const searchParams = filtersToSearchParams(original);
    const roundTripped = parseSearchParams(searchParams);

    expect(roundTripped).toEqual(original);
  });

  it("maps city slugs to user-facing city names", () => {
    expect(cityName("indore")).toBe("Indore");
    expect(cityName("bhopal")).toBe("Bhopal");
    expect(cityName("pune")).toBe("Pune");
    expect(cityName("nagpur")).toBe("Nagpur");
    expect(cityName("")).toBe("");
    expect(cityName(null)).toBe("");
    expect(cityName(undefined)).toBe("");
  });
});
