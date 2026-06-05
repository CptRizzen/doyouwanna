import { InviteStatus } from './types';

/**
 * Email-invite state machine for the `invites` table.
 *
 * An invite is created `pending`. It can then be `accepted` (the recipient
 * created/owns an account with the invited email and joined), `revoked` (the
 * inviter cancelled it), or `expired` (past `expires_at`). Accepted/revoked/
 * expired are terminal. The `accept_invite` SQL RPC enforces the same rules.
 */
export const INVITE_TRANSITIONS: Record<InviteStatus, InviteStatus[]> = {
  pending: ['accepted', 'expired', 'revoked'],
  accepted: [],
  expired: [],
  revoked: [],
};

export interface Invite {
  status: InviteStatus;
  /** ISO timestamp, or null for invites that never expire. */
  expiresAt: string | null;
}

export function isInviteExpired(invite: Invite, now: Date): boolean {
  if (invite.expiresAt === null) return false;
  return new Date(invite.expiresAt).getTime() <= now.getTime();
}

export function canAcceptInvite(invite: Invite, now: Date): boolean {
  return invite.status === 'pending' && !isInviteExpired(invite, now);
}

export type InviteAction = 'accept' | 'revoke' | 'expire';

const ACTION_TARGET: Record<InviteAction, InviteStatus> = {
  accept: 'accepted',
  revoke: 'revoked',
  expire: 'expired',
};

/**
 * Resolve the next status for an action, or null if the action is not allowed
 * from the current status.
 */
export function nextInviteStatus(
  current: InviteStatus,
  action: InviteAction,
): InviteStatus | null {
  const target = ACTION_TARGET[action];
  return INVITE_TRANSITIONS[current].includes(target) ? target : null;
}
