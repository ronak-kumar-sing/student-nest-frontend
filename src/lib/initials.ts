/**
 * Up to two initials for an avatar placeholder: "Asha Verma" -> "AV", "Asha V." -> "AV",
 * "asha" -> "A". Falls back to "?" for an empty name.
 */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? "")
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
