import type { RoomType, GenderPolicy, Amenity } from "./api";

export const CITIES = [
  { slug: "indore", name: "Indore" },
  { slug: "bhopal", name: "Bhopal" },
  { slug: "pune", name: "Pune" },
] as const;

export const DEFAULT_CITY = "indore";

export const VALID_ROOM_TYPES: RoomType[] = [
  "1rk",
  "1bhk",
  "2bhk",
  "3bhk",
  "pg",
  "hostel",
  "shared_room",
];

export const VALID_GENDER_POLICIES: GenderPolicy[] = [
  "any",
  "male_only",
  "female_only",
];

export const VALID_AMENITIES: Amenity[] = [
  "wifi",
  "ac",
  "geyser",
  "washing_machine",
  "fridge",
  "tv",
  "parking",
  "power_backup",
  "lift",
  "cctv",
  "security_guard",
  "housekeeping",
  "gym",
  "study_table",
  "attached_bathroom",
  "balcony",
  "kitchen",
];

export const VALID_TENANCY_TYPES = ["whole_unit", "per_bed"] as const;
export type TenancyType = (typeof VALID_TENANCY_TYPES)[number];

export const VALID_SORTS = [
  "relevance",
  "rent_asc",
  "rent_desc",
  "distance",
  "rating",
  "newest",
] as const;
export type SortOption = (typeof VALID_SORTS)[number];

export interface RoomFilters {
  city: string;
  q?: string;
  minRent?: number;
  maxRent?: number;
  roomType: RoomType[];
  genderPolicy?: GenderPolicy;
  amenities: Amenity[];
  tenancyType?: TenancyType;
  food?: string;
  sort?: SortOption;
}

export function parseSearchParams(
  input: URLSearchParams | Record<string, string | string[] | undefined>
): RoomFilters {
  const getParam = (key: string): string | undefined => {
    if (input instanceof URLSearchParams) {
      const val = input.get(key);
      return val !== null && val !== "" ? val : undefined;
    }
    const val = input[key];
    if (Array.isArray(val)) {
      return val.length > 0 ? val[0] : undefined;
    }
    return val !== null && val !== "" ? val : undefined;
  };

  const getAllParams = (key: string): string[] => {
    if (input instanceof URLSearchParams) {
      const all = input.getAll(key);
      if (all.length > 0) {
        return all.flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);
      }
      const single = input.get(key);
      if (single) {
        return single.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    }
    const val = input[key];
    if (Array.isArray(val)) {
      return val.flatMap((s) => (s ? s.split(",") : [])).map((s) => s.trim()).filter(Boolean);
    }
    if (typeof val === "string") {
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const rawCity = getParam("city");
  const city = rawCity ? rawCity.trim().toLowerCase() : DEFAULT_CITY;

  const rawQ = getParam("q");
  const q = rawQ && rawQ.trim().length > 0 ? rawQ.trim() : undefined;

  let minRent: number | undefined = undefined;
  const rawMinRent = getParam("minRent");
  if (rawMinRent !== undefined) {
    const num = Number(rawMinRent);
    if (!isNaN(num) && num >= 0 && Number.isFinite(num)) {
      minRent = Math.floor(num);
    }
  }

  let maxRent: number | undefined = undefined;
  const rawMaxRent = getParam("maxRent");
  if (rawMaxRent !== undefined) {
    const num = Number(rawMaxRent);
    if (!isNaN(num) && num >= 0 && Number.isFinite(num)) {
      maxRent = Math.floor(num);
    }
  }

  const rawRoomTypes = getAllParams("roomType");
  const roomType: RoomType[] = [];
  for (const rt of rawRoomTypes) {
    const lower = rt.toLowerCase() as RoomType;
    if (VALID_ROOM_TYPES.includes(lower) && !roomType.includes(lower)) {
      roomType.push(lower);
    }
  }

  let genderPolicy: GenderPolicy | undefined = undefined;
  const rawGender = getParam("genderPolicy");
  if (rawGender) {
    const lower = rawGender.toLowerCase() as GenderPolicy;
    if (VALID_GENDER_POLICIES.includes(lower)) {
      genderPolicy = lower;
    }
  }

  const rawAmenities = getAllParams("amenities");
  const amenities: Amenity[] = [];
  for (const am of rawAmenities) {
    const lower = am.toLowerCase() as Amenity;
    if (VALID_AMENITIES.includes(lower) && !amenities.includes(lower)) {
      amenities.push(lower);
    }
  }

  let tenancyType: TenancyType | undefined = undefined;
  const rawTenancy = getParam("tenancyType");
  if (rawTenancy) {
    const lower = rawTenancy.toLowerCase() as TenancyType;
    if (VALID_TENANCY_TYPES.includes(lower)) {
      tenancyType = lower;
    }
  }

  const rawFood = getParam("food");
  const food = rawFood && rawFood.trim().length > 0 ? rawFood.trim() : undefined;

  let sort: SortOption | undefined = undefined;
  const rawSort = getParam("sort");
  if (rawSort) {
    const lower = rawSort.toLowerCase() as SortOption;
    if (VALID_SORTS.includes(lower)) {
      sort = lower;
    }
  }

  return {
    city: city || DEFAULT_CITY,
    ...(q !== undefined && { q }),
    ...(minRent !== undefined && { minRent }),
    ...(maxRent !== undefined && { maxRent }),
    roomType,
    ...(genderPolicy !== undefined && { genderPolicy }),
    amenities,
    ...(tenancyType !== undefined && { tenancyType }),
    ...(food !== undefined && { food }),
    ...(sort !== undefined && { sort }),
  };
}

export function filtersToSearchParams(filters: RoomFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Stable key order
  if (filters.city) {
    params.set("city", filters.city);
  }
  if (filters.q && filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  if (filters.minRent !== undefined && filters.minRent >= 0) {
    params.set("minRent", String(filters.minRent));
  }
  if (filters.maxRent !== undefined && filters.maxRent >= 0) {
    params.set("maxRent", String(filters.maxRent));
  }
  if (filters.roomType && filters.roomType.length > 0) {
    params.set("roomType", filters.roomType.join(","));
  }
  if (filters.genderPolicy) {
    params.set("genderPolicy", filters.genderPolicy);
  }
  if (filters.amenities && filters.amenities.length > 0) {
    params.set("amenities", filters.amenities.join(","));
  }
  if (filters.tenancyType) {
    params.set("tenancyType", filters.tenancyType);
  }
  if (filters.food && filters.food.trim()) {
    params.set("food", filters.food.trim());
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  return params;
}

export function filtersToApiQuery(filters: RoomFilters): Record<string, string | number | undefined> {
  return {
    city: filters.city || DEFAULT_CITY,
    ...(filters.q && { q: filters.q }),
    ...(filters.minRent !== undefined && { minRent: filters.minRent }),
    ...(filters.maxRent !== undefined && { maxRent: filters.maxRent }),
    ...(filters.roomType && filters.roomType.length > 0 && { roomType: filters.roomType.join(",") }),
    ...(filters.genderPolicy && { genderPolicy: filters.genderPolicy }),
    ...(filters.amenities && filters.amenities.length > 0 && { amenities: filters.amenities.join(",") }),
    ...(filters.tenancyType && { tenancyType: filters.tenancyType }),
    ...(filters.food && { food: filters.food }),
    ...(filters.sort && { sort: filters.sort }),
  };
}

export function cityName(slug: string | null | undefined): string {
  if (!slug) return "";
  const found = CITIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (found) return found.name;
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
