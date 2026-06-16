/**
 * Normalize a user-provided link so it always opens externally.
 * Bare links like "drive.google.com/x" would otherwise be treated as a
 * relative path and redirect inside our own site — prepend https:// to fix.
 */
export function externalUrl(u?: string | null): string {
  if (!u) return "#";
  const t = u.trim();
  if (!t) return "#";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(t)) return t;
  return `https://${t}`;
}
