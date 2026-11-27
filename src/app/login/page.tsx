import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Student Nest with an email verification code.",
};

export default function LoginPage() {
  return (
    <div className="py-12 sm:py-16 px-4">
      <Suspense fallback={<LoadingState message="Loading sign-in..." />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
