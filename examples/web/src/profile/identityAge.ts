import type { ProfileIdentity } from "./identityModel";

/** Age in full years from ISO date (YYYY-MM-DD or full ISO). */
export function computeAgeFromDob(dob: string, now = new Date()): number | null {
  const trimmed = dob.trim();
  if (!trimmed) return null;
  let birth: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    birth = new Date(Date.UTC(y, m - 1, d));
  } else {
    birth = new Date(trimmed);
  }
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age >= 0 && age < 150 ? age : null;
}

export function formatAgeLabel(identity: ProfileIdentity, now = new Date()): string | null {
  const fromDob = identity.dateOfBirth ? computeAgeFromDob(identity.dateOfBirth, now) : null;
  const age = fromDob ?? identity.age;
  return age != null ? String(age) : null;
}
