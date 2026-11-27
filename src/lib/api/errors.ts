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
