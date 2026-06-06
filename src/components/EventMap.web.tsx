import { Platform, StyleSheet, Text, View } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { parseGeoPoint, locationAge } from '@/domain/location';
import type { AttendeeLocation } from '@/api/location';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/constants/theme';

// Inject Leaflet CSS once — avoids Metro CSS-import issues
if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

// Colored dot markers — avoids broken default icon path under bundlers
function dotIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

// Re-center map when located attendees change
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng]); }, [lat, lng]);
  return null;
}

interface Props {
  attendees: AttendeeLocation[];
}

export default function EventMap({ attendees }: Props) {
  const { user } = useAuth();

  const located = attendees
    .map((a) => ({ ...a, point: parseGeoPoint(a.live_location) }))
    .filter(
      (a): a is typeof a & { point: NonNullable<ReturnType<typeof parseGeoPoint>> } =>
        a.point !== null,
    );

  const center: [number, number] =
    located.length > 0
      ? [located[0].point.latitude, located[0].point.longitude]
      : [37.7749, -122.4194];

  return (
    <View style={styles.container}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {located.length > 0 && (
          <MapRecenter
            lat={located[0].point.latitude}
            lng={located[0].point.longitude}
          />
        )}
        {located.map((a) => {
          const isMe = a.user_id === user?.id;
          return (
            <Marker
              key={a.id}
              position={[a.point.latitude, a.point.longitude]}
              icon={dotIcon(isMe ? colors.primary : colors.accent)}
            >
              <Popup>
                <span style={{ fontFamily: fonts.sans, fontSize: 13, lineHeight: '1.4' }}>
                  <strong>{isMe ? 'You' : `User …${a.user_id.slice(-6)}`}</strong>
                  <br />
                  {locationAge(a.live_location_updated_at)}
                </span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Empty-state floats over the map so tiles still render */}
      {located.length === 0 && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>No one sharing location yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,251,245,0.88)',
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },
});
