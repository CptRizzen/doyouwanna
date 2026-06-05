import {
  canInviteToCircle,
  canManageCircle,
  canRemoveMember,
  roleRank,
} from '../circles';

describe('roleRank', () => {
  it('orders owner > admin > member', () => {
    expect(roleRank.owner).toBeGreaterThan(roleRank.admin);
    expect(roleRank.admin).toBeGreaterThan(roleRank.member);
  });
});

describe('canManageCircle', () => {
  it('allows owner and admin, denies member', () => {
    expect(canManageCircle('owner')).toBe(true);
    expect(canManageCircle('admin')).toBe(true);
    expect(canManageCircle('member')).toBe(false);
  });
});

describe('canInviteToCircle', () => {
  it('mirrors management rights', () => {
    expect(canInviteToCircle('owner')).toBe(true);
    expect(canInviteToCircle('admin')).toBe(true);
    expect(canInviteToCircle('member')).toBe(false);
  });
});

describe('canRemoveMember', () => {
  it('never allows removing the owner', () => {
    expect(
      canRemoveMember({
        actorRole: 'owner',
        actorId: 'a',
        targetId: 'a',
        targetRole: 'owner',
      }),
    ).toBe(false);
    expect(
      canRemoveMember({
        actorRole: 'admin',
        actorId: 'admin',
        targetId: 'owner',
        targetRole: 'owner',
      }),
    ).toBe(false);
  });

  it('allows a non-owner to remove themselves (leave)', () => {
    expect(
      canRemoveMember({
        actorRole: 'member',
        actorId: 'u1',
        targetId: 'u1',
        targetRole: 'member',
      }),
    ).toBe(true);
  });

  it('allows managers to remove other members', () => {
    expect(
      canRemoveMember({
        actorRole: 'admin',
        actorId: 'admin',
        targetId: 'u2',
        targetRole: 'member',
      }),
    ).toBe(true);
    expect(
      canRemoveMember({
        actorRole: 'owner',
        actorId: 'owner',
        targetId: 'admin2',
        targetRole: 'admin',
      }),
    ).toBe(true);
  });

  it('denies plain members removing others', () => {
    expect(
      canRemoveMember({
        actorRole: 'member',
        actorId: 'u1',
        targetId: 'u2',
        targetRole: 'member',
      }),
    ).toBe(false);
  });

  it('denies non-members (null role) removing others', () => {
    expect(
      canRemoveMember({
        actorRole: null,
        actorId: 'stranger',
        targetId: 'u2',
        targetRole: 'member',
      }),
    ).toBe(false);
  });
});
