"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RiImageLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

export interface RoomPhotoProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function RoomPhoto({
  src,
  alt,
  fill = true,
  width,
  height,
  className,
  priority = false,
}: RoomPhotoProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-paper border border-hairline text-muted-ink",
          fill ? "absolute inset-0 size-full" : "size-full",
          className
        )}
        aria-hidden="true"
      >
        <RiImageLine className="size-6 opacity-60" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        onError={() => setError(true)}
        className={cn("object-cover", className)}
        sizes="(max-width: 640px) 160px, 240px"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 320}
      height={height || 240}
      unoptimized
      priority={priority}
      onError={() => setError(true)}
      className={cn("object-cover", className)}
    />
  );
}
