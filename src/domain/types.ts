/**
 * Shared domain types for DoYouWanna.
 *
 * These mirror the CHECK constraints and enum-like text columns in the Supabase
 * schema (see supabase/migrations). The pure functions in this folder encode the
 * same visibility / state-machine rules that Row Level Security enforces on the
 * server, so the Jest suites here double as the executable spec.
 */

export type CircleRole = 'owner' | 'admin' | 'member';

export type EventVisibility = 'circles_only' | 'discoverable';

export type RsvpStatus =
  | 'invited'
  | 'going'
  | 'maybe'
  | 'not_going'
  | 'on_my_way'
  | 'arrived';

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export type ConnectionStatus = 'pending' | 'connected' | 'blocked';

export type DiscoveryMode = 'off' | 'activity_match' | 'open';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}
