"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";

export function useRequireAuth(requiredRole?: "student" | "owner") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, role, needsSignup } = useAuth();

  useEffect(() => {
    if (status === "signed-out" || (status === "signed-in" && needsSignup)) {
      const search = searchParams?.toString();
      const currentPath = pathname + (search ? `?${search}` : "");
      router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
    }
  }, [status, needsSignup, pathname, searchParams, router]);

  const ready = status === "signed-in" && !needsSignup && (!requiredRole || role === requiredRole);
  const wrongRole = Boolean(
    status === "signed-in" && !needsSignup && requiredRole && role !== requiredRole
  );

  return { ready, wrongRole, status };
}
