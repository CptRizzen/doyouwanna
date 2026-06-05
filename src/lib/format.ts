/** Human-readable event start time, or a fallback for spur-of-moment events. */
export function formatEventTime(startsAt: string | null): string {
  if (!startsAt) return 'Anytime';
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return 'Anytime';
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
