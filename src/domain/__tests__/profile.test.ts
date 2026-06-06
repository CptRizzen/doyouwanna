import { getInitials, formatInterestsList, displayLocation } from '../profile';

describe('getInitials', () => {
  it('returns two initials from full name', () => {
    expect(getInitials('Alex Rivera', 'alex')).toBe('AR');
  });

  it('uses username when displayName is null', () => {
    expect(getInitials(null, 'maya')).toBe('MA');
  });

  it('uses first and last word of multi-word name', () => {
    expect(getInitials('Mary Jane Watson', 'mj')).toBe('MW');
  });

  it('returns first two chars for single-word name', () => {
    expect(getInitials('Madonna', 'madonna')).toBe('MA');
  });

  it('upcases result', () => {
    expect(getInitials('bob smith', 'bsmith')).toBe('BS');
  });
});

describe('formatInterestsList', () => {
  it('joins with comma-space', () => {
    expect(formatInterestsList(['Hiking', 'Trivia', 'Running'])).toBe('Hiking, Trivia, Running');
  });

  it('returns empty string for empty array', () => {
    expect(formatInterestsList([])).toBe('');
  });

  it('returns single item without trailing comma', () => {
    expect(formatInterestsList(['Brunch'])).toBe('Brunch');
  });
});

describe('displayLocation', () => {
  it('returns location label when present', () => {
    expect(displayLocation('Mission District, SF')).toBe('Mission District, SF');
  });

  it('returns empty string for null', () => {
    expect(displayLocation(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(displayLocation(undefined)).toBe('');
  });
});
