import { friendlyMessage, isApiError } from "@/lib/api/errors";

const ROOMMATE_ERROR_MESSAGES: Record<string, string> = {
  GENDER_POLICY_MISMATCH:
    "One of you prefers a roommate of the same gender, so this request cannot be sent.",
  PROFILE_REQUIRED:
    "Your roommate profile is hidden or not set up yet. Show it again or create one to continue.",
  NOT_FOUND: "This roommate request no longer exists.",
  GENDER_REQUIRED:
    "Set your gender on your profile before choosing a same-gender roommate.",
  DUPLICATE_REQUEST: "You already have a roommate request with this student.",
  TOO_MANY_REQUESTS:
    "You can send up to 10 roommate requests a day. Try again tomorrow.",
};

export function roommateErrorMessage(err: unknown): string {
  if (isApiError(err) && err.code && ROOMMATE_ERROR_MESSAGES[err.code]) {
    return ROOMMATE_ERROR_MESSAGES[err.code];
  }
  return friendlyMessage(err);
}
