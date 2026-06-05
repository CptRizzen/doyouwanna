import { Link, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '@/api/events';
import { Button, Card, ErrorText, Muted } from '@/components/ui';
import { isCheckin } from '@/domain/events';
import { colors, spacing } from '@/constants/theme';
import { formatEventTime } from '@/lib/format';

export default function EventsList() {
  const router = useRouter();
  const { data: events, isLoading, error } = useEvents();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        contentContainerStyle={styles.list}
        data={events ?? []}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={
          <Button
            title="+ New event"
            onPress={() => router.push('/(tabs)/events/new')}
            testID="new-event-button"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <ErrorText message={error instanceof Error ? error.message : null} />
              <Muted>No events visible yet. Create one or join a circle.</Muted>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/(tabs)/events/[id]', params: { id: item.id } }} asChild>
            <Pressable>
              <Card>
                <View style={styles.row}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.visibility === 'discoverable' && (
                    <Text style={styles.badge}>Discoverable</Text>
                  )}
                </View>
                <Muted>
                  {isCheckin({ isCheckin: item.is_checkin, startsAt: item.starts_at })
                    ? 'Check-in now'
                    : formatEventTime(item.starts_at)}
                </Muted>
              </Card>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, flexShrink: 1 },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  empty: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
});
