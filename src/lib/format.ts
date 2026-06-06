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

/** Short chip-style time: "SAT · 7:00 AM" */
export function formatEventTimeShort(startsAt: string | null): string {
  if (!startsAt) return 'Anytime';
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return 'Anytime';
  const day = date.toLocaleString(undefined, { weekday: 'short' }).toUpperCase();
  const time = date.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}

/** Day of week + time-of-day greeting: "SATURDAY · GOOD MORNING" */
export function formatDayGreeting(): string {
  const h = new Date().getHours();
  const tod = h < 12 ? 'GOOD MORNING' : h < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const day = new Date().toLocaleString(undefined, { weekday: 'long' }).toUpperCase();
  return `${day} · ${tod}`;
}
