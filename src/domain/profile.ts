/**
 * Profile display helpers — pure functions, no side effects.
 * Mirror what the UI needs to display user profiles.
 */

/** Two-letter initials from display name or username fallback. */
export function getInitials(displayName: string | null, username: string): string {
  const name = (displayName ?? username).trim();
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Comma-joined interests string, empty string when none. */
export function formatInterestsList(interests: string[]): string {
  return interests.join(', ');
}

/** Returns location label or empty string. */
export function displayLocation(locationLabel: string | null | undefined): string {
  return locationLabel ?? '';
}
