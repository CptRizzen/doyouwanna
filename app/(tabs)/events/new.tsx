import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useCircles } from '@/api/circles';
import { useCreateEvent } from '@/api/events';
import { Button, ErrorText, Field, Muted } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { parseTags } from '@/lib/tags';

export default function NewEvent() {
  const router = useRouter();
  const { data: circles } = useCircles();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCircles, setSelectedCircles] = useState<string[]>([]);
  const [discoverable, setDiscoverable] = useState(false);
  const [isCheckinNow, setIsCheckinNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCircle = (id: string) =>
    setSelectedCircles((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const onSubmit = async () => {
    setError(null);
    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        activity_tags: parseTags(tags),
        visibility: discoverable ? 'discoverable' : 'circles_only',
        circleIds: selectedCircles,
        is_checkin: isCheckinNow,
        starts_at: isCheckinNow ? null : new Date(Date.now() + 86_400_000).toISOString(),
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create event');
    }
  };

  const canSubmit =
    title.trim().length > 0 && (discoverable || selectedCircles.length > 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="Saturday Trail Run" />
      <Field
        label="Activity tags (comma separated)"
        value={tags}
        onChangeText={setTags}
        placeholder="hiking, running"
        autoCapitalize="none"
      />

      <Text style={styles.sectionLabel}>Broadcast to circles</Text>
      {(circles ?? []).length === 0 ? (
        <Muted>You have no circles yet — create one first, or make this discoverable.</Muted>
      ) : (
        (circles ?? []).map((c) => {
          const selected = selectedCircles.includes(c.id);
          return (
            <Pressable
              key={c.id}
              onPress={() => toggleCircle(c.id)}
              style={[styles.chip, selected && styles.chipSelected]}
              testID={`circle-chip-${c.id}`}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {selected ? '✓ ' : ''}
                {c.name}
              </Text>
            </Pressable>
          );
        })
      )}

      <View style={styles.switchRow}>
        <View style={styles.switchLabel}>
          <Text style={styles.switchTitle}>Discoverable</Text>
          <Muted>Let people outside your circles find this event</Muted>
        </View>
        <Switch value={discoverable} onValueChange={setDiscoverable} testID="discoverable-switch" />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchLabel}>
          <Text style={styles.switchTitle}>Check in now</Text>
          <Muted>Spur-of-moment, no set time</Muted>
        </View>
        <Switch value={isCheckinNow} onValueChange={setIsCheckinNow} testID="checkin-switch" />
      </View>

      <ErrorText message={error} />
      <Button
        title="Create event"
        onPress={onSubmit}
        loading={createEvent.isPending}
        disabled={!canSubmit}
        testID="create-event-submit"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xs },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  chipText: { color: colors.text, fontSize: 15 },
  chipTextSelected: { color: colors.primaryDark, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  switchLabel: { flex: 1, paddingRight: spacing.md },
  switchTitle: { fontSize: 16, fontWeight: '500', color: colors.text },
});
