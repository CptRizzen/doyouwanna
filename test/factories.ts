import {
  CircleRole,
  EventVisibility,
  RsvpStatus,
} from '@/domain/types';

/**
 * Test data factories. Each returns a plausible default that individual tests
 * override with a partial. Shapes track the API/database row shapes.
 */

let seq = 0;
const id = (prefix: string) => `${prefix}-${++seq}`;

export interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  activity_tags: string[];
  discovery_mode: 'off' | 'activity_match' | 'open';
}

export function makeProfile(overrides: Partial<ProfileRow> = {}): ProfileRow {
  const pid = overrides.id ?? id('user');
  return {
    id: pid,
    username: `user_${pid}`,
    display_name: 'Test User',
    activity_tags: [],
    discovery_mode: 'off',
    ...overrides,
  };
}

export interface CircleRow {
  id: string;
  owner_id: string;
  name: string;
  activity_tags: string[];
}

export function makeCircle(overrides: Partial<CircleRow> = {}): CircleRow {
  return {
    id: overrides.id ?? id('circle'),
    owner_id: overrides.owner_id ?? id('user'),
    name: 'Hiking Crew',
    activity_tags: ['hiking'],
    ...overrides,
  };
}

export interface EventRow {
  id: string;
  creator_id: string;
  title: string;
  visibility: EventVisibility;
  starts_at: string | null;
  is_checkin: boolean;
  broadcast_circle_ids: string[];
}

export function makeEvent(overrides: Partial<EventRow> = {}): EventRow {
  return {
    id: overrides.id ?? id('event'),
    creator_id: overrides.creator_id ?? id('user'),
    title: 'Saturday Trail',
    visibility: 'circles_only',
    starts_at: '2026-06-06T16:00:00Z',
    is_checkin: false,
    broadcast_circle_ids: [],
    ...overrides,
  };
}

export const sampleRole: CircleRole = 'member';
export const sampleRsvp: RsvpStatus = 'invited';
