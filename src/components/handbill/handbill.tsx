import React from "react";
import { cn } from "@/lib/utils";

export interface HandbillProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "marigold" | "pink" | "mint";
  tilt?: number;
  pinned?: boolean;
  animationDelayMs?: number;
  children: React.ReactNode;
}

export function Handbill({
  tone = "marigold",
  tilt = 0,
  pinned = false,
  animationDelayMs,
  children,
  className,
  style,
  ...props
}: HandbillProps) {
  const toneClasses = {
    marigold: "bg-marigold text-ink",
    pink: "bg-pink-slip text-ink",
    mint: "bg-mint-slip text-ink",
  };

  const dynamicStyle: React.CSSProperties = {
    ...style,
    "--tilt": `${tilt}deg`,
    ...(animationDelayMs !== undefined ? { animationDelay: `${animationDelayMs}ms` } : {}),
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "handbill relative rounded-sm p-5 border border-hairline/60 shadow-sm",
        toneClasses[tone],
        pinned && "handbill-pinned",
        className
      )}
      style={dynamicStyle}
      {...props}
    >
      <div className="handbill-pin" aria-hidden="true" />
      {children}
    </div>
  );
}
