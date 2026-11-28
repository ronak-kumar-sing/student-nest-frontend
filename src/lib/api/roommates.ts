import { api } from "@/lib/api";
import type { components } from "@/lib/api/schema";

export type RoommateProfile = components["schemas"]["RoommateProfileDto"];
export type UpsertRoommateProfile = components["schemas"]["UpsertRoommateProfileDto"];
export type Lifestyle = components["schemas"]["LifestyleDto"];
export type PublicRoommate = components["schemas"]["PublicRoommateDto"];
export type RoommateMatch = components["schemas"]["RoommateMatchDto"];
export type RoommateMatches = components["schemas"]["RoommateMatchesDto"];
export type RoommateRequest = components["schemas"]["RoommateRequestDto"];
export type RoommateContact = components["schemas"]["RoommateContactDto"];
export type RoommateRequestStatus = RoommateRequest["status"];
export type Interest = UpsertRoommateProfile["interests"][number];
export type RequestDirection = "incoming" | "outgoing";
export type RequestAction = "accept" | "decline" | "cancel" | "block";

export const getRoommateProfile = () =>
  api.request<RoommateProfile>("GET", "/roommates/profile", {
    auth: "required",
  });

export const upsertRoommateProfile = (body: UpsertRoommateProfile) =>
  api.request<RoommateProfile>("PUT", "/roommates/profile", {
    body,
    auth: "required",
  });

export const roommateProfileAction = (action: "activate" | "deactivate") =>
  api.request<RoommateProfile>("POST", "/roommates/profile/actions", {
    body: { action },
    auth: "required",
  });

export const getRoommateMatches = (limit?: number) =>
  api.request<RoommateMatches>("GET", "/roommates/matches", {
    query: limit !== undefined ? { limit } : undefined,
    auth: "required",
  });

export const sendRoommateRequest = (
  body: { toUid: string; message?: string },
  idempotencyKey?: string
) => {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return api.request<RoommateRequest>("POST", "/roommates/requests", {
    body,
    headers,
    auth: "required",
  });
};

export const listRoommateRequests = (params: {
  direction: RequestDirection;
  status?: RoommateRequestStatus;
  cursor?: string;
  limit?: number;
}) =>
  api.request<components["schemas"]["PageMetaDto"] & { items: RoommateRequest[] }>(
    "GET",
    "/roommates/requests",
    {
      query: {
        direction: params.direction,
        ...(params.status ? { status: params.status } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.limit !== undefined ? { limit: params.limit } : {}),
      },
      auth: "required",
    }
  );

export const roommateRequestAction = (id: string, action: RequestAction) =>
  api.request<RoommateRequest>(
    "POST",
    `/roommates/requests/${encodeURIComponent(id)}/actions`,
    {
      body: { action },
      auth: "required",
    }
  );
