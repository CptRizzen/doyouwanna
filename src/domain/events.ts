import { EventVisibility } from './types';

/**
 * Event visibility & live-location rules.
 *
 * Mirrors the `can_view_event` SQL helper and the `visible_attendee_locations`
 * view:
 *  - you can view an event if you created it, it is discoverable, or it is
 *    broadcast to a circle you belong to
 *  - you can see another attendee's live location only when you share a broadcast
 *    circle with the event, or the attendee opted into stranger visibility AND you
 *    are a connected discovery contact
 */

export interface EventForVisibility {
  creatorId: string;
  visibility: EventVisibility;
  /** Circle ids the event is broadcast to (event_circles). */
  broadcastCircleIds: string[];
}

export interface ViewerContext {
  userId: string;
  /** Circle ids the viewer is a member of. */
  circleIds: string[];
}

export function canViewEvent(
  event: EventForVisibility,
  viewer: ViewerContext,
): boolean {
  if (event.creatorId === viewer.userId) return true;
  if (event.visibility === 'discoverable') return true;
  return event.broadcastCircleIds.some((id) => viewer.circleIds.includes(id));
}

export interface AttendeeForLocation {
  userId: string;
  visibleToStrangers: boolean;
}

export interface SeeLiveLocationParams {
  event: EventForVisibility;
  attendee: AttendeeForLocation;
  viewer: ViewerContext;
  /** Discovery contacts the viewer is connected to. */
  connectedUserIds: string[];
}

export function canSeeLiveLocation({
  event,
  attendee,
  viewer,
  connectedUserIds,
}: SeeLiveLocationParams): boolean {
  // You can always see your own location.
  if (attendee.userId === viewer.userId) return true;
  // Must be able to see the event at all.
  if (!canViewEvent(event, viewer)) return false;
  // Sharing a broadcast circle grants location visibility.
  const sharesBroadcastCircle = event.broadcastCircleIds.some((id) =>
    viewer.circleIds.includes(id),
  );
  if (sharesBroadcastCircle) return true;
  // Otherwise only when the attendee opted in AND the viewer is a connection.
  return attendee.visibleToStrangers && connectedUserIds.includes(attendee.userId);
}

export interface EventTiming {
  isCheckin?: boolean;
  /** ISO timestamp, or null for spur-of-moment check-ins. */
  startsAt: string | null;
}

export function isCheckin(event: EventTiming): boolean {
  return event.isCheckin === true || event.startsAt === null;
}
