import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RoommatesPage } from "./roommates-page";
import { ApiError } from "@/lib/api/errors";
import type { RoommateProfile } from "@/lib/api/roommates";
import type { AuthContextValue } from "@/lib/auth/auth-provider";
import type { User } from "firebase/auth";
import type { UserMe } from "@/lib/api";

const { mockAuth, mockApi } = vi.hoisted(() => {
  const current: AuthContextValue = {
    status: "signed-in",
    role: "student",
    needsSignup: false,
    me: {
      id: "u1",
      role: "student",
      city: "indore",
      gender: "female",
      college: "IIPS Indore",
    } as unknown as UserMe,
    firebaseUser: { uid: "u1" } as unknown as User,
    refreshMe: vi.fn(),
    signOut: vi.fn(),
  };

  return {
    mockAuth: { current },
    mockApi: {
      getRoommateProfile: vi.fn(),
      getRoommateMatches: vi.fn(),
      roommateProfileAction: vi.fn(),
      sendRoommateRequest: vi.fn(),
      upsertRoommateProfile: vi.fn(),
    },
  };
});

vi.mock("@/lib/auth/auth-provider", () => ({
  useAuth: () => mockAuth.current,
}));

vi.mock("@/lib/api/roommates", () => ({
  getRoommateProfile: () => mockApi.getRoommateProfile(),
  getRoommateMatches: () => mockApi.getRoommateMatches(),
  roommateProfileAction: (action: "activate" | "deactivate") =>
    mockApi.roommateProfileAction(action),
  sendRoommateRequest: (body: { toUid: string; message?: string }, key?: string) =>
    mockApi.sendRoommateRequest(body, key),
  upsertRoommateProfile: (body: unknown) => mockApi.upsertRoommateProfile(body),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/roommates",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("RoommatesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders intro and wizard when profile is missing (404), and does not call getRoommateMatches", async () => {
    mockAuth.current = {
      status: "signed-in",
      role: "student",
      needsSignup: false,
      me: {
        id: "u1",
        role: "student",
        city: "indore",
        gender: "female",
        college: "IIPS Indore",
      } as unknown as UserMe,
      firebaseUser: { uid: "u1" } as unknown as User,
      refreshMe: vi.fn(),
      signOut: vi.fn(),
    };

    mockApi.getRoommateProfile.mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "Not found")
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RoommatesPage />
      </QueryClientProvider>
    );

    expect(
      await screen.findByRole("heading", { name: "Find a roommate" })
    ).toBeInTheDocument();

    expect(await screen.findByText("Step 1 of 4")).toBeInTheDocument();

    expect(await screen.findByLabelText("City")).toBeInTheDocument();

    expect(mockApi.getRoommateMatches).not.toHaveBeenCalled();
  });

  it("shows guest explainer with login link when signed out, without making API calls", () => {
    mockAuth.current = {
      status: "signed-out",
      role: null,
      needsSignup: false,
      me: null,
      firebaseUser: null,
      refreshMe: vi.fn(),
      signOut: vi.fn(),
    };

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RoommatesPage />
      </QueryClientProvider>
    );

    const loginLink = screen.getByRole("link", {
      name: "Log in to find a roommate",
    });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login?next=%2Froommates");

    expect(mockApi.getRoommateProfile).not.toHaveBeenCalled();
    expect(mockApi.getRoommateMatches).not.toHaveBeenCalled();
  });

  it("shows 'Show again' for hidden profile (isActive: false) and does not call getRoommateMatches", async () => {
    mockAuth.current = {
      status: "signed-in",
      role: "student",
      needsSignup: false,
      me: {
        id: "u1",
        role: "student",
        city: "indore",
        gender: "female",
        college: "IIPS Indore",
      } as unknown as UserMe,
      firebaseUser: { uid: "u1" } as unknown as User,
      refreshMe: vi.fn(),
      signOut: vi.fn(),
    };

    const hiddenProfile: RoommateProfile = {
      citySlug: "indore",
      preferredLocalities: ["vijay-nagar"],
      budgetMinPaise: 600000,
      budgetMaxPaise: 800000,
      moveInBy: "2026-12-01",
      gender: "female",
      preferredGender: "any",
      lifestyle: {
        smoking: false,
        drinking: false,
        diet: "veg",
        pets: true,
        sleepSchedule: "early",
        cleanliness: 4,
        guests: "sometimes",
        studyHabits: "quiet",
      },
      bio: "Student looking for roommate",
      interests: ["reading"],
      college: "IIPS Indore",
      isActive: false,
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    };

    mockApi.getRoommateProfile.mockResolvedValue(hiddenProfile);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RoommatesPage />
      </QueryClientProvider>
    );

    expect(
      await screen.findByRole("button", { name: "Show again" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Your roommate profile is hidden. Other students cannot see you, and you cannot see matches."
      )
    ).toBeInTheDocument();

    expect(mockApi.getRoommateMatches).not.toHaveBeenCalled();
  });
});
