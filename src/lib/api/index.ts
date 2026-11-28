import { createApiClient } from "./client";
import { env } from "@/lib/env";
import { getFirebaseAuth } from "@/lib/firebase";
import type { components } from "./schema";

export type RoomCard = components["schemas"]["RoomCardDto"];
export type PropertyPublic = components["schemas"]["PropertyPublicDto"];
export type PropertyOwner = components["schemas"]["PropertyOwnerDto"];
export type FavoriteCard = components["schemas"]["FavoriteCardDto"];
export type Booking = components["schemas"]["BookingDto"];
export type UserMe = components["schemas"]["UserMeDto"];
export type SearchRoomsResponse = components["schemas"]["SearchRoomsResponseDto"];
export type RoomType = components["schemas"]["RoomCardDto"]["roomType"];
export type GenderPolicy = components["schemas"]["RoomCardDto"]["genderPolicy"];
export type Amenity = NonNullable<components["schemas"]["PropertyPublicDto"]["amenities"]>[number];
export type BookingStatus = components["schemas"]["BookingDto"]["status"];
export type PropertyStatus = components["schemas"]["PropertyPublicDto"]["status"];
export type UpdateProfile = components["schemas"]["UpdateProfileDto"];
export type Gender = NonNullable<components["schemas"]["UserMeDto"]["gender"]>;

export const api = createApiClient({
  baseUrl: env.apiUrl,
  getToken: async () => {
    if (typeof window === "undefined") return null;
    try {
      const auth = getFirebaseAuth();
      return (await auth.currentUser?.getIdToken()) || null;
    } catch {
      return null;
    }
  },
});

export const sendEmailOtp = (email: string) =>
  api.request<{ expiresInSec: number; resendAfterSec: number }>(
    "POST",
    "/auth/otp/email/send",
    { body: { email }, auth: "none" }
  );

export const verifyEmailOtp = (email: string, code: string) =>
  api.request<{ customToken: string; isNewUser: boolean }>(
    "POST",
    "/auth/otp/email/verify",
    { body: { email, code }, auth: "none" }
  );

export const signup = (body: {
  role: "student" | "owner";
  displayName: string;
  acceptedTermsVersion: string;
  marketingOptIn?: boolean;
}) =>
  api.request<{ user: UserMe; refreshToken: boolean }>(
    "POST",
    "/auth/signup",
    { body, auth: "required" }
  );

export const getMe = () =>
  api.request<UserMe>("GET", "/users/me", { auth: "required" });

export const updateMe = (body: UpdateProfile) =>
  api.request<UserMe>("PATCH", "/users/me", { body, auth: "required" });

export const becomeOwner = (body: components["schemas"]["BecomeOwnerDto"] = {}) =>
  api.request<components["schemas"]["BecomeOwnerResponseDto"]>("POST", "/users/me/become-owner", {
    body,
    auth: "required",
  });

export const searchRooms = (
  params: Record<string, string | number | boolean | string[] | undefined | null>
) =>
  api.request<SearchRoomsResponse>("GET", "/search/rooms", {
    query: params,
    auth: "optional",
  });

export const searchCities = (q?: string) =>
  api.request<components["schemas"]["CityDto"][]>("GET", "/search/cities", {
    query: { q },
    auth: "none",
  });

export const getProperty = (id: string) =>
  api.request<PropertyPublic>("GET", `/properties/${id}`, {
    auth: "optional",
  });

export const getMyProperties = (params?: {
  status?: string;
  cursor?: string;
  limit?: number;
}) =>
  api.request<components["schemas"]["PageMetaDto"] & { items: PropertyOwner[] }>(
    "GET",
    "/properties/mine",
    { query: params, auth: "required" }
  );

export const getFavorites = (params?: { cursor?: string; limit?: number }) =>
  api.request<components["schemas"]["PageMetaDto"] & { items: FavoriteCard[] }>(
    "GET",
    "/favorites",
    { query: params, auth: "required" }
  );

export const addFavorite = (id: string) =>
  api.request<components["schemas"]["FavoriteAddedDto"]>(
    "PUT",
    `/favorites/${id}`,
    { auth: "required" }
  );

export const removeFavorite = (id: string) =>
  api.request<components["schemas"]["FavoriteDeletedDto"]>(
    "DELETE",
    `/favorites/${id}`,
    { auth: "required" }
  );

export const getMyBookings = (params?: { status?: string; cursor?: string }) =>
  api.request<components["schemas"]["PageMetaDto"] & { items: Booking[] }>(
    "GET",
    "/bookings",
    { query: params, auth: "required" }
  );

export const createBooking = (
  body: {
    propertyId: string;
    moveInDate: string;
    durationMonths: number;
    occupants?: number;
    message?: string;
  },
  idempotencyKey?: string
) => {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  const payload: components["schemas"]["CreateBookingDto"] = {
    ...body,
    occupants: body.occupants ?? 1,
  };
  return api.request<Booking>("POST", "/bookings", {
    body: payload,
    headers,
    auth: "required",
  });
};
