import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation } from 'lucide-react-native';
import { useState } from 'react';
import { useEvents } from '@/api/events';
import { useEventAttendeeLocations, useLocationSharing } from '@/api/location';
import { AvatarStack, type AvatarItem } from '@/components/AvatarStack';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import EventMap from '@/components/EventMap';

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

const PLACEHOLDER_AVATARS: AvatarItem[] = [
  { uri: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Maya' },
  { uri: 'https://randomuser.me/api/portraits/men/32.jpg',   name: 'Theo' },
  { uri: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Ana' },
  { uri: 'https://randomuser.me/api/portraits/men/15.jpg',   name: 'Sam' },
];

type ViewMode = 'map' | 'list';

export default function NearbyScreen() {
  const { data: events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const eventId = selectedEventId ?? events?.[0]?.id ?? '';
  const selectedEvent = events?.find((e) => e.id === eventId);

  const { data: attendees = [] } = useEventAttendeeLocations(eventId);
  const { sharing, toggle } = useLocationSharing(eventId);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* ── Map/List toggle ─────────────────── */}
      <View style={styles.topBar}>
        <Pressable onPress={() => setViewMode('map')}>
          <View style={[styles.segBtn, viewMode === 'map' && styles.segBtnActive]}>
            <Text style={[styles.segText, viewMode === 'map' && styles.segTextActive]}>Map</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setViewMode('list')}>
          <View style={[styles.segBtn, viewMode === 'list' && styles.segBtnActive]}>
            <Text style={[styles.segText, viewMode === 'list' && styles.segTextActive]}>List</Text>
          </View>
        </Pressable>
      </View>

      {/* ── Map ─────────────────────────────── */}
      <View style={styles.mapContainer}>
        {eventId ? (
          <EventMap attendees={attendees} />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No events nearby</Text>
          </View>
        )}
      </View>

      {/* ── Event bottom card ────────────────── */}
      {selectedEvent && (
        <View style={styles.eventCard}>
          <View style={styles.eventCardInner}>
            {/* Thumbnail */}
            <View style={styles.thumb}>
              {selectedEvent.photo_url ? null : (
                <View style={[styles.thumbPlaceholder, { backgroundColor: colors.primarySoft }]}>
                  <Text style={styles.thumbEmoji}>⛰️</Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>{selectedEvent.title}</Text>
              <View style={styles.eventMetaRow}>
                <View style={styles.enRouteBadge}>
                  <View style={styles.enRouteDot} />
                  <Text style={styles.enRouteText}>Maya en route</Text>
                </View>
                <Text style={styles.etaText}>· 8 min away</Text>
              </View>
              <View style={styles.goingRow}>
                <AvatarStack avatars={PLACEHOLDER_AVATARS} size={24} max={4} />
                <Text style={styles.goingText}>on the way</Text>
              </View>
            </View>

            {/* Join button */}
            <Pressable
              style={styles.joinBtn}
              onPress={() => setSelectedEventId(eventId)}
            >
              <Navigation color="#fff" size={16} strokeWidth={2.2} />
              <Text style={styles.joinBtnText}>Join</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Fallback: first event card when nothing selected */}
      {!selectedEvent && events && events.length > 0 && (
        <View style={styles.eventCard}>
          <View style={styles.eventCardInner}>
            <View style={styles.thumb}>
              <View style={[styles.thumbPlaceholder, { backgroundColor: colors.primarySoft }]}>
                <Text style={styles.thumbEmoji}>📍</Text>
              </View>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>{events[0].title}</Text>
              <View style={styles.goingRow}>
                <AvatarStack avatars={PLACEHOLDER_AVATARS} size={24} max={4} />
                <Text style={styles.goingText}>on the way</Text>
              </View>
            </View>
            <Pressable
              style={styles.joinBtn}
              onPress={() => setSelectedEventId(events[0].id)}
            >
              <Navigation color="#fff" size={16} strokeWidth={2.2} />
              <Text style={styles.joinBtnText}>Join</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Toggle
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 16,
    left: '50%',
    transform: [{ translateX: -72 }],
    zIndex: 10,
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.pill,
    padding: 3,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  segBtnActive: {
    backgroundColor: colors.surfaceCard,
    ...shadows.sm,
  },
  segText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
  },
  segTextActive: {
    color: colors.text,
  },

  // Map
  mapContainer: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
  },

  // Event card
  eventCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
    overflow: 'hidden',
  },
  eventCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 24 },
  eventInfo: { flex: 1, gap: 3 },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.sans),
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enRouteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  enRouteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  enRouteText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
    fontFamily: ff(fonts.sans),
  },
  etaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
  },
  goingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  goingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
  },

  // Join
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    ...shadows.primary,
    flexShrink: 0,
  },
  joinBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    fontFamily: ff(fonts.sans),
  },
});
