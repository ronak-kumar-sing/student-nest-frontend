"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RiMenuLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { status, me, firebaseUser, role, signOut } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const displayName = me?.displayName || firebaseUser?.displayName || "Account";
  const isOwner = role === "owner" || me?.role === "owner";

  const isLinkActive = (href: string) => {
    if (href === "/rooms" && pathname === "/rooms") return true;
    if (href === "/saved" && pathname === "/saved") return true;
    if (href === "/bookings" && pathname === "/bookings") return true;
    if (href === "/owner/listings" && pathname.startsWith("/owner/listings")) return true;
    return false;
  };

  const navLinks = [
    { href: "/rooms", label: "Rooms", show: true },
    { href: "/saved", label: "Saved", show: !isOwner },
    { href: "/bookings", label: "Bookings", show: !isOwner },
    { href: "/owner/listings", label: "My listings", show: isOwner },
  ].filter((item) => item.show);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-paper">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-tight text-ink hover:text-ballpoint focus-visible:outline-2 focus-visible:outline-ballpoint"
          >
            Student Nest
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-5 text-sm font-medium">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-muted-ink hover:text-ink pb-1 transition-colors focus-visible:outline-2 focus-visible:outline-ballpoint",
                    active && "text-ink font-semibold border-b-2 border-ballpoint"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Auth */}
        <div className="hidden sm:flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-20 h-8" aria-hidden="true" />
          ) : status === "signed-in" ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink max-w-40 truncate">
                {displayName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
              >
                Log out
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-ballpoint hover:underline"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Mobile Menu (fits 360px) */}
        <div className="flex sm:hidden items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open navigation menu"
                />
              }
            >
              <RiMenuLine className="size-5 text-ink" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-paper p-6 w-64 flex flex-col justify-between">
              <div className="space-y-6">
                <Link
                  href="/"
                  onClick={() => setSheetOpen(false)}
                  className="font-heading text-xl font-bold tracking-tight text-ink block"
                >
                  Student Nest
                </Link>
                <nav className="flex flex-col gap-3">
                  {navLinks.map((link) => {
                    const active = isLinkActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setSheetOpen(false)}
                        className={cn(
                          "text-base py-1 font-medium text-muted-ink hover:text-ink",
                          active && "text-ink font-semibold border-l-2 border-ballpoint pl-2"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-hairline">
                {status === "loading" ? (
                  <div className="w-16 h-8" aria-hidden="true" />
                ) : status === "signed-in" ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink truncate">
                      {displayName}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSheetOpen(false);
                        signOut();
                      }}
                      className="w-full justify-center"
                    >
                      Log out
                    </Button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setSheetOpen(false)}
                    className="inline-block w-full text-center py-2 text-sm font-medium bg-ballpoint text-ballpoint-foreground rounded"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
