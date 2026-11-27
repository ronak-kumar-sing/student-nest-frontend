"use client";

import React from "react";
import {
  CITIES,
  VALID_ROOM_TYPES,
  VALID_GENDER_POLICIES,
  VALID_AMENITIES,
  type RoomFilters,
  type SortOption,
} from "@/lib/search-params";
import {
  formatRoomType,
  formatAmenity,
} from "@/lib/api/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export interface FiltersFormProps {
  filters: RoomFilters;
  onChange: (nextFilters: RoomFilters) => void;
  onClear: () => void;
  onCloseSheet?: () => void;
}

export function FiltersForm({
  filters,
  onChange,
  onClear,
  onCloseSheet,
}: FiltersFormProps) {
  const handleCityChange = (city: string) => {
    onChange({ ...filters, city });
  };

  const handleQueryChange = (q: string) => {
    onChange({ ...filters, q: q.trim() || undefined });
  };

  const handleMinRentChange = (val: string) => {
    const num = Number(val);
    onChange({
      ...filters,
      minRent: !isNaN(num) && num >= 0 && val !== "" ? num : undefined,
    });
  };

  const handleMaxRentChange = (val: string) => {
    const num = Number(val);
    onChange({
      ...filters,
      maxRent: !isNaN(num) && num >= 0 && val !== "" ? num : undefined,
    });
  };

  const handleRoomTypeToggle = (type: (typeof VALID_ROOM_TYPES)[number]) => {
    const next = filters.roomType.includes(type)
      ? filters.roomType.filter((t) => t !== type)
      : [...filters.roomType, type];
    onChange({ ...filters, roomType: next });
  };

  const handleGenderPolicyChange = (policy: (typeof VALID_GENDER_POLICIES)[number] | "all") => {
    onChange({
      ...filters,
      genderPolicy: policy === "all" ? undefined : policy,
    });
  };

  const handleTenancyToggle = (tenancy: "whole_unit" | "per_bed" | "all") => {
    onChange({
      ...filters,
      tenancyType: tenancy === "all" ? undefined : tenancy,
    });
  };

  const handleAmenityToggle = (amenity: (typeof VALID_AMENITIES)[number]) => {
    const next = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: next });
  };

  const handleSortChange = (sort: SortOption) => {
    onChange({ ...filters, sort });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCloseSheet?.();
      }}
      className="space-y-6 text-body text-ink"
    >
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <h2 className="font-heading text-lead font-semibold">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-caption text-ballpoint hover:underline cursor-pointer"
        >
          Clear filters
        </button>
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <label htmlFor="filter-city" className="block text-caption font-medium text-ink">
          City
        </label>
        <select
          id="filter-city"
          value={filters.city}
          onChange={(e) => handleCityChange(e.target.value)}
          className="w-full rounded border border-control-border bg-paper px-3 py-2 text-caption text-ink focus-visible:outline-2 focus-visible:outline-ballpoint"
        >
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Locality or College */}
      <div className="space-y-1.5">
        <label htmlFor="filter-q" className="block text-caption font-medium text-ink">
          College or locality
        </label>
        <Input
          id="filter-q"
          placeholder="e.g. IIPS or Vijay Nagar"
          value={filters.q || ""}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="border-control-border text-caption"
        />
      </div>

      {/* Rent Budget */}
      <fieldset className="space-y-1.5">
        <legend className="block text-caption font-medium text-ink">
          Monthly budget (₹)
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-min-rent" className="sr-only">Minimum rent per month</label>
            <Input
              id="filter-min-rent"
              type="number"
              placeholder="Min ₹"
              value={filters.minRent ?? ""}
              onChange={(e) => handleMinRentChange(e.target.value)}
              className="border-control-border text-caption"
            />
          </div>
          <div>
            <label htmlFor="filter-max-rent" className="sr-only">Maximum rent per month</label>
            <Input
              id="filter-max-rent"
              type="number"
              placeholder="Max ₹"
              value={filters.maxRent ?? ""}
              onChange={(e) => handleMaxRentChange(e.target.value)}
              className="border-control-border text-caption"
            />
          </div>
        </div>
      </fieldset>

      {/* Sort */}
      <div className="space-y-1.5">
        <label htmlFor="filter-sort" className="block text-caption font-medium text-ink">
          Sort by
        </label>
        <select
          id="filter-sort"
          value={filters.sort || "newest"}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="w-full rounded border border-control-border bg-paper px-3 py-2 text-caption text-ink focus-visible:outline-2 focus-visible:outline-ballpoint"
        >
          {filters.q && <option value="relevance">Relevance</option>}
          <option value="newest">Newest</option>
          <option value="rent_asc">Rent: low to high</option>
          <option value="rent_desc">Rent: high to low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Room Type */}
      <fieldset className="space-y-2">
        <legend className="block text-caption font-medium text-ink">Room type</legend>
        <div className="space-y-1.5">
          {VALID_ROOM_TYPES.map((type) => {
            const checked = filters.roomType.includes(type);
            const id = `room-type-${type}`;
            return (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => handleRoomTypeToggle(type)}
                />
                <label htmlFor={id} className="text-caption text-ink cursor-pointer select-none">
                  {formatRoomType(type)}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* Gender Policy */}
      <fieldset className="space-y-2">
        <legend className="block text-caption font-medium text-ink">Gender policy</legend>
        <div className="flex flex-col gap-1.5 text-caption">
          {[
            { value: "all", label: "Any policy" },
            { value: "any", label: "Anyone welcome" },
            { value: "male_only", label: "Men only" },
            { value: "female_only", label: "Women only" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="genderPolicy"
                checked={
                  opt.value === "all"
                    ? !filters.genderPolicy
                    : filters.genderPolicy === opt.value
                }
                onChange={() =>
                  handleGenderPolicyChange(
                    opt.value as (typeof VALID_GENDER_POLICIES)[number] | "all"
                  )
                }
                className="text-ballpoint focus:ring-ballpoint"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Tenancy Type */}
      <fieldset className="space-y-2">
        <legend className="block text-caption font-medium text-ink">Tenancy type</legend>
        <div className="flex flex-col gap-1.5 text-caption">
          {[
            { value: "all", label: "Any tenancy" },
            { value: "whole_unit", label: "Whole unit" },
            { value: "per_bed", label: "Per bed" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="tenancyType"
                checked={
                  opt.value === "all"
                    ? !filters.tenancyType
                    : filters.tenancyType === opt.value
                }
                onChange={() =>
                  handleTenancyToggle(opt.value as "whole_unit" | "per_bed" | "all")
                }
                className="text-ballpoint focus:ring-ballpoint"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Amenities */}
      <fieldset className="space-y-2">
        <legend className="block text-caption font-medium text-ink">Amenities</legend>
        <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {VALID_AMENITIES.map((am) => {
            const checked = filters.amenities.includes(am);
            const id = `amenity-${am}`;
            return (
              <div key={am} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => handleAmenityToggle(am)}
                />
                <label htmlFor={id} className="text-caption text-ink cursor-pointer select-none">
                  {formatAmenity(am)}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {onCloseSheet && (
        <div className="pt-4 border-t border-hairline">
          <Button
            type="submit"
            className="w-full bg-ballpoint text-ballpoint-foreground"
          >
            Show rooms
          </Button>
        </div>
      )}
    </form>
  );
}
