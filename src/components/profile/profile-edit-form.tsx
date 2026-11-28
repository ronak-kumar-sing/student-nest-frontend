"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { updateMe, type UserMe, type UpdateProfile, type Gender } from "@/lib/api";
import { friendlyMessage } from "@/lib/api/errors";
import { CITIES, cityName } from "@/lib/search-params";
import {
  profileFormFromMe,
  validateProfileForm,
  changedFields,
  type ProfileFormValues,
} from "./profile-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RiErrorWarningLine } from "@remixicon/react";

export interface ProfileEditFormProps {
  me: UserMe;
  onSaved?: (me: UserMe) => void;
  onCancel?: () => void;
  save?: (body: UpdateProfile) => Promise<UserMe>;
}

export function ProfileEditForm({
  me,
  onSaved,
  onCancel,
  save = updateMe,
}: ProfileEditFormProps) {
  const queryClient = useQueryClient();

  const initialValues = useMemo(() => profileFormFromMe(me), [me]);
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProfileFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const diff = changedFields(initialValues, values);
  const hasChanges = Object.keys(diff).length > 0;

  const baseCitySlugs = new Set(CITIES.map((c) => c.slug.toLowerCase()));
  const extraCity =
    me.city && !baseCitySlugs.has(me.city.toLowerCase())
      ? [{ slug: me.city.toLowerCase(), name: cityName(me.city) }]
      : [];
  const cityOptions = [...CITIES, ...extraCity];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors = validateProfileForm(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const changes = changedFields(initialValues, values);
    if (Object.keys(changes).length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await save(changes);
      toast.success("Profile saved");
      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      onSaved?.(updated);
    } catch (err: unknown) {
      setFormError(friendlyMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-caption text-ink"
        >
          <RiErrorWarningLine className="size-4 text-destructive shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-edit-name" className="text-body font-medium text-ink">
          Name
        </Label>
        <Input
          id="profile-edit-name"
          type="text"
          value={values.displayName}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, displayName: e.target.value }));
            if (fieldErrors.displayName) {
              setFieldErrors((prev) => ({ ...prev, displayName: undefined }));
            }
          }}
          disabled={isSaving}
          className="border-[var(--control-border)]"
          aria-invalid={Boolean(fieldErrors.displayName)}
          aria-describedby={
            fieldErrors.displayName ? "profile-edit-name-error" : undefined
          }
        />
        {fieldErrors.displayName && (
          <p
            id="profile-edit-name-error"
            className="text-caption text-destructive"
            role="alert"
          >
            {fieldErrors.displayName}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-edit-bio" className="text-body font-medium text-ink">
          Bio
        </Label>
        <Textarea
          id="profile-edit-bio"
          value={values.bio}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, bio: e.target.value }));
            if (fieldErrors.bio) {
              setFieldErrors((prev) => ({ ...prev, bio: undefined }));
            }
          }}
          maxLength={300}
          disabled={isSaving}
          className="border-[var(--control-border)] min-h-24"
          aria-invalid={Boolean(fieldErrors.bio)}
          aria-describedby={`profile-edit-bio-counter ${
            fieldErrors.bio ? "profile-edit-bio-error" : ""
          }`.trim()}
        />
        <div className="flex justify-between items-center text-caption text-muted-ink">
          {fieldErrors.bio ? (
            <p
              id="profile-edit-bio-error"
              className="text-destructive"
              role="alert"
            >
              {fieldErrors.bio}
            </p>
          ) : (
            <span />
          )}
          <span id="profile-edit-bio-counter">{values.bio.length} of 300</span>
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
        <Label
          htmlFor="profile-edit-gender"
          className="text-body font-medium text-ink"
        >
          Gender
        </Label>
        <select
          id="profile-edit-gender"
          value={values.gender}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              gender: e.target.value as Gender | "",
            }))
          }
          disabled={isSaving}
          className="w-full rounded border border-control-border bg-paper px-3 py-2 text-caption text-ink focus-visible:outline-2 focus-visible:outline-ballpoint"
        >
          <option value="">Not set</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non_binary">Non-binary</option>
          <option value="undisclosed">Prefer not to say</option>
        </select>
      </div>

      {/* College (Students only) */}
      {me.role === "student" && (
        <div className="space-y-1.5">
          <Label
            htmlFor="profile-edit-college"
            className="text-body font-medium text-ink"
          >
            College
          </Label>
          <Input
            id="profile-edit-college"
            type="text"
            value={values.college}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, college: e.target.value }));
              if (fieldErrors.college) {
                setFieldErrors((prev) => ({ ...prev, college: undefined }));
              }
            }}
            maxLength={100}
            disabled={isSaving}
            className="border-[var(--control-border)]"
            aria-invalid={Boolean(fieldErrors.college)}
            aria-describedby={
              fieldErrors.college ? "profile-edit-college-error" : undefined
            }
          />
          {fieldErrors.college && (
            <p
              id="profile-edit-college-error"
              className="text-caption text-destructive"
              role="alert"
            >
              {fieldErrors.college}
            </p>
          )}
        </div>
      )}

      {/* City */}
      <div className="space-y-1.5">
        <Label htmlFor="profile-edit-city" className="text-body font-medium text-ink">
          City
        </Label>
        <select
          id="profile-edit-city"
          value={values.city}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              city: e.target.value,
            }))
          }
          disabled={isSaving}
          className="w-full rounded border border-control-border bg-paper px-3 py-2 text-caption text-ink focus-visible:outline-2 focus-visible:outline-ballpoint"
        >
          <option value="">Not set</option>
          {cityOptions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!hasChanges || isSaving}
          className="bg-ballpoint hover:bg-ballpoint/90 text-[var(--ballpoint-foreground)] font-medium"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
