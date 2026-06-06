import { useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, ImageIcon, Send, Sparkles, X } from 'lucide-react-native';
import { useCircles } from '@/api/circles';
import { useCreateEvent } from '@/api/events';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';

const CIRCLE_COLORS = [
  '#FF5A3C', '#FFB020', '#7FB800', '#14B8A6',
  '#3B9EFF', '#8B5CF6', '#FF5FA2', '#C2734A',
];

const WHEN_OPTIONS = [
  { key: 'now', label: 'Right now' },
  { key: 'tonight', label: 'Tonight' },
  { key: 'weekend', label: 'This weekend' },
  { key: 'pick', label: 'Pick a time' },
];

function resolveStartsAt(when: string): string | null {
  const now = new Date();
  switch (when) {
    case 'tonight': {
      const t = new Date(now);
      t.setHours(20, 0, 0, 0);
      return t.toISOString();
    }
    case 'weekend': {
      const t = new Date(now);
      const daysToSat = ((6 - t.getDay()) + 7) % 7 || 7;
      t.setDate(t.getDate() + daysToSat);
      t.setHours(12, 0, 0, 0);
      return t.toISOString();
    }
    default:
      return null;
  }
}

export default function NewPlanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: circles = [] } = useCircles();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState('');
  const [selectedCircles, setSelectedCircles] = useState<string[]>([]);
  const [when, setWhen] = useState<string>('tonight');
  const [customTime, setCustomTime] = useState('');
  const [openToDiscovery, setOpenToDiscovery] = useState(false);
  const [photo, setPhoto] = useState<{ uri: string; type: string } | null>(null);

  const toggleCircle = (id: string) =>
    setSelectedCircles((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto({
        uri: result.assets[0].uri,
        type: result.assets[0].mimeType ?? 'image/jpeg',
      });
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo || !user) return null;
    try {
      const ext = photo.type.split('/')[1] ?? 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      const { error } = await supabase.storage
        .from('event-photos')
        .upload(path, blob, { contentType: photo.type, upsert: false });
      if (error) return null;
      return supabase.storage.from('event-photos').getPublicUrl(path).data.publicUrl;
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    if (!title.trim() || selectedCircles.length === 0) return;
    const photo_url = await uploadPhoto();
    const startsAt = when === 'pick' ? customTime || null : resolveStartsAt(when);
    await createEvent.mutateAsync({
      title: title.trim(),
      visibility: openToDiscovery ? 'discoverable' : 'circles_only',
      is_checkin: when === 'now',
      starts_at: startsAt,
      circleIds: selectedCircles,
      photo_url,
    });
    router.back();
  };

  const n = selectedCircles.length;
  const canSend = title.trim().length > 0 && n > 0 && !createEvent.isPending;
  const btnLabel =
    n === 0
      ? 'Select circles to send'
      : `Send to ${n} circle${n === 1 ? '' : 's'}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>New plan</Text>
          <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={8}>
            <X color={colors.textMuted} size={20} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── What's the plan? ─────────────────── */}
          <View style={styles.inputRow}>
            <Sparkles color={colors.textSubtle} size={18} strokeWidth={1.5} />
            <TextInput
              style={styles.titleInput}
              placeholder="What's the plan?"
              placeholderTextColor={colors.textSubtle}
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="done"
            />
          </View>

          {/* ── Photo ────────────────────────────── */}
          {photo ? (
            <Pressable onPress={pickPhoto} style={styles.photoPreview}>
              <Image source={{ uri: photo.uri }} style={styles.photoImg} resizeMode="cover" />
              <View style={styles.photoEditBadge}>
                <Camera color="#fff" size={13} />
                <Text style={styles.photoEditText}>Change</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable onPress={pickPhoto} style={styles.photoBtn}>
              <ImageIcon color={colors.textMuted} size={17} />
              <Text style={styles.photoBtnText}>Add a photo</Text>
            </Pressable>
          )}

          {/* ── Send to ──────────────────────────── */}
          <View>
            <Text style={styles.label}>Send to</Text>
            <View style={styles.chips}>
              {circles.map((circle, i) => {
                const color = CIRCLE_COLORS[i % CIRCLE_COLORS.length];
                const active = selectedCircles.includes(circle.id);
                return (
                  <Pressable
                    key={circle.id}
                    onPress={() => toggleCircle(circle.id)}
                    style={[
                      styles.chip,
                      active && { backgroundColor: color, borderColor: color },
                    ]}
                  >
                    {!active && <View style={[styles.chipDot, { backgroundColor: color }]} />}
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {circle.name}
                    </Text>
                  </Pressable>
                );
              })}
              {circles.length === 0 && (
                <Text style={styles.emptyHint}>No circles yet — create one first</Text>
              )}
            </View>
          </View>

          {/* ── When ─────────────────────────────── */}
          <View>
            <Text style={styles.label}>When</Text>
            <View style={styles.chips}>
              {WHEN_OPTIONS.map((opt) => {
                const active = when === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setWhen(opt.key)}
                    style={[styles.chip, active && styles.chipWhen]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextWhen]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {when === 'pick' && (
              <TextInput
                style={styles.timeInput}
                placeholder="e.g. Saturday 7pm"
                placeholderTextColor={colors.textSubtle}
                value={customTime}
                onChangeText={setCustomTime}
              />
            )}
          </View>

          {/* ── Open to discovery ────────────────── */}
          <View style={styles.discoveryRow}>
            <View style={styles.discoveryInfo}>
              <Text style={styles.discoveryTitle}>Open to discovery</Text>
              <Text style={styles.discoverySubtitle}>Let nearby people ask to join</Text>
            </View>
            <Switch
              value={openToDiscovery}
              onValueChange={setOpenToDiscovery}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={openToDiscovery ? colors.primary : colors.textSubtle}
              ios_backgroundColor={colors.border}
            />
          </View>
        </ScrollView>

        {/* ── CTA ──────────────────────────────── */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={[styles.sendBtn, !canSend && styles.sendBtnOff]}
          >
            <Send color="#fff" size={17} strokeWidth={2.2} />
            <Text style={styles.sendBtnText}>{btnLabel}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.display),
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontFamily: ff(fonts.sans),
  },

  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceCard,
  },
  photoBtnText: { fontSize: 14, color: colors.textMuted, fontFamily: ff(fonts.sans) },
  photoPreview: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    aspectRatio: 4 / 3,
    backgroundColor: colors.surfaceSunken,
  },
  photoImg: { width: '100%', height: '100%' },
  photoEditBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  photoEditText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: spacing.sm,
    fontFamily: ff(fonts.sans),
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  chipDot: { width: 9, height: 9, borderRadius: 5 },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.textBody, fontFamily: ff(fonts.sans) },
  chipTextActive: { color: '#fff' },
  chipWhen: { backgroundColor: colors.text, borderColor: colors.text },
  chipTextWhen: { color: '#fff' },
  emptyHint: { fontSize: 13, color: colors.textSubtle, fontStyle: 'italic' },

  timeInput: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.text,
    fontFamily: ff(fonts.mono),
  },

  discoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  discoveryInfo: { flex: 1 },
  discoveryTitle: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: ff(fonts.sans) },
  discoverySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2, fontFamily: ff(fonts.sans) },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    ...shadows.primary,
  },
  sendBtnOff: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: ff(fonts.sans),
  },
});
