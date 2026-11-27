"use client";

import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RiHeartLine, RiHeartFill, RiStarFill } from "@remixicon/react";
import { RoomPhoto } from "./room-photo";
import { TearOffStrip } from "@/components/handbill/tear-off-strip";
import { formatRupees, formatRoomType, formatGenderPolicy, formatDate } from "@/lib/api/format";
import { cityName } from "@/lib/search-params";
import { useAuth } from "@/lib/auth/auth-provider";
import { addFavorite, removeFavorite, type RoomCard } from "@/lib/api";
import { toast } from "sonner";

export interface RoomRowProps {
  room: RoomCard;
  isFavorite?: boolean;
  onFavoriteChange?: (roomId: string, nextSaved: boolean) => void;
}

export function RoomRow({ room, isFavorite = false, onFavoriteChange }: RoomRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status, role } = useAuth();
  const [override, setOverride] = React.useState<boolean | null>(null);
  const saved = override ?? room.isFavorite ?? isFavorite;
  const [saving, setSaving] = React.useState(false);
  const queryClient = useQueryClient();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "signed-in") {
      const search = searchParams?.toString();
      const currentUrl = pathname + (search ? `?${search}` : "");
      router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (role === "owner") {
      toast.error("Owner accounts cannot save rooms.");
      return;
    }

    const nextSaved = !saved;
    setOverride(nextSaved);
    setSaving(true);
    onFavoriteChange?.(room.id, nextSaved);

    try {
      if (nextSaved) {
        await addFavorite(room.id);
      } else {
        await removeFavorite(room.id);
      }
      // Keep the other views (results, detail, saved list) in step with this change.
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
      void queryClient.invalidateQueries({ queryKey: ["rooms"] });
      void queryClient.invalidateQueries({ queryKey: ["property", room.id] });
    } catch {
      setOverride(!nextSaved);
      onFavoriteChange?.(room.id, !nextSaved);
      toast.error("Could not update saved rooms. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tenancyLabel = room.tenancyType === "per_bed" ? "Per bed" : "Whole unit";

  return (
    <li className="group relative flex flex-col sm:flex-row items-stretch rounded-sm border border-hairline bg-paper">
      {/* Photo */}
      <Link
        href={`/rooms/${room.id}`}
        className="relative aspect-4/3 w-full shrink-0 overflow-hidden sm:w-48 sm:h-auto md:w-60 bg-paper border-b sm:border-b-0 sm:border-r border-hairline"
      >
        <RoomPhoto src={room.coverImageUrl} alt={room.title} fill />
      </Link>

      {/* Main Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                href={`/rooms/${room.id}`}
                className="font-heading text-lead font-semibold text-ink hover:text-ballpoint focus-visible:outline-2 focus-visible:outline-ballpoint"
              >
                {room.title}
              </Link>
              <p className="text-caption text-muted-ink mt-0.5">
                {room.locality}, {cityName(room.citySlug)}
              </p>
            </div>

            {/* Save Toggle */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={saving}
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved" : "Save room"}
              className="p-1.5 text-muted-ink hover:text-ink focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
            >
              {saved ? (
                <RiHeartFill className="size-5 text-[#C5221F]" />
              ) : (
                <RiHeartLine className="size-5" />
              )}
            </button>
          </div>

          {/* Rent and Deposit */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-title font-bold text-ink">
              {formatRupees(room.rentPaise)}
            </span>
            <span className="text-caption text-muted-ink">/month</span>
            {room.depositPaise !== undefined && room.depositPaise > 0 && (
              <span className="text-caption text-muted-ink ml-2">
                Deposit {formatRupees(room.depositPaise)}
              </span>
            )}
          </div>

          {/* Facts list */}
          <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-ink">
            <li className="font-medium text-ink">{formatRoomType(room.roomType)}</li>
            <li className="h-3 w-px bg-hairline" aria-hidden="true" />
            <li>{formatGenderPolicy(room.genderPolicy)}</li>
            <li className="h-3 w-px bg-hairline" aria-hidden="true" />
            <li>{tenancyLabel}</li>
            {room.availableFrom && (
              <>
                <li className="h-3 w-px bg-hairline" aria-hidden="true" />
                <li>Available from {formatDate(room.availableFrom)}</li>
              </>
            )}
            {room.ratingCount > 0 && (
              <>
                <li className="h-3 w-px bg-hairline" aria-hidden="true" />
                <li className="flex items-center gap-1 font-medium text-ink">
                  <RiStarFill className="size-3.5 text-marigold" />
                  <span>{room.ratingAvg.toFixed(1)}</span>
                  <span className="text-muted-ink">({room.ratingCount})</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Right Edge: Vertical Tear-off strip tab in slip colour */}
      <div className="shrink-0 bg-marigold flex items-center justify-center border-t sm:border-t-0 sm:border-l border-hairline">
        <TearOffStrip
          label="Contact owner"
          href={`/rooms/${room.id}`}
          count={1}
          orientation="vertical"
          className="w-full sm:w-auto h-full"
        />
      </div>
    </li>
  );
}
