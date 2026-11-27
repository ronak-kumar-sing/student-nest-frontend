import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TearOffStripProps {
  label?: string;
  href?: string;
  onClick?: () => void;
  count?: number;
  activeTabIndex?: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function TearOffStrip({
  label = "Contact owner",
  href,
  onClick,
  count = 4,
  activeTabIndex = 0,
  orientation = "horizontal",
  className,
}: TearOffStripProps) {
  const isVertical = orientation === "vertical";
  const tabs = Array.from({ length: count });

  const containerClass = isVertical
    ? "handbill-tear-strip-v select-none"
    : "handbill-tear-strip-h mt-4 select-none";

  const tabClass = isVertical ? "handbill-tear-tab-v" : "handbill-tear-tab-h";

  return (
    <div className={cn(containerClass, className)}>
      {tabs.map((_, i) => {
        const isActive = i === activeTabIndex;
        if (isActive) {
          if (href) {
            return (
              <Link
                key={i}
                href={href}
                className={cn(
                  tabClass,
                  "font-medium text-ink underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {label}
              </Link>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={onClick}
              className={cn(
                tabClass,
                "font-medium text-ink underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              )}
            >
              {label}
            </button>
          );
        }

        return (
          <div
            key={i}
            className={tabClass}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
