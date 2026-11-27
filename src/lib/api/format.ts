export function formatRupees(paise: number): string {
  const rupees = Math.round(paise / 100);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export const ROOM_TYPE_LABELS: Record<string, string> = {
  "1rk": "1 RK",
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
  pg: "PG",
  hostel: "Hostel",
  shared_room: "Shared room",
};

export function formatRoomType(roomType: string): string {
  return ROOM_TYPE_LABELS[roomType] || roomType;
}

export const GENDER_POLICY_LABELS: Record<string, string> = {
  any: "Anyone",
  male_only: "Men only",
  female_only: "Women only",
};

export function formatGenderPolicy(policy: string): string {
  return GENDER_POLICY_LABELS[policy] || policy;
}

export const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  ac: "AC",
  geyser: "Geyser",
  washing_machine: "Washing machine",
  fridge: "Refrigerator",
  tv: "TV",
  parking: "Parking",
  power_backup: "Power backup",
  lift: "Lift",
  cctv: "CCTV",
  security_guard: "Security guard",
  housekeeping: "Housekeeping",
  gym: "Gym",
  study_table: "Study table",
  attached_bathroom: "Attached bathroom",
  balcony: "Balcony",
  kitchen: "Kitchen",
};

export function formatAmenity(amenity: string): string {
  return AMENITY_LABELS[amenity] || amenity;
}

export const FOOD_LABELS: Record<string, string> = {
  none: "No food included",
  breakfast: "Breakfast included",
  two_meals: "2 meals included",
  three_meals: "3 meals included",
};

export function formatFood(food: string): string {
  return FOOD_LABELS[food] || food;
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  expired: "Expired",
  cancelled: "Cancelled",
  checked_in: "Checked in",
  completed: "Completed",
};

export function formatBookingStatus(status: string): string {
  return BOOKING_STATUS_LABELS[status] || status;
}

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Under review",
  published: "Published",
  paused: "Paused",
  rejected: "Rejected",
  suspended: "Suspended",
  deleted: "Deleted",
};

export function formatPropertyStatus(status: string): string {
  return PROPERTY_STATUS_LABELS[status] || status;
}

export function formatDate(date: string | Date | number): string {
  if (!date) return "";
  const d = typeof date === "object" ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
