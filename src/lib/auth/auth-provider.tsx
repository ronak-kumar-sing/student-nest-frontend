"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFirebaseAuth } from "@/lib/firebase";
import { getMe, type UserMe } from "@/lib/api";
import { isApiError } from "@/lib/api/errors";

/**
 * The API answers 403 PROFILE_REQUIRED for a signed-in Firebase user that has not
 * completed POST /v1/auth/signup yet (404 is accepted too, defensively).
 */
export function isProfileMissing(error: unknown): boolean {
  return isApiError(error) && (error.code === "PROFILE_REQUIRED" || error.status === 404);
}

export interface AuthContextValue {
  status: "loading" | "signed-out" | "signed-in";
  firebaseUser: User | null;
  me: UserMe | null;
  role: "student" | "owner" | "admin" | null;
  needsSignup: boolean;
  refreshMe: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      unsub = onIdTokenChanged(auth, (user) => {
        setFirebaseUser(user);
        setAuthInitialized(true);
      });
    } catch {
      const timer = setTimeout(() => {
        setAuthInitialized(true);
      }, 0);
      return () => clearTimeout(timer);
    }
    return () => unsub?.();
  }, []);

  const {
    data: me,
    isLoading: isMeLoading,
    error: meError,
    refetch,
  } = useQuery<UserMe, unknown>({
    queryKey: ["users", "me", firebaseUser?.uid],
    queryFn: async () => {
      return await getMe();
    },
    enabled: Boolean(firebaseUser && authInitialized),
    retry: (failureCount, error) => {
      if (isProfileMissing(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const needsSignup = Boolean(firebaseUser && isProfileMissing(meError));

  let status: "loading" | "signed-out" | "signed-in" = "loading";
  if (!authInitialized) {
    status = "loading";
  } else if (!firebaseUser) {
    status = "signed-out";
  } else if (isMeLoading) {
    status = "loading";
  } else {
    status = "signed-in";
  }

  const role = me?.role || null;

  const refreshMe = async () => {
    if (firebaseUser) {
      await firebaseUser.getIdToken(true);
      await refetch();
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch {
      // ignore
    } finally {
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        firebaseUser,
        me: me || null,
        role,
        needsSignup,
        refreshMe,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
