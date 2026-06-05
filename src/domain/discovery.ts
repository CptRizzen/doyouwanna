import { ConnectionStatus, DiscoveryMode, GeoPoint } from './types';

/**
 * Discovery connection state machine + location blurring.
 *
 * Mirrors the `discovery_connections` table and the `discoverable_profiles`
 * view. Connections are consent-required: a requester sends a `pending` request
 * to a discoverable user, who can accept (`connected`) or `blocked`. Blocking is
 * terminal here; "unblocking" is modelled as deleting the row, not a transition.
 */
export const CONNECTION_TRANSITIONS: Record<ConnectionStatus, ConnectionStatus[]> = {
  pending: ['connected', 'blocked'],
  connected: ['blocked'],
  blocked: [],
};

export interface RequestConnectionParams {
  fromUserId: string;
  toUserId: string;
  /** Existing relationship between the two users, or null if none. */
  existingStatus: ConnectionStatus | null;
  /** The target's discovery setting; `off` means they are not discoverable. */
  toDiscoveryMode: DiscoveryMode;
}

export function canRequestConnection({
  fromUserId,
  toUserId,
  existingStatus,
  toDiscoveryMode,
}: RequestConnectionParams): boolean {
  // No self-connections.
  if (fromUserId === toUserId) return false;
  // Target must be open to discovery.
  if (toDiscoveryMode === 'off') return false;
  // Only request when there is no existing relationship.
  return existingStatus === null;
}

export function canTransitionConnection(
  from: ConnectionStatus,
  to: ConnectionStatus,
): boolean {
  if (from === to) return false;
  return CONNECTION_TRANSITIONS[from].includes(to);
}

/**
 * Blur a precise point onto a coarse grid, mirroring the server-side
 * `ST_SnapToGrid(home_location, gridDeg)` used by the `discoverable_profiles`
 * view. The default ~0.01° grid is roughly a 1km cell, so strangers never see a
 * user's exact location.
 */
export function blurPoint(point: GeoPoint, gridDeg = 0.01): GeoPoint {
  const snap = (v: number) => Math.round(v / gridDeg) * gridDeg;
  // toFixed tames floating-point noise; +() drops any "-0".
  const round = (v: number) => +snap(v).toFixed(6);
  return { latitude: round(point.latitude), longitude: round(point.longitude) };
}
