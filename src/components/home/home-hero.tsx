"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { searchRooms, type RoomCard } from "@/lib/api";
import { CITIES, cityName, filtersToSearchParams } from "@/lib/search-params";
import { formatRupees, formatRoomType, formatGenderPolicy } from "@/lib/api/format";
import { Handbill } from "@/components/handbill/handbill";
import { TearOffStrip } from "@/components/handbill/tear-off-strip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states/error-state";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const router = useRouter();
  const [city, setCity] = useState("indore");
  const [q, setQ] = useState("");
  const [maxRent, setMaxRent] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = filtersToSearchParams({
      city,
      q: q.trim() || undefined,
      maxRent: maxRent ? Number(maxRent) : undefined,
      roomType: [],
      amenities: [],
    });
    const qs = params.toString();
    router.push(`/rooms${qs ? `?${qs}` : ""}`);
  };

  const {
    data: previewData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["home-handbills"],
    queryFn: async () => {
      return await searchRooms({
        city: "indore",
        sort: "newest",
        limit: 3,
      });
    },
  });

  const rooms: RoomCard[] = previewData?.items ?? [];

  const handbillConfigs: Array<{
    tone: "marigold" | "pink" | "mint";
    tilt: number;
    delayMs: number;
  }> = [
    { tone: "marigold", tilt: -2, delayMs: 0 },
    { tone: "pink", tilt: 1.5, delayMs: 140 },
    { tone: "mint", tilt: -1, delayMs: 280 },
  ];

  const handbillOffsets = ["lg:ml-0", "lg:ml-8 -mt-2", "lg:ml-3 -mt-2"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        {/* Left column: Headings and Search Form (cols 1-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="font-heading text-display sm:text-hero font-extrabold tracking-tight text-ink leading-none">
              Rooms near your college,{" "}
              <span className="font-medium text-ink block sm:inline">
                straight from the owner.
              </span>
            </h1>
            <p className="mt-4 text-lead text-muted-ink max-w-xl">
              Search rooms and PGs listed by their owners in Indore, Bhopal and Pune. No brokers, no brokerage.
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="rounded-sm border border-hairline bg-paper p-5 sm:p-6 space-y-4 shadow-xs"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* City select */}
              <div className="space-y-1.5">
                <label htmlFor="home-city" className="block text-caption font-medium text-ink">
                  City
                </label>
                <select
                  id="home-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded border border-control-border bg-paper px-3 py-2 text-caption text-ink focus-visible:outline-2 focus-visible:outline-ballpoint"
                >
                  {CITIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Locality or college */}
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="home-q" className="block text-caption font-medium text-ink">
                  College or locality (optional)
                </label>
                <Input
                  id="home-q"
                  placeholder="e.g. Holkar Science or Bhanwar Kuan"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="border-control-border text-caption"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
              {/* Max rent */}
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="home-budget" className="block text-caption font-medium text-ink">
                  Max rent per month (₹)
                </label>
                <Input
                  id="home-budget"
                  type="number"
                  placeholder="e.g. 8000"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="border-control-border text-caption"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-ballpoint text-ballpoint-foreground font-semibold h-10"
              >
                Search rooms
              </Button>
            </div>
          </form>

          {/* Below lg: Handbill preview shown here */}
          <div className="lg:hidden pt-4">
            {isLoading && (
              <div className="handbill bg-marigold text-ink p-5 rounded-sm border border-hairline/60">
                <Skeleton className="h-6 w-3/4 bg-ink/10 mb-2" />
                <Skeleton className="h-4 w-1/2 bg-ink/10 mb-4" />
                <Skeleton className="h-8 w-1/3 bg-ink/10" />
              </div>
            )}

            {isError && (
              <ErrorState
                title="Could not load featured rooms"
                error={error}
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && rooms.length === 0 && (
              <div className="rounded-sm border border-hairline bg-paper p-6 text-center text-muted-ink">
                <p>No rooms listed in Indore yet.</p>
                <div className="mt-3 flex justify-center gap-3">
                  <Link href="/rooms?city=bhopal" className="text-ballpoint hover:underline text-caption">
                    Try Bhopal
                  </Link>
                  <Link href="/rooms?city=pune" className="text-ballpoint hover:underline text-caption">
                    Try Pune
                  </Link>
                </div>
              </div>
            )}

            {!isLoading && !isError && rooms.length > 0 && (
              <Handbill
                tone="marigold"
                tilt={-1.5}
                className="w-full shadow-md"
              >
                <h3 className="font-heading text-title font-bold text-ink">
                  {rooms[0].title}
                </h3>
                <p className="text-caption text-ink font-medium mt-1">
                  {rooms[0].locality}, {cityName(rooms[0].citySlug)}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-heading text-title font-extrabold text-ink">
                    {formatRupees(rooms[0].rentPaise)}
                  </span>
                  <span className="text-caption text-ink">/month</span>
                </div>
                <div className="mt-2 text-caption text-ink flex items-center gap-2">
                  <span>{formatRoomType(rooms[0].roomType)}</span>
                  <span className="h-3 w-px bg-ink/30" aria-hidden="true" />
                  <span>{formatGenderPolicy(rooms[0].genderPolicy)}</span>
                </div>
                <TearOffStrip
                  label="Contact owner"
                  href={`/rooms/${rooms[0].id}`}
                  count={3}
                />
              </Handbill>
            )}
          </div>
        </div>

        {/* Right column: Three hero handbills for desktop lg (cols 8-12) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-6 relative pt-4">
          {isLoading && (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-sm border border-hairline bg-paper p-5 shadow-xs"
                >
                  <Skeleton className="h-6 w-3/4 bg-hairline/60 mb-2" />
                  <Skeleton className="h-4 w-1/2 bg-hairline/40 mb-3" />
                  <Skeleton className="h-7 w-1/3 bg-hairline/50" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <ErrorState
              title="Could not load featured rooms"
              error={error}
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && rooms.length === 0 && (
            <div className="rounded-sm border border-hairline bg-paper p-6 text-center text-muted-ink">
              <p>No rooms listed in Indore yet.</p>
              <div className="mt-3 flex justify-center gap-3">
                <Link href="/rooms?city=bhopal" className="text-ballpoint hover:underline text-caption">
                  Try Bhopal
                </Link>
                <Link href="/rooms?city=pune" className="text-ballpoint hover:underline text-caption">
                  Try Pune
                </Link>
              </div>
            </div>
          )}

          {!isLoading &&
            !isError &&
            rooms.map((room, idx) => {
              const cfg = handbillConfigs[idx] || handbillConfigs[0];
              const offset = handbillOffsets[idx] || "lg:ml-0";
              return (
                <Handbill
                  key={room.id}
                  tone={cfg.tone}
                  tilt={cfg.tilt}
                  pinned={true}
                  animationDelayMs={cfg.delayMs}
                  className={cn("w-full shadow-md transition-none", offset)}
                >
                  <h3 className="font-heading text-lead font-bold text-ink line-clamp-1">
                    {room.title}
                  </h3>
                  <p className="text-caption text-ink font-medium mt-0.5">
                    {room.locality}, {cityName(room.citySlug)}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-heading text-title font-extrabold text-ink">
                      {formatRupees(room.rentPaise)}
                    </span>
                    <span className="text-caption text-ink">/month</span>
                  </div>
                  <div className="mt-1 text-caption text-ink font-medium flex items-center gap-2">
                    <span>{formatRoomType(room.roomType)}</span>
                    <span className="h-3 w-px bg-ink/30" aria-hidden="true" />
                    <span>{formatGenderPolicy(room.genderPolicy)}</span>
                  </div>
                  <TearOffStrip
                    label="Contact owner"
                    href={`/rooms/${room.id}`}
                    count={3}
                  />
                </Handbill>
              );
            })}
        </div>
      </div>

      {/* How it works: Single-column vertical list of 3 steps */}
      <section className="mt-20 pt-10 border-t border-hairline" aria-label="How it works">
        <h2 className="font-heading text-title font-semibold text-ink">
          How it works
        </h2>
        <ol className="mt-6 flex flex-col gap-6 max-w-xl list-decimal list-inside text-body text-ink">
          <li className="space-y-1">
            <span className="font-semibold text-ink">Search near your college</span>
            <p className="text-caption text-muted-ink mt-1">
              Find rooms and paying guest accommodations within walking distance of campus.
            </p>
          </li>
          <li className="space-y-1">
            <span className="font-semibold text-ink">Save rooms you like</span>
            <p className="text-caption text-muted-ink mt-1">
              Keep shortlisted rooms in your saved list to compare prices and amenities.
            </p>
          </li>
          <li className="space-y-1">
            <span className="font-semibold text-ink">Apply to book with the owner</span>
            <p className="text-caption text-muted-ink mt-1">
              Submit your move-in date and duration directly to verified property owners.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
