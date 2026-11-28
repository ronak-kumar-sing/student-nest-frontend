"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { sendCode, verifyCode, completeSignup } from "@/lib/auth/email-otp";
import { safeNextPath } from "@/lib/auth/safe-next";
import { friendlyMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DemoSignIn } from "@/components/auth/demo-sign-in";
import { RiMailLine, RiLockPasswordLine, RiUserLine, RiErrorWarningLine } from "@remixicon/react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, role, needsSignup, refreshMe } = useAuth();

  const nextParam = searchParams.get("next");
  const defaultRedirect = role === "owner" ? "/owner/listings" : "/rooms";
  const targetRedirect = nextParam ? safeNextPath(nextParam) : defaultRedirect;

  // Step 1: Email, Step 2: Code, Step 3: Signup Profile
  const [step, setStep] = useState<1 | 2 | 3>(needsSignup ? 3 : 1);
  const effectiveStep: 1 | 2 | 3 = needsSignup ? 3 : step;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "owner">("student");
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [demoActive, setDemoActive] = useState(false);

  // If already signed in with a complete profile, redirect
  useEffect(() => {
    if (status === "signed-in" && !needsSignup && !demoActive) {
      router.replace(targetRedirect);
    }
  }, [status, needsSignup, router, targetRedirect, demoActive]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendCode(trimmedEmail);
      setInfoMessage(`We sent a 6-digit code to ${trimmedEmail}.`);
      setStep(2);
    } catch (err) {
      setError(friendlyMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyCode(email.trim(), trimmedCode);
      if (result.isNewUser) {
        setStep(3);
      } else {
        // Existing user: await token claims refresh
        await refreshMe();
        router.replace(targetRedirect);
      }
    } catch (err) {
      setError(friendlyMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError("Please enter your name (2 to 50 characters).");
      return;
    }

    if (!agreedTerms) {
      setError("You must agree to the Student Nest terms to continue.");
      return;
    }

    setIsLoading(true);
    try {
      await completeSignup({
        role: selectedRole,
        displayName: trimmedName,
      });
      await refreshMe();
      const finalDest = nextParam
        ? safeNextPath(nextParam)
        : selectedRole === "owner"
          ? "/owner/listings"
          : "/rooms";
      router.replace(finalDest);
    } catch (err) {
      setError(friendlyMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const isDev =
    process.env.NODE_ENV !== "production" ||
    Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-paper border border-border rounded-lg p-6 sm:p-8 shadow-sm">
        {effectiveStep === 1 && (
          <>
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <h1 className="font-heading text-title font-semibold text-ink">
                Sign in to Student Nest
              </h1>
              <p className="mt-1 text-body text-muted-ink">
                We will send you a 6-digit code. No passwords to remember.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-ink"
              >
                <RiErrorWarningLine className="size-4 text-destructive shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-body font-medium text-ink">
                Email address
              </Label>
              <div className="relative">
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 bg-paper border-[var(--control-border)]"
                  autoFocus
                />
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-ink pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-ballpoint hover:bg-ballpoint/90 text-[var(--ballpoint-foreground)] font-medium h-10"
            >
              {isLoading ? "Sending code..." : "Send code"}
            </Button>

            {isDev && (
              <p className="text-caption text-muted-ink border-t border-border pt-4">
                Local dev hint: emails ending in{" "}
                <strong>@test.studentnest.app</strong> use code{" "}
                <strong>000000</strong>.
              </p>
            )}
          </form>
          <DemoSignIn
            variant="login"
            onStart={() => setDemoActive(true)}
            onFailed={() => setDemoActive(false)}
          />
        </>
        )}

        {effectiveStep === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <h1 className="font-heading text-title font-semibold text-ink">
                Check your email
              </h1>
              <p className="mt-1 text-body text-muted-ink">
                {infoMessage || `We sent a 6-digit verification code to ${email}.`}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-ink"
              >
                <RiErrorWarningLine className="size-4 text-destructive shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-code" className="text-body font-medium text-ink">
                6-digit code
              </Label>
              <div className="relative">
                <Input
                  id="login-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading}
                  className="pl-9 text-lead bg-paper border-[var(--control-border)]"
                  autoFocus
                />
                <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-ink pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-ballpoint hover:bg-ballpoint/90 text-[var(--ballpoint-foreground)] font-medium h-10"
            >
              {isLoading ? "Verifying..." : "Verify and continue"}
            </Button>

            <div className="flex items-center justify-between text-caption pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                className="text-muted-ink hover:text-ink underline underline-offset-4"
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    await sendCode(email.trim());
                    setInfoMessage(`A fresh code was sent to ${email}.`);
                  } catch (err) {
                    setError(friendlyMessage(err));
                  }
                }}
                className="text-ballpoint hover:underline underline-offset-4 font-medium"
              >
                Send a new code
              </button>
            </div>
          </form>
        )}

        {effectiveStep === 3 && (
          <form onSubmit={handleCompleteSignup} className="space-y-6">
            <div>
              <h1 className="font-heading text-title font-semibold text-ink">
                Create your account
              </h1>
              <p className="mt-1 text-body text-muted-ink">
                Just two quick details to complete your profile.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-ink"
              >
                <RiErrorWarningLine className="size-4 text-destructive shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-body font-medium text-ink">
                Your full name
              </Label>
              <div className="relative">
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Asha Verma"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 bg-paper border-[var(--control-border)]"
                  autoFocus
                />
                <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-ink pointer-events-none" />
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-body font-medium text-ink">
                How will you use Student Nest?
              </legend>
              <div className="grid grid-cols-1 gap-2.5">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
                    selectedRole === "student"
                      ? "border-ballpoint bg-ballpoint/5"
                      : "border-border hover:border-[var(--control-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={selectedRole === "student"}
                    onChange={() => setSelectedRole("student")}
                    className="mt-1 size-4 accent-[var(--ballpoint)]"
                  />
                  <div>
                    <span className="block text-body font-medium text-ink">
                      I am a student looking for a room
                    </span>
                    <span className="block text-caption text-muted-ink">
                      Search verified rooms, save favourites, and apply directly to owners.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
                    selectedRole === "owner"
                      ? "border-ballpoint bg-ballpoint/5"
                      : "border-border hover:border-[var(--control-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="owner"
                    checked={selectedRole === "owner"}
                    onChange={() => setSelectedRole("owner")}
                    className="mt-1 size-4 accent-[var(--ballpoint)]"
                  />
                  <div>
                    <span className="block text-body font-medium text-ink">
                      I own a room or PG
                    </span>
                    <span className="block text-caption text-muted-ink">
                      List directly without brokerage, manage student applications.
                    </span>
                  </div>
                </label>
              </div>
            </fieldset>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 size-4 rounded accent-[var(--ballpoint)]"
                />
                <span className="text-caption text-ink">
                  I agree to the Student Nest terms and verify that I will respect honest,
                  broker-free listings.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !agreedTerms || displayName.trim().length < 2}
              className="w-full bg-ballpoint hover:bg-ballpoint/90 text-[var(--ballpoint-foreground)] font-medium h-10"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
