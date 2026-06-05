import { CircleRole } from './types';

/**
 * Circle membership & permission rules.
 *
 * Mirrors the RLS policies on `circles` / `circle_members`:
 *  - owners/admins can manage the circle and invite members
 *  - any member can remove themselves (leave)
 *  - the owner cannot be removed (ownership must be transferred or the circle deleted)
 */

/** Higher rank ⇒ more privileges. */
export const roleRank: Record<CircleRole, number> = {
  member: 0,
  admin: 1,
  owner: 2,
};

export function canManageCircle(role: CircleRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canInviteToCircle(role: CircleRole): boolean {
  return canManageCircle(role);
}

export interface RemoveMemberParams {
  /** Role of the user performing the removal, or null if they are not a member. */
  actorRole: CircleRole | null;
  actorId: string;
  targetId: string;
  targetRole: CircleRole;
}

export function canRemoveMember({
  actorRole,
  actorId,
  targetId,
  targetRole,
}: RemoveMemberParams): boolean {
  // The owner can never be removed via this path.
  if (targetRole === 'owner') return false;
  // Self-removal (leaving) is always allowed for non-owners.
  if (actorId === targetId) return true;
  // Otherwise the actor must be a manager of the circle.
  return actorRole !== null && canManageCircle(actorRole);
}
