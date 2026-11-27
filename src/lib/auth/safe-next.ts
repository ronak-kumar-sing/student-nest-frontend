export function safeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") {
    return "/rooms";
  }
  const trimmed = next.trim();
  // Must start with single slash, not double slash or slash backslash
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return "/rooms";
  }
  // Disallow protocol schemes
  if (trimmed.includes(":") || trimmed.toLowerCase().includes("javascript")) {
    return "/rooms";
  }
  return trimmed;
}
