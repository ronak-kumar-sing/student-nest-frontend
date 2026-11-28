"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { RiCloseLine } from "@remixicon/react";
import { CITIES } from "@/lib/search-params";
import {
  WIZARD_STEPS,
  type WizardValues,
  type WizardErrors,
  validateStep,
  validateAll,
  toUpsertDto,
  toLocalitySlug,
  todayInIst,
} from "@/lib/roommates/wizard";
import {
  INTEREST_LABELS,
  localityLabel,
} from "@/lib/roommates/format";
import { roommateErrorMessage } from "@/lib/roommates/errors";
import {
  upsertRoommateProfile,
  type RoommateProfile,
  type UpsertRoommateProfile,
  type Interest,
  type Lifestyle,
} from "@/lib/api/roommates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface RoommateWizardProps {
  initial: WizardValues;
  mode: "create" | "edit";
  userGender?: string | null;
  onSaved: (p: RoommateProfile) => void;
  onCancel?: () => void;
  save?: (body: UpsertRoommateProfile) => Promise<RoommateProfile>;
}

const ALL_INTERESTS: Interest[] = [
  "music",
  "movies",
  "reading",
  "gaming",
  "sports",
  "fitness",
  "cooking",
  "travel",
  "coding",
  "art",
  "photography",
  "dance",
  "anime",
  "yoga",
  "writing",
  "theatre",
];

export function RoommateWizard({
  initial,
  mode,
  userGender,
  onSaved,
  onCancel,
  save = upsertRoommateProfile,
}: RoommateWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [values, setValues] = useState<WizardValues>(initial);
  const [errors, setErrors] = useState<WizardErrors>({});
  const [localityInput, setLocalityInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const citySelectId = useId();
  const localityInputId = useId();
  const budgetMinId = useId();
  const budgetMaxId = useId();
  const moveInById = useId();
  const bioId = useId();
  const collegeId = useId();

  // Focus step heading on step change
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [currentStep]);

  const activeStepMeta = WIZARD_STEPS.find((s) => s.id === currentStep)!;
  const today = todayInIst();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const stepErrors = validateStep(currentStep, values, { today, userGender });
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setApiError(null);
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const allErrors = validateAll(values, { today, userGender });
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      const dto = toUpsertDto(values);
      const savedProfile = await save(dto);
      onSaved(savedProfile);
    } catch (err: unknown) {
      setApiError(roommateErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLocality = () => {
    const slug = toLocalitySlug(localityInput);
    if (!slug) return;
    if (values.localities.length >= 5) {
      setErrors((prev) => ({
        ...prev,
        localities: "Add up to 5 localities.",
      }));
      return;
    }
    if (values.localities.includes(slug)) {
      setErrors((prev) => ({
        ...prev,
        localities: "Each locality can be added once.",
      }));
      return;
    }
    setValues((prev) => ({
      ...prev,
      localities: [...prev.localities, slug],
    }));
    setLocalityInput("");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.localities;
      return next;
    });
  };

  const handleRemoveLocality = (slug: string) => {
    setValues((prev) => ({
      ...prev,
      localities: prev.localities.filter((loc) => loc !== slug),
    }));
  };

  const toggleInterest = (interest: Interest) => {
    setValues((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      }
      if (prev.interests.length >= 10) {
        setErrors((e) => ({
          ...e,
          interests: "Choose up to 10 interests.",
        }));
        return prev;
      }
      setErrors((e) => {
        const next = { ...e };
        delete next.interests;
        return next;
      });
      return {
        ...prev,
        interests: [...prev.interests, interest],
      };
    });
  };

  return (
    <div className="border border-border bg-paper rounded-lg p-6 sm:p-8 space-y-6">
      {/* Ordered Step List */}
      <nav aria-label="Roommate wizard progress">
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-caption">
          {WIZARD_STEPS.map((step) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <li
                key={step.id}
                aria-current={isCurrent ? "step" : undefined}
                className={`border-b-2 pb-1.5 ${
                  isCurrent
                    ? "border-ballpoint font-semibold text-ink"
                    : isCompleted
                    ? "border-border text-ink"
                    : "border-hairline text-muted-ink"
                }`}
              >
                <span className="block text-caption">Step {step.id}</span>
                <span className="block truncate font-medium">{step.title}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Heading */}
      <div>
        <p className="text-caption text-muted-ink">Step {currentStep} of 4</p>
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="font-heading text-title font-semibold text-ink outline-none mt-0.5"
        >
          {activeStepMeta.title}
        </h2>
      </div>

      {apiError && (
        <div
          role="alert"
          className="p-3 bg-pink-slip/20 border border-pink-slip text-destructive text-caption rounded"
        >
          {apiError}
        </div>
      )}

      {/* STEP 1: City and Localities */}
      {currentStep === 1 && (
        <form noValidate onSubmit={handleNext} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={citySelectId} className="text-body text-ink">
              City
            </Label>
            <select
              id={citySelectId}
              value={values.citySlug}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, citySlug: e.target.value }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.citySlug;
                  return next;
                });
              }}
              aria-invalid={Boolean(errors.citySlug)}
              aria-describedby={errors.citySlug ? "city-error" : undefined}
              className="h-9 w-full rounded-sm border border-input bg-background px-3 py-1 text-sm text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.citySlug && (
              <p id="city-error" className="text-caption text-destructive">
                {errors.citySlug}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={localityInputId} className="text-body text-ink">
              Add a locality
            </Label>
            <p className="text-caption text-muted-ink">
              Up to 5. Leave empty to match anywhere in the city.
            </p>
            <div className="flex gap-2">
              <Input
                id={localityInputId}
                value={localityInput}
                onChange={(e) => setLocalityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLocality();
                  }
                }}
                placeholder="e.g. Vijay Nagar"
                aria-invalid={Boolean(errors.localities)}
                aria-describedby={
                  errors.localities ? "localities-error" : undefined
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddLocality}
              >
                Add locality
              </Button>
            </div>

            {errors.localities && (
              <p
                id="localities-error"
                className="text-caption text-destructive"
              >
                {errors.localities}
              </p>
            )}

            {values.localities.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {values.localities.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleRemoveLocality(loc)}
                    aria-label={`Remove ${localityLabel(loc)}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary text-caption text-ink border border-hairline hover:border-destructive hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ballpoint transition-colors"
                  >
                    <span>{localityLabel(loc)}</span>
                    <RiCloseLine className="size-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : (
              <div />
            )}
            <Button type="submit">Next</Button>
          </div>
        </form>
      )}

      {/* STEP 2: Budget and Move-in */}
      {currentStep === 2 && (
        <form noValidate onSubmit={handleNext} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={budgetMinId} className="text-body text-ink">
                Lowest budget (₹ a month)
              </Label>
              <Input
                id={budgetMinId}
                inputMode="numeric"
                value={values.budgetMin}
                onChange={(e) => {
                  setValues((prev) => ({
                    ...prev,
                    budgetMin: e.target.value,
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.budgetMin;
                    delete next.budgetMax;
                    return next;
                  });
                }}
                placeholder="e.g. 6000"
                aria-invalid={Boolean(errors.budgetMin)}
                aria-describedby={
                  errors.budgetMin ? "budget-min-error" : undefined
                }
              />
              {errors.budgetMin && (
                <p
                  id="budget-min-error"
                  className="text-caption text-destructive"
                >
                  {errors.budgetMin}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={budgetMaxId} className="text-body text-ink">
                Highest budget (₹ a month)
              </Label>
              <Input
                id={budgetMaxId}
                inputMode="numeric"
                value={values.budgetMax}
                onChange={(e) => {
                  setValues((prev) => ({
                    ...prev,
                    budgetMax: e.target.value,
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.budgetMax;
                    return next;
                  });
                }}
                placeholder="e.g. 8000"
                aria-invalid={Boolean(errors.budgetMax)}
                aria-describedby={
                  errors.budgetMax ? "budget-max-error" : undefined
                }
              />
              {errors.budgetMax && (
                <p
                  id="budget-max-error"
                  className="text-caption text-destructive"
                >
                  {errors.budgetMax}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <Label htmlFor={moveInById} className="text-body text-ink">
              Move-in by
            </Label>
            <Input
              id={moveInById}
              type="date"
              min={today}
              value={values.moveInBy}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, moveInBy: e.target.value }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.moveInBy;
                  return next;
                });
              }}
              aria-invalid={Boolean(errors.moveInBy)}
              aria-describedby={
                errors.moveInBy ? "move-in-error" : undefined
              }
            />
            {errors.moveInBy && (
              <p id="move-in-error" className="text-caption text-destructive">
                {errors.moveInBy}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      )}

      {/* STEP 3: Lifestyle */}
      {currentStep === 3 && (
        <form noValidate onSubmit={handleNext} className="space-y-6">
          {/* Preferred Gender */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              Who would you like to live with?
            </legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="preferredGender"
                  value="any"
                  checked={values.preferredGender === "any"}
                  onChange={() => {
                    setValues((prev) => ({
                      ...prev,
                      preferredGender: "any",
                    }));
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.preferredGender;
                      return next;
                    });
                  }}
                  className="accent-[var(--ballpoint)] size-4"
                />
                Anyone
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="preferredGender"
                  value="same"
                  checked={values.preferredGender === "same"}
                  onChange={() => {
                    setValues((prev) => ({
                      ...prev,
                      preferredGender: "same",
                    }));
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.preferredGender;
                      return next;
                    });
                  }}
                  className="accent-[var(--ballpoint)] size-4"
                />
                Same gender as me
              </label>
            </div>
            {(!userGender || userGender === "undisclosed") && (
              <p className="text-caption text-muted-ink">
                Set your gender on your profile first, or choose anyone.
                <Link
                  href="/profile"
                  className="text-ballpoint hover:underline ml-1"
                >
                  Go to profile
                </Link>
              </p>
            )}
            {errors.preferredGender && (
              <p className="text-caption text-destructive">
                {errors.preferredGender}
              </p>
            )}
          </fieldset>

          {/* Smoking */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              Do you smoke?
            </legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="smoking"
                  checked={values.smoking === true}
                  onChange={() => {
                    setValues((prev) => ({ ...prev, smoking: true }));
                    setErrors((e) => {
                      const n = { ...e };
                      delete n.smoking;
                      return n;
                    });
                  }}
                  className="accent-[var(--ballpoint)] size-4"
                />
                Yes
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="smoking"
                  checked={values.smoking === false}
                  onChange={() => {
                    setValues((prev) => ({ ...prev, smoking: false }));
                    setErrors((e) => {
                      const n = { ...e };
                      delete n.smoking;
                      return n;
                    });
                  }}
                  className="accent-[var(--ballpoint)] size-4"
                />
                No
              </label>
            </div>
            {errors.smoking && (
              <p className="text-caption text-destructive">{errors.smoking}</p>
            )}
          </fieldset>

          {/* Drinking */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              Do you drink?
            </legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="drinking"
                  checked={values.drinking === true}
                  onChange={() => {
                    setValues((prev) => ({ ...prev, drinking: true }));
                    setErrors((e) => {
                      const n = { ...e };
                      delete n.drinking;
                      return n;
                    });
                  }}
                  className="accent-[var(--ballpoint)] size-4"
                />
                Yes
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="drinking"
                  checked={values.drinking === false}
                  onChange={() => {
                    setValues((prev) => ({ ...prev, drinking: false }));
                    setErrors((e) => {
                      const n = { ...e };
                      delete n.drinking;
                      return n;
                    });
                  }}
                  className="accent-[var(--ballpoint)] size-4"
                />
                No
              </label>
            </div>
            {errors.drinking && (
              <p className="text-caption text-destructive">{errors.drinking}</p>
            )}
          </fieldset>

          {/* Pets */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              Happy to live with pets?
            </legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="pets"
                  checked={values.pets === true}
                  onChange={() => {
                    setValues((prev) => ({ ...prev, pets: true }));
                    setErrors((e) => {
                      const n = { ...e };
                      delete n.pets;
                      return n;
                    });
                  }}
                  className="accent-[var(--ballpoint)] size-4"
                />
                Yes
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="pets"
                  checked={values.pets === false}
                  onChange={() => {
                    setValues((prev) => ({ ...prev, pets: false }));
                    setErrors((e) => {
                      const n = { ...e };
                      delete n.pets;
                      return n;
                    });
                  }}
                  className="accent-[var(--ballpoint)] size-4"
                />
                No
              </label>
            </div>
            {errors.pets && (
              <p className="text-caption text-destructive">{errors.pets}</p>
            )}
          </fieldset>

          {/* Diet */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">Food</legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              {(
                [
                  { value: "veg", label: "Vegetarian" },
                  { value: "non_veg", label: "Non-vegetarian" },
                  { value: "eggetarian", label: "Eggetarian" },
                ] as const
              ).map((d) => (
                <label
                  key={d.value}
                  className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="radio"
                    name="diet"
                    value={d.value}
                    checked={values.diet === d.value}
                    onChange={() => {
                      setValues((prev) => ({ ...prev, diet: d.value }));
                      setErrors((e) => {
                        const n = { ...e };
                        delete n.diet;
                        return n;
                      });
                    }}
                    className="accent-[var(--ballpoint)] size-4"
                  />
                  {d.label}
                </label>
              ))}
            </div>
            {errors.diet && (
              <p className="text-caption text-destructive">{errors.diet}</p>
            )}
          </fieldset>

          {/* Sleep schedule */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              Sleep schedule
            </legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              {(
                [
                  { value: "early", label: "Early riser" },
                  { value: "late", label: "Night owl" },
                  { value: "flexible", label: "Flexible" },
                ] as const
              ).map((s) => (
                <label
                  key={s.value}
                  className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="radio"
                    name="sleepSchedule"
                    value={s.value}
                    checked={values.sleepSchedule === s.value}
                    onChange={() => {
                      setValues((prev) => ({
                        ...prev,
                        sleepSchedule: s.value,
                      }));
                      setErrors((e) => {
                        const n = { ...e };
                        delete n.sleepSchedule;
                        return n;
                      });
                    }}
                    className="accent-[var(--ballpoint)] size-4"
                  />
                  {s.label}
                </label>
              ))}
            </div>
            {errors.sleepSchedule && (
              <p className="text-caption text-destructive">
                {errors.sleepSchedule}
              </p>
            )}
          </fieldset>

          {/* Cleanliness: 1 to 5 */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              How tidy are you?
            </legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const label =
                  lvl === 1
                    ? "1 (Relaxed)"
                    : lvl === 5
                    ? "5 (Spotless)"
                    : String(lvl);
                return (
                  <label
                    key={lvl}
                    className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cleanliness"
                      value={lvl}
                      checked={values.cleanliness === lvl}
                      onChange={() => {
                        setValues((prev) => ({ ...prev, cleanliness: lvl }));
                        setErrors((e) => {
                          const n = { ...e };
                          delete n.cleanliness;
                          return n;
                        });
                      }}
                      className="accent-[var(--ballpoint)] size-4"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
            {errors.cleanliness && (
              <p className="text-caption text-destructive">
                {errors.cleanliness}
              </p>
            )}
          </fieldset>

          {/* Guests */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              Guests over
            </legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              {(
                [
                  { value: "rarely", label: "Guests rarely" },
                  { value: "sometimes", label: "Guests sometimes" },
                  { value: "often", label: "Guests often" },
                ] as const
              ).map((g) => (
                <label
                  key={g.value}
                  className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="radio"
                    name="guests"
                    value={g.value}
                    checked={values.guests === g.value}
                    onChange={() => {
                      setValues((prev) => ({
                        ...prev,
                        guests: g.value as Lifestyle["guests"],
                      }));
                      setErrors((e) => {
                        const n = { ...e };
                        delete n.guests;
                        return n;
                      });
                    }}
                    className="accent-[var(--ballpoint)] size-4"
                  />
                  {g.label}
                </label>
              ))}
            </div>
            {errors.guests && (
              <p className="text-caption text-destructive">{errors.guests}</p>
            )}
          </fieldset>

          {/* Study habits */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              Study habits
            </legend>
            <div className="flex flex-wrap gap-4 items-center pt-1">
              {(
                [
                  { value: "quiet", label: "Quiet study" },
                  { value: "music", label: "Studies with music" },
                  { value: "flexible", label: "Flexible study" },
                ] as const
              ).map((sh) => (
                <label
                  key={sh.value}
                  className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="radio"
                    name="studyHabits"
                    value={sh.value}
                    checked={values.studyHabits === sh.value}
                    onChange={() => {
                      setValues((prev) => ({
                        ...prev,
                        studyHabits: sh.value as Lifestyle["studyHabits"],
                      }));
                      setErrors((e) => {
                        const n = { ...e };
                        delete n.studyHabits;
                        return n;
                      });
                    }}
                    className="accent-[var(--ballpoint)] size-4"
                  />
                  {sh.label}
                </label>
              ))}
            </div>
            {errors.studyHabits && (
              <p className="text-caption text-destructive">
                {errors.studyHabits}
              </p>
            )}
          </fieldset>

          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      )}

      {/* STEP 4: Bio and Interests */}
      {currentStep === 4 && (
        <form noValidate onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={bioId} className="text-body text-ink">
              About you (shown to matching students)
            </Label>
            <Textarea
              id={bioId}
              value={values.bio}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, bio: e.target.value }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.bio;
                  return next;
                });
              }}
              maxLength={300}
              placeholder="Tell potential roommates about yourself, your habits and your daily routine..."
              className="min-h-24"
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={errors.bio ? "bio-error" : undefined}
            />
            <div className="flex justify-between items-center text-caption text-muted-ink pt-0.5">
              <span>
                Phone numbers, emails and links are hidden automatically. Your
                contact details are shared only when you both accept.
              </span>
              <span>{values.bio.length} / 300</span>
            </div>
            {errors.bio && (
              <p id="bio-error" className="text-caption text-destructive">
                {errors.bio}
              </p>
            )}
          </div>

          {/* Interests */}
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">
              Interests (up to 10)
            </legend>
            <p className="text-caption text-muted-ink">
              Selected: {values.interests.length} / 10
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {ALL_INTERESTS.map((interest) => {
                const isSelected = values.interests.includes(interest);
                return (
                  <label
                    key={interest}
                    className={`inline-flex items-center gap-2 p-2 rounded border text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? "border-ballpoint bg-ballpoint/5 text-ink font-medium"
                        : "border-hairline hover:bg-muted text-ink"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleInterest(interest)}
                      className="accent-[var(--ballpoint)] size-4 rounded"
                    />
                    <span>{INTEREST_LABELS[interest]}</span>
                  </label>
                );
              })}
            </div>
            {errors.interests && (
              <p className="text-caption text-destructive">
                {errors.interests}
              </p>
            )}
          </fieldset>

          {/* College */}
          <div className="space-y-2 max-w-md">
            <Label htmlFor={collegeId} className="text-body text-ink">
              College (optional)
            </Label>
            <Input
              id={collegeId}
              value={values.college}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, college: e.target.value }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.college;
                  return next;
                });
              }}
              placeholder="e.g. IIPS Indore"
              maxLength={100}
              aria-invalid={Boolean(errors.college)}
              aria-describedby={
                errors.college ? "college-error" : undefined
              }
            />
            <p className="text-caption text-muted-ink">
              Only used to find students from the same college.
            </p>
            {errors.college && (
              <p id="college-error" className="text-caption text-destructive">
                {errors.college}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSaving}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
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
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : mode === "edit"
                  ? "Save changes"
                  : "Save roommate profile"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
