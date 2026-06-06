import { parseGeoPoint, distanceKm, locationAge } from '../location';

describe('parseGeoPoint', () => {
  it('parses a GeoJSON Point string', () => {
    const result = parseGeoPoint('{"type":"Point","coordinates":[-122.4194,37.7749]}');
    expect(result).toEqual({ latitude: 37.7749, longitude: -122.4194 });
  });

  it('returns null for null input', () => {
    expect(parseGeoPoint(null)).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(parseGeoPoint('not-json')).toBeNull();
  });

  it('returns null for wrong GeoJSON type', () => {
    expect(parseGeoPoint('{"type":"LineString","coordinates":[]}')).toBeNull();
  });
});

describe('distanceKm', () => {
  it('returns 0 for same point', () => {
    const p = { latitude: 51.5, longitude: -0.1 };
    expect(distanceKm(p, p)).toBeCloseTo(0, 5);
  });

  it('calculates known distance (London → Paris ≈ 340 km)', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    expect(distanceKm(london, paris)).toBeCloseTo(340, -1);
  });
});

describe('locationAge', () => {
  it('returns "no location" for null', () => {
    expect(locationAge(null)).toBe('no location');
  });

  it('returns "just now" for recent timestamp', () => {
    expect(locationAge(new Date(Date.now() - 5000).toISOString())).toBe('just now');
  });

  it('returns minutes for older timestamps', () => {
    expect(locationAge(new Date(Date.now() - 150000).toISOString())).toBe('2m ago');
  });
});
