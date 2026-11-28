import type { UserMe, UpdateProfile, Gender } from "@/lib/api";

export type ProfileFormValues = {
  displayName: string;
  bio: string;
  gender: Gender | "";
  college: string;
  city: string;
};

export function profileFormFromMe(me: UserMe): ProfileFormValues {
  return {
    displayName: me.displayName ?? "",
    bio: me.bio ?? "",
    gender: me.gender ?? "",
    college: me.college ?? "",
    city: me.city ?? "",
  };
}

export function validateProfileForm(
  values: ProfileFormValues
): Partial<Record<keyof ProfileFormValues, string>> {
  const errors: Partial<Record<keyof ProfileFormValues, string>> = {};
  const trimmedName = values.displayName.trim();
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    errors.displayName = "Enter your name (2 to 50 characters).";
  }
  if (values.bio.length > 300) {
    errors.bio = "Keep your bio to 300 characters or fewer.";
  }
  if (values.college.trim().length > 100) {
    errors.college = "Keep the college name to 100 characters or fewer.";
  }
  return errors;
}

export function changedFields(
  initial: ProfileFormValues,
  values: ProfileFormValues
): UpdateProfile {
  const diff: UpdateProfile = {};

  const trimmedDisplayName = values.displayName.trim();
  if (trimmedDisplayName !== initial.displayName.trim()) {
    diff.displayName = trimmedDisplayName;
  }

  const trimmedBio = values.bio.trim();
  if (trimmedBio !== (initial.bio || "").trim()) {
    diff.bio = trimmedBio;
  }

  if (values.gender !== initial.gender) {
    if (values.gender !== "") {
      diff.gender = values.gender;
    }
  }

  const trimmedCollege = values.college.trim();
  if (trimmedCollege !== (initial.college || "").trim()) {
    diff.college = trimmedCollege;
  }

  const trimmedCity = values.city.trim();
  if (trimmedCity !== (initial.city || "").trim()) {
    if (trimmedCity !== "") {
      diff.city = trimmedCity;
    }
  }

  return diff;
}
