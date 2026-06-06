import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { parseGeoPoint } from '@/domain/location';
import { AttendeeLocation } from '@/api/location';
import { useAuth } from '@/lib/auth';
import { colors } from '@/constants/theme';

interface Props {
  attendees: AttendeeLocation[];
}

export default function EventMap({ attendees }: Props) {
  const { user } = useAuth();

  const located = attendees
    .map((a) => ({ ...a, point: parseGeoPoint(a.live_location) }))
    .filter((a): a is typeof a & { point: NonNullable<ReturnType<typeof parseGeoPoint>> } =>
      a.point !== null,
    );

  const initialRegion =
    located.length > 0
      ? {
          latitude: located[0].point.latitude,
          longitude: located[0].point.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }
      : {
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

  return (
    <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation>
      {located.map((a) => (
        <Marker
          key={a.id}
          coordinate={a.point}
          pinColor={a.user_id === user?.id ? colors.primary : colors.accent}
          title={a.user_id === user?.id ? 'You' : undefined}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
