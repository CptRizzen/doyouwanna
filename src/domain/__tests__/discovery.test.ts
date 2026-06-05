import {
  CONNECTION_TRANSITIONS,
  blurPoint,
  canRequestConnection,
  canTransitionConnection,
} from '../discovery';
import { ConnectionStatus } from '../types';

const ALL: ConnectionStatus[] = ['pending', 'connected', 'blocked'];

describe('canRequestConnection', () => {
  it('allows a request to a discoverable user with no existing relationship', () => {
    expect(
      canRequestConnection({
        fromUserId: 'a',
        toUserId: 'b',
        existingStatus: null,
        toDiscoveryMode: 'open',
      }),
    ).toBe(true);
    expect(
      canRequestConnection({
        fromUserId: 'a',
        toUserId: 'b',
        existingStatus: null,
        toDiscoveryMode: 'activity_match',
      }),
    ).toBe(true);
  });

  it('rejects self-connection', () => {
    expect(
      canRequestConnection({
        fromUserId: 'a',
        toUserId: 'a',
        existingStatus: null,
        toDiscoveryMode: 'open',
      }),
    ).toBe(false);
  });

  it('rejects when the target has discovery off', () => {
    expect(
      canRequestConnection({
        fromUserId: 'a',
        toUserId: 'b',
        existingStatus: null,
        toDiscoveryMode: 'off',
      }),
    ).toBe(false);
  });

  it('rejects when a relationship already exists', () => {
    for (const status of ALL) {
      expect(
        canRequestConnection({
          fromUserId: 'a',
          toUserId: 'b',
          existingStatus: status,
          toDiscoveryMode: 'open',
        }),
      ).toBe(false);
    }
  });
});

describe('canTransitionConnection', () => {
  it('never allows a no-op transition', () => {
    for (const s of ALL) {
      expect(canTransitionConnection(s, s)).toBe(false);
    }
  });

  it('allows exactly the declared transitions', () => {
    for (const from of ALL) {
      for (const to of ALL) {
        if (from === to) continue;
        expect(canTransitionConnection(from, to)).toBe(
          CONNECTION_TRANSITIONS[from].includes(to),
        );
      }
    }
  });

  it('treats blocked as terminal', () => {
    expect(canTransitionConnection('blocked', 'connected')).toBe(false);
    expect(canTransitionConnection('blocked', 'pending')).toBe(false);
  });
});

describe('blurPoint', () => {
  it('snaps a precise point to the default ~1km grid', () => {
    expect(blurPoint({ latitude: 37.77493, longitude: -122.41942 })).toEqual({
      latitude: 37.77,
      longitude: -122.42,
    });
  });

  it('honours a custom grid size', () => {
    expect(blurPoint({ latitude: 37.77493, longitude: -122.41942 }, 0.1)).toEqual({
      latitude: 37.8,
      longitude: -122.4,
    });
  });

  it('does not produce negative zero at the origin', () => {
    const result = blurPoint({ latitude: 0.0001, longitude: -0.0001 });
    expect(Object.is(result.latitude, -0)).toBe(false);
    expect(Object.is(result.longitude, -0)).toBe(false);
    expect(result).toEqual({ latitude: 0, longitude: 0 });
  });
});
