export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
    requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  DEMO_ACCOUNT_LOCKED:
    "Demo accounts are shared, so this change is turned off. Sign up with your own email to try it.",
  PHONE_REQUIRED:
    "Booking needs a verified phone number on your account. Phone verification isn't available on the web yet.",
  DUPLICATE_APPLICATION: "You already have an active application for this room.",
  TOO_MANY_PENDING:
    "You have reached the limit of 5 pending applications. Withdraw one to apply here.",
  PROPERTY_UNAVAILABLE: "This room is no longer available.",
  GENDER_POLICY_MISMATCH:
    "This room does not match your profile's gender policy.",
  SEARCH_UNAVAILABLE:
    "Search is temporarily unavailable. Please try again in a moment.",
  NOT_FOUND: "The requested listing or item could not be found.",
  UNAUTHENTICATED: "Please sign in to continue.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  NETWORK_ERROR:
    "Could not reach Student Nest. Check your connection and try again.",
  ACTIVE_BOOKINGS_EXIST:
    "You have a pending or approved booking. Withdraw it or let it finish before switching to an owner account.",
  VALIDATION_FAILED: "Some details are not valid. Check the form and try again.",
  FORBIDDEN: "Your account cannot do this.",
  CANNOT_ACT_ON_SELF: "You cannot send a roommate request to yourself.",
  DUPLICATE_REQUEST: "You already have a roommate request with this student.",
  TARGET_INACTIVE: "This student is no longer looking for a roommate.",
  TOO_MANY_REQUESTS:
    "You can send up to 10 roommate requests a day. Try again tomorrow.",
  BLOCKED: "You cannot send a request to this student.",
  INVALID_TRANSITION:
    "This request has already changed. Refresh to see its current status.",
  GENDER_REQUIRED:
    "Set your gender on your profile before choosing a same-gender roommate.",
};

export function friendlyMessage(e: unknown): string {
  if (isApiError(e)) {
    if (FRIENDLY_MESSAGES[e.code]) {
      return FRIENDLY_MESSAGES[e.code];
    }
    if (e.status === 401) {
      return FRIENDLY_MESSAGES.UNAUTHENTICATED;
    }
    if (e.status === 429) {
      return FRIENDLY_MESSAGES.RATE_LIMITED;
    }
    if (e.status === 404) {
      return FRIENDLY_MESSAGES.NOT_FOUND;
    }
    return e.message || "An unexpected error occurred. Please try again.";
  }
  if (e instanceof Error) {
    return e.message || "An unexpected error occurred. Please try again.";
  }
  if (typeof e === "string") {
    return e;
  }
  return "An unexpected error occurred. Please try again.";
}
