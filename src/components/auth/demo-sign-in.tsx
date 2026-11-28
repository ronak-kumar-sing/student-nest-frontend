"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDemoConfig, type DemoPersona } from "@/lib/api/demo";
import { signInAsDemo } from "@/lib/auth/demo-sign-in";
import { friendlyMessage, isApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { RiErrorWarningLine } from "@remixicon/react";

export function DemoSignIn({
  variant,
  onStart,
  onFailed,
}: {
  variant: "login" | "hero";
  onStart?: () => void;
  onFailed?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activePersona, setActivePersona] = useState<DemoPersona | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "demo"],
    queryFn: getDemoConfig,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (
    isLoading ||
    isError ||
    !data ||
    !data.enabled ||
    !data.personas ||
    data.personas.length === 0
  ) {
    return null;
  }

  const handleSignIn = async (persona: DemoPersona) => {
    setError(null);
    setActivePersona(persona);
    onStart?.();
    try {
      const { destination } = await signInAsDemo(persona);
      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      router.replace(destination);
    } catch (err: unknown) {
      if (isApiError(err) && err.status === 404) {
        setError(
          "Demo sign-in is switched off right now. Sign in with your email instead."
        );
      } else {
        setError(friendlyMessage(err));
      }
      setActivePersona(null);
      onFailed?.();
    }
  };

  const buttons = (
    <>
      {data.personas.includes("student") && (
        <Button
          type="button"
          variant="outline"
          disabled={activePersona !== null}
          onClick={() => handleSignIn("student")}
        >
          {activePersona === "student"
            ? "Signing in as a student..."
            : "Try as a student"}
        </Button>
      )}
      {data.personas.includes("owner") && (
        <Button
          type="button"
          variant="outline"
          disabled={activePersona !== null}
          onClick={() => handleSignIn("owner")}
        >
          {activePersona === "owner"
            ? "Signing in as an owner..."
            : "Try as an owner"}
        </Button>
      )}
    </>
  );

  const note = (
    <p className="text-caption text-muted-ink">
      Demo accounts are shared and reset from time to time.
    </p>
  );

  const errorAlert = error && (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-ink"
    >
      <RiErrorWarningLine className="size-4 text-destructive shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  );

  if (variant === "login") {
    return (
      <div
        className="pt-6 border-t border-hairline space-y-3"
        aria-busy={activePersona !== null}
      >
        <h2 className="text-body font-medium text-ink">
          Or explore with a demo account
        </h2>
        {errorAlert}
        <div className="flex flex-col sm:flex-row gap-2.5">{buttons}</div>
        {note}
      </div>
    );
  }

  return (
    <div className="space-y-2.5" aria-busy={activePersona !== null}>
      <p className="text-caption font-medium text-ink">
        Just looking around? Use a demo account.
      </p>
      {errorAlert}
      <div className="flex flex-wrap gap-2.5">{buttons}</div>
      {note}
    </div>
  );
}
