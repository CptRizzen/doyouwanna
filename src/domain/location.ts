export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** Parse a PostgREST GeoJSON string → {latitude, longitude}. */
export function parseGeoPoint(raw: string | null | undefined): GeoPoint | null {
  if (!raw) return null;
  try {
    const geo = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
      const [lng, lat] = geo.coordinates as [number, number];
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch {
    return null;
  }
}

/** Haversine distance in km. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Human-readable staleness label. */
export function locationAge(updatedAt: string | null | undefined): string {
  if (!updatedAt) return 'no location';
  const secs = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}
