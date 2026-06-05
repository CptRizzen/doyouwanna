import { RSVP_TRANSITIONS, canTransitionRsvp, rsvpIsAttending } from '../rsvp';
import { RsvpStatus } from '../types';

const ALL: RsvpStatus[] = [
  'invited',
  'going',
  'maybe',
  'not_going',
  'on_my_way',
  'arrived',
];

describe('canTransitionRsvp', () => {
  it('never allows a no-op transition', () => {
    for (const s of ALL) {
      expect(canTransitionRsvp(s, s)).toBe(false);
    }
  });

  it('allows exactly the declared transitions and rejects all others', () => {
    for (const from of ALL) {
      for (const to of ALL) {
        if (from === to) continue;
        const expected = RSVP_TRANSITIONS[from].includes(to);
        expect(canTransitionRsvp(from, to)).toBe(expected);
      }
    }
  });

  it('models the happy path invited → going → on_my_way → arrived', () => {
    expect(canTransitionRsvp('invited', 'going')).toBe(true);
    expect(canTransitionRsvp('going', 'on_my_way')).toBe(true);
    expect(canTransitionRsvp('on_my_way', 'arrived')).toBe(true);
  });

  it('forbids skipping straight from invited to on_my_way', () => {
    expect(canTransitionRsvp('invited', 'on_my_way')).toBe(false);
  });
});

describe('rsvpIsAttending', () => {
  it('counts going / on_my_way / arrived as attending', () => {
    expect(rsvpIsAttending('going')).toBe(true);
    expect(rsvpIsAttending('on_my_way')).toBe(true);
    expect(rsvpIsAttending('arrived')).toBe(true);
  });

  it('does not count invited / maybe / not_going', () => {
    const notAttending: RsvpStatus[] = ['invited', 'maybe', 'not_going'];
    for (const s of notAttending) {
      expect(rsvpIsAttending(s)).toBe(false);
    }
  });
});
