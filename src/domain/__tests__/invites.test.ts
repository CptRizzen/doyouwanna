import {
  INVITE_TRANSITIONS,
  Invite,
  InviteAction,
  canAcceptInvite,
  isInviteExpired,
  nextInviteStatus,
} from '../invites';
import { InviteStatus } from '../types';

const NOW = new Date('2026-06-05T12:00:00Z');

describe('isInviteExpired', () => {
  it('never expires when expiresAt is null', () => {
    expect(isInviteExpired({ status: 'pending', expiresAt: null }, NOW)).toBe(false);
  });

  it('is expired at or after expiresAt', () => {
    expect(
      isInviteExpired({ status: 'pending', expiresAt: '2026-06-05T12:00:00Z' }, NOW),
    ).toBe(true);
    expect(
      isInviteExpired({ status: 'pending', expiresAt: '2026-06-05T11:59:59Z' }, NOW),
    ).toBe(true);
  });

  it('is not expired before expiresAt', () => {
    expect(
      isInviteExpired({ status: 'pending', expiresAt: '2026-06-05T12:00:01Z' }, NOW),
    ).toBe(false);
  });
});

describe('canAcceptInvite', () => {
  it('accepts a pending, unexpired invite', () => {
    const invite: Invite = { status: 'pending', expiresAt: '2026-06-06T00:00:00Z' };
    expect(canAcceptInvite(invite, NOW)).toBe(true);
  });

  it('rejects a pending but expired invite', () => {
    const invite: Invite = { status: 'pending', expiresAt: '2026-06-04T00:00:00Z' };
    expect(canAcceptInvite(invite, NOW)).toBe(false);
  });

  it('rejects non-pending invites', () => {
    const terminal: InviteStatus[] = ['accepted', 'revoked', 'expired'];
    for (const status of terminal) {
      expect(canAcceptInvite({ status, expiresAt: null }, NOW)).toBe(false);
    }
  });
});

describe('nextInviteStatus', () => {
  it('maps actions from pending to their target status', () => {
    expect(nextInviteStatus('pending', 'accept')).toBe('accepted');
    expect(nextInviteStatus('pending', 'revoke')).toBe('revoked');
    expect(nextInviteStatus('pending', 'expire')).toBe('expired');
  });

  it('returns null for any action from a terminal status', () => {
    const terminal: InviteStatus[] = ['accepted', 'revoked', 'expired'];
    const actions: InviteAction[] = ['accept', 'revoke', 'expire'];
    for (const status of terminal) {
      for (const action of actions) {
        expect(nextInviteStatus(status, action)).toBeNull();
      }
    }
  });

  it('only declares transitions out of pending', () => {
    expect(INVITE_TRANSITIONS.accepted).toHaveLength(0);
    expect(INVITE_TRANSITIONS.pending).toEqual(
      expect.arrayContaining(['accepted', 'revoked', 'expired']),
    );
  });
});
