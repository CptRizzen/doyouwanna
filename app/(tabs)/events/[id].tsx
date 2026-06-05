import { useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEventAttendees, useMyRsvp, useSetRsvp } from '@/api/attendees';
import { useEvent } from '@/api/events';
import { Card, ErrorText, Muted, Title } from '@/components/ui';
import { RSVP_TRANSITIONS } from '@/domain/rsvp';
import { RsvpStatus } from '@/domain/types';
import { isCheckin } from '@/domain/events';
import { colors, radius, spacing } from '@/constants/theme';
import { formatEventTime } from '@/lib/format';

const RSVP_LABELS: Record<RsvpStatus, string> = {
  invited: 'Invited',
  going: 'Going',
  maybe: 'Maybe',
  not_going: 'Not going',
  on_my_way: 'On my way',
  arrived: 'Arrived',
};

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id ?? '';
  const { data: event } = useEvent(eventId);
  const { data: myRsvp } = useMyRsvp(eventId);
  const { data: attendees } = useEventAttendees(eventId);
  const setRsvp = useSetRsvp(eventId);

  // No attendee row yet behaves like 'invited' for transition purposes.
  const current: RsvpStatus = myRsvp?.rsvp_status ?? 'invited';
  const options = RSVP_TRANSITIONS[current];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={attendees ?? []}
        keyExtractor={(a) => a.id}
        ListHeaderComponent={
          <View>
            <Title>{event?.title ?? 'Event'}</Title>
            <Muted>
              {event && isCheckin({ isCheckin: event.is_checkin, startsAt: event.starts_at })
                ? 'Check-in now'
                : formatEventTime(event?.starts_at ?? null)}
            </Muted>

            <Text style={styles.sectionLabel}>Your RSVP</Text>
            <View style={styles.rsvpCurrent}>
              <Text style={styles.rsvpCurrentText}>{RSVP_LABELS[current]}</Text>
            </View>

            <View style={styles.rsvpRow}>
              {options.map((next) => (
                <Pressable
                  key={next}
                  onPress={() => setRsvp.mutate(next)}
                  disabled={setRsvp.isPending}
                  style={styles.rsvpButton}
                  testID={`rsvp-${next}`}
                >
                  <Text style={styles.rsvpButtonText}>{RSVP_LABELS[next]}</Text>
                </Pressable>
              ))}
            </View>
            <ErrorText
              message={setRsvp.error instanceof Error ? setRsvp.error.message : null}
            />

            <Text style={styles.sectionLabel}>Attendees</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.attendeeName}>
              {item.profile?.display_name ?? item.profile?.username ?? 'Someone'}
            </Text>
            <Muted>{RSVP_LABELS[item.rsvp_status]}</Muted>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  rsvpCurrent: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  rsvpCurrentText: { color: colors.primaryDark, fontWeight: '700' },
  rsvpRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  rsvpButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rsvpButtonText: { color: colors.primary, fontWeight: '600' },
  attendeeName: { fontSize: 16, fontWeight: '600', color: colors.text },
});
