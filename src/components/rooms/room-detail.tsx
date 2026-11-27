"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProperty,
  addFavorite,
  removeFavorite,
  type PropertyPublic,
} from "@/lib/api";
import {
  formatRupees,
  formatRoomType,
  formatGenderPolicy,
  formatAmenity,
  formatFood,
  formatDate,
} from "@/lib/api/format";
import { isApiError } from "@/lib/api/errors";
import { cityName } from "@/lib/search-params";
import { useAuth } from "@/lib/auth/auth-provider";
import { RoomPhoto } from "./room-photo";
import { ApplyPanel } from "./apply-panel";
import { ErrorState } from "@/components/states/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import {
  RiShieldCheckFill,
  RiHeartLine,
  RiHeartFill,
  RiArrowLeftLine,
} from "@remixicon/react";
import { toast } from "sonner";

export interface RoomDetailProps {
  id: string;
}

export function RoomDetail({ id }: RoomDetailProps) {
  const router = useRouter();
  const { status, role, firebaseUser } = useAuth();

  const {
    data: property,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PropertyPublic, unknown>({
    // isFavorite is only returned to signed-in callers, so key by user and wait
    // until Firebase has restored the session before fetching.
    queryKey: ["property", id, firebaseUser?.uid ?? "guest"],
    queryFn: async () => {
      return await getProperty(id);
    },
    enabled: status !== "loading",
  });

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [override, setOverride] = useState<boolean | null>(null);
  const saved = override ?? property?.isFavorite ?? false;
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-4">
              <Skeleton className="aspect-16/9 w-full rounded-sm" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-80 w-full rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    if (isApiError(error) && error.status === 404) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-heading text-title font-bold text-ink">
            This room is no longer listed.
          </h1>
          <p className="mt-3 text-body text-muted-ink">
            The property may have been filled, paused, or withdrawn by the owner.
          </p>
          <div className="mt-6">
            <Link href="/rooms" className={buttonVariants({ variant: "default" })}>
              Browse rooms
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState
          title="Could not load room details"
          error={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!property) return null;

  const images = property.images ?? [];
  const activeImage = images[selectedPhotoIndex] || images[0];

  const handleToggleFavorite = async () => {
    if (status !== "signed-in") {
      router.push(`/login?next=/rooms/${id}`);
      return;
    }
    if (role === "owner") {
      toast.error("Owner accounts cannot save rooms.");
      return;
    }

    const nextSaved = !saved;
    setOverride(nextSaved);
    setSaving(true);

    try {
      if (nextSaved) {
        await addFavorite(property.id);
      } else {
        await removeFavorite(property.id);
      }
      // Keep the other views (results, detail, saved list) in step with this change.
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
      void queryClient.invalidateQueries({ queryKey: ["rooms"] });
      void queryClient.invalidateQueries({ queryKey: ["property", property.id] });
    } catch {
      setOverride(!nextSaved);
      toast.error("Could not update saved rooms. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isOwnerVerified = property.owner?.ownerBadge?.verified;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Back button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/rooms");
            }
          }}
          className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-ballpoint cursor-pointer"
        >
          <RiArrowLeftLine className="size-4" />
          <span>Back to results</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Details & Gallery (cols 1-8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 w-full overflow-hidden rounded-sm border border-hairline bg-paper">
              <RoomPhoto
                src={activeImage?.url}
                alt={`${property.title} photo ${selectedPhotoIndex + 1} of ${images.length || 1}`}
                fill
                priority
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.url || idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    aria-label={`View photo ${idx + 1} of ${images.length}`}
                    className={`relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded border transition-colors ${
                      idx === selectedPhotoIndex
                        ? "border-ballpoint ring-2 ring-ballpoint/30"
                        : "border-hairline hover:border-muted-ink"
                    }`}
                  >
                    <RoomPhoto
                      src={img.url}
                      alt={`${property.title} thumbnail ${idx + 1}`}
                      fill
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heading and Locality */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-heading text-title sm:text-display font-bold text-ink leading-tight">
                {property.title}
              </h1>
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={saving}
                aria-pressed={saved}
                aria-label={saved ? "Remove from saved" : "Save room"}
                className="p-2 text-muted-ink hover:text-ink focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer shrink-0"
              >
                {saved ? (
                  <RiHeartFill className="size-6 text-[#C5221F]" />
                ) : (
                  <RiHeartLine className="size-6" />
                )}
              </button>
            </div>
            <p className="mt-1 text-body text-muted-ink">
              {property.address.locality}, {cityName(property.address.citySlug || property.address.city)}
            </p>
          </div>

          {/* Owner Block */}
          <div className="rounded-sm border border-hairline bg-paper p-4 flex items-center justify-between">
            <div>
              <span className="text-caption text-muted-ink">Listed by owner</span>
              <p className="font-heading text-lead font-semibold text-ink">
                {property.owner?.displayName || "Owner"}
              </p>
            </div>
            {isOwnerVerified && (
              <span className="inline-flex items-center gap-1 rounded bg-mint-slip px-2.5 py-1 text-caption font-semibold text-ink">
                <RiShieldCheckFill className="size-4" />
                <span>Verified owner</span>
              </span>
            )}
          </div>

          {/* Rent & Bills */}
          <div className="space-y-2 border-t border-hairline pt-6">
            <h2 className="font-heading text-lead font-semibold text-ink">
              Rent & charges
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <span className="text-caption text-muted-ink">Monthly rent</span>
                <p className="text-lead font-bold text-ink">
                  {formatRupees(property.rentPaise)}
                </p>
              </div>
              <div>
                <span className="text-caption text-muted-ink">Security deposit</span>
                <p className="text-lead font-bold text-ink">
                  {property.depositPaise ? formatRupees(property.depositPaise) : "None"}
                </p>
              </div>
              {property.maintenancePaise !== undefined && property.maintenancePaise > 0 && (
                <div>
                  <span className="text-caption text-muted-ink">Maintenance</span>
                  <p className="text-lead font-bold text-ink">
                    {formatRupees(property.maintenancePaise)}
                  </p>
                </div>
              )}
            </div>

            {property.billsIncluded && property.billsIncluded.length > 0 && (
              <p className="text-caption text-muted-ink mt-2">
                Bills included: {property.billsIncluded.join(", ")}
              </p>
            )}
          </div>

          {/* Facts list as DL */}
          <div className="border-t border-hairline pt-6 space-y-3">
            <h2 className="font-heading text-lead font-semibold text-ink">
              Overview
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 text-caption">
              <div>
                <dt className="text-muted-ink">Room type</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {formatRoomType(property.roomType)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-ink">Tenancy</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {property.tenancyType === "per_bed" ? "Per bed" : "Whole unit"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-ink">Gender policy</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {formatGenderPolicy(property.genderPolicy)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-ink">Availability</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {property.availableSlots} of {property.capacity} free
                </dd>
              </div>
              <div>
                <dt className="text-muted-ink">Available from</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {property.availableFrom ? formatDate(property.availableFrom) : "Immediate"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-ink">Minimum stay</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {property.minStayMonths} {property.minStayMonths === 1 ? "month" : "months"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-ink">Notice period</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {property.noticePeriodDays} days
                </dd>
              </div>
              <div>
                <dt className="text-muted-ink">Food</dt>
                <dd className="font-medium text-ink mt-0.5">
                  {formatFood(property.foodIncluded)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="border-t border-hairline pt-6 space-y-3">
              <h2 className="font-heading text-lead font-semibold text-ink">
                Amenities
              </h2>
              <ul className="flex flex-wrap gap-2">
                {property.amenities.map((am) => (
                  <li
                    key={am}
                    className="rounded-sm border border-hairline bg-paper px-3 py-1.5 text-caption font-medium text-ink"
                  >
                    {formatAmenity(am)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* House Rules */}
          {property.houseRules && (
            <div className="border-t border-hairline pt-6 space-y-3">
              <h2 className="font-heading text-lead font-semibold text-ink">
                House rules
              </h2>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-caption">
                <div>
                  <dt className="text-muted-ink">Smoking</dt>
                  <dd className="font-medium text-ink">
                    {property.houseRules.smoking ? "Allowed" : "Not allowed"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-ink">Drinking</dt>
                  <dd className="font-medium text-ink">
                    {property.houseRules.drinking ? "Allowed" : "Not allowed"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-ink">Pets</dt>
                  <dd className="font-medium text-ink">
                    {property.houseRules.pets ? "Allowed" : "Not allowed"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-ink">Visitors</dt>
                  <dd className="font-medium text-ink">
                    {property.houseRules.visitors ? "Allowed" : "Not allowed"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-ink">Food preference</dt>
                  <dd className="font-medium text-ink">
                    {property.houseRules.nonVeg ? "Non-veg allowed" : "Veg only"}
                  </dd>
                </div>
                {property.houseRules.curfew && (
                  <div>
                    <dt className="text-muted-ink">Curfew</dt>
                    <dd className="font-medium text-ink">
                      {property.houseRules.curfew}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Nearby places */}
          {property.nearby && property.nearby.length > 0 && (
            <div className="border-t border-hairline pt-6 space-y-3">
              <h2 className="font-heading text-lead font-semibold text-ink">
                Nearby places
              </h2>
              <ul className="divide-y divide-hairline">
                {property.nearby.map((place, idx) => (
                  <li key={idx} className="py-2 flex items-center justify-between text-caption">
                    <span className="font-medium text-ink">{place.name}</span>
                    <span className="text-muted-ink">
                      {place.distanceKm} km ({place.kind})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="border-t border-hairline pt-6 space-y-3">
              <h2 className="font-heading text-lead font-semibold text-ink">
                About this room
              </h2>
              <p className="text-body text-ink max-w-[70ch] whitespace-pre-line leading-relaxed">
                {property.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Apply Panel (cols 9-12) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <ApplyPanel property={property} />
        </div>
      </div>
    </div>
  );
}
