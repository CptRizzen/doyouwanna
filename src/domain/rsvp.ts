import { RsvpStatus } from './types';

/**
 * RSVP state machine for `event_attendees.rsvp_status`.
 *
 * A fresh attendee row starts at `invited`. From there the user moves through
 * intent (`going` / `maybe` / `not_going`) and, on the day, presence
 * (`on_my_way` → `arrived`). Transitions are intentionally forgiving so users
 * can correct mistakes, but every move must be explicitly allowed here so the
 * client and the API agree on what is legal.
 */
export const RSVP_TRANSITIONS: Record<RsvpStatus, RsvpStatus[]> = {
  invited: ['going', 'maybe', 'not_going'],
  maybe: ['going', 'not_going'],
  not_going: ['going', 'maybe'],
  going: ['on_my_way', 'maybe', 'not_going'],
  on_my_way: ['arrived', 'going', 'not_going'],
  arrived: ['going'],
};

export function canTransitionRsvp(from: RsvpStatus, to: RsvpStatus): boolean {
  if (from === to) return false;
  return RSVP_TRANSITIONS[from].includes(to);
}

/** Whether a status counts as actively attending (drives map / headcount). */
export function rsvpIsAttending(status: RsvpStatus): boolean {
  return status === 'going' || status === 'on_my_way' || status === 'arrived';
}
