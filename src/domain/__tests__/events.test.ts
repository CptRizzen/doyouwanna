import {
  AttendeeForLocation,
  EventForVisibility,
  ViewerContext,
  canSeeLiveLocation,
  canViewEvent,
  isCheckin,
} from '../events';

const circlesOnly: EventForVisibility = {
  creatorId: 'creator',
  visibility: 'circles_only',
  broadcastCircleIds: ['c1', 'c2'],
};

describe('canViewEvent', () => {
  it('lets the creator view their own event', () => {
    const viewer: ViewerContext = { userId: 'creator', circleIds: [] };
    expect(canViewEvent(circlesOnly, viewer)).toBe(true);
  });

  it('lets anyone view a discoverable event', () => {
    const event: EventForVisibility = { ...circlesOnly, visibility: 'discoverable' };
    const viewer: ViewerContext = { userId: 'stranger', circleIds: [] };
    expect(canViewEvent(event, viewer)).toBe(true);
  });

  it('lets a member of a broadcast circle view a circles_only event', () => {
    const viewer: ViewerContext = { userId: 'u1', circleIds: ['c2'] };
    expect(canViewEvent(circlesOnly, viewer)).toBe(true);
  });

  it('hides a circles_only event from non-members', () => {
    const viewer: ViewerContext = { userId: 'u1', circleIds: ['other'] };
    expect(canViewEvent(circlesOnly, viewer)).toBe(false);
  });
});

describe('canSeeLiveLocation', () => {
  const base = {
    event: circlesOnly,
    connectedUserIds: [] as string[],
  };

  it('always shows your own location', () => {
    expect(
      canSeeLiveLocation({
        ...base,
        attendee: { userId: 'me', visibleToStrangers: false },
        viewer: { userId: 'me', circleIds: [] },
      }),
    ).toBe(true);
  });

  it('denies location when the viewer cannot see the event', () => {
    expect(
      canSeeLiveLocation({
        ...base,
        attendee: { userId: 'other', visibleToStrangers: true },
        viewer: { userId: 'stranger', circleIds: ['nope'] },
        connectedUserIds: ['other'],
      }),
    ).toBe(false);
  });

  it('shows location to a co-member of a broadcast circle', () => {
    expect(
      canSeeLiveLocation({
        ...base,
        attendee: { userId: 'other', visibleToStrangers: false },
        viewer: { userId: 'u1', circleIds: ['c1'] },
      }),
    ).toBe(true);
  });

  it('shows location to a connected stranger when attendee opted in (discoverable event)', () => {
    const event: EventForVisibility = { ...circlesOnly, visibility: 'discoverable' };
    const attendee: AttendeeForLocation = { userId: 'other', visibleToStrangers: true };
    expect(
      canSeeLiveLocation({
        event,
        attendee,
        viewer: { userId: 'stranger', circleIds: [] },
        connectedUserIds: ['other'],
      }),
    ).toBe(true);
  });

  it('hides location from a stranger when attendee did not opt in', () => {
    const event: EventForVisibility = { ...circlesOnly, visibility: 'discoverable' };
    expect(
      canSeeLiveLocation({
        event,
        attendee: { userId: 'other', visibleToStrangers: false },
        viewer: { userId: 'stranger', circleIds: [] },
        connectedUserIds: ['other'],
      }),
    ).toBe(false);
  });

  it('hides location from an opted-in attendee when viewer is not connected', () => {
    const event: EventForVisibility = { ...circlesOnly, visibility: 'discoverable' };
    expect(
      canSeeLiveLocation({
        event,
        attendee: { userId: 'other', visibleToStrangers: true },
        viewer: { userId: 'stranger', circleIds: [] },
        connectedUserIds: [],
      }),
    ).toBe(false);
  });
});

describe('isCheckin', () => {
  it('treats a null start time as a spur-of-moment check-in', () => {
    expect(isCheckin({ startsAt: null })).toBe(true);
  });

  it('treats an explicit is_checkin flag as a check-in', () => {
    expect(isCheckin({ isCheckin: true, startsAt: '2026-06-05T18:00:00Z' })).toBe(true);
  });

  it('treats a planned event with a start time as not a check-in', () => {
    expect(isCheckin({ isCheckin: false, startsAt: '2026-06-05T18:00:00Z' })).toBe(false);
    expect(isCheckin({ startsAt: '2026-06-05T18:00:00Z' })).toBe(false);
  });
});
