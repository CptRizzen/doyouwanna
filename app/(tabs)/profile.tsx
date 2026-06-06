import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, MapPin, ChevronRight } from 'lucide-react-native';
import { useMyProfile } from '@/api/profiles';
import { getInitials, displayLocation } from '@/domain/profile';
import { Button, ErrorText } from '@/components/ui';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

// Interest icons mapping
const INTEREST_ICONS: Record<string, string> = {
  Hiking: '⛰️',
  Trivia: '🍺',
  Running: '👣',
  Brunch: '☕',
  Climbing: '🧗',
  Cycling: '🚴',
  Swimming: '🏊',
  Travel: '✈️',
};

interface SpotProps {
  icon: string;
  color: string;
  name: string;
  subtitle: string;
}

function FavoriteSpot({ icon, color, name, subtitle }: SpotProps) {
  return (
    <Pressable>
      <View style={styles.spotRow}>
        <View style={[styles.spotIcon, { backgroundColor: color + '22' }]}>
          <Text style={styles.spotEmoji}>{icon}</Text>
        </View>
        <View style={styles.spotInfo}>
          <Text style={styles.spotName}>{name}</Text>
          <Text style={styles.spotSub}>{subtitle}</Text>
        </View>
        <ChevronRight color={colors.textSubtle} size={18} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, error } = useMyProfile();

  const name = profile?.display_name ?? profile?.username ?? 'You';
  const initials = profile ? getInitials(profile.display_name, profile.username) : '??';
  const location = displayLocation((profile as any)?.location_label);
  const interests: string[] = (profile as any)?.interests ?? profile?.activity_tags ?? [];
  const bio: string | null = (profile as any)?.bio ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ───────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.heading}>You</Text>
          <Pressable style={styles.iconBtn} hitSlop={8}>
            <Settings color={colors.text} size={20} strokeWidth={2} />
          </Pressable>
        </View>

        {/* ── Avatar + name ─────────────────── */}
        <View style={styles.profileTop}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.name}>{name}</Text>
          {location ? (
            <View style={styles.locationRow}>
              <MapPin color={colors.textMuted} size={13} strokeWidth={2} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          ) : null}
          {bio ? <Text style={styles.bio}>{bio}</Text> : null}
        </View>

        {/* ── Into ──────────────────────────── */}
        {interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Into</Text>
            <View style={styles.chips}>
              {interests.map((interest) => (
                <View key={interest} style={styles.chip}>
                  {INTEREST_ICONS[interest] && (
                    <Text style={styles.chipIcon}>{INTEREST_ICONS[interest]}</Text>
                  )}
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Favorite spots ────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Favorite spots</Text>
          <View style={styles.spotsCard}>
            <FavoriteSpot icon="⛰️" color="#7FB800" name="Eagle Peak Trail" subtitle="Hiked 12 times" />
            <View style={styles.spotDivider} />
            <FavoriteSpot icon="🍺" color="#FFB020" name="The Anchor Pub" subtitle="Trivia HQ" />
            <View style={styles.spotDivider} />
            <FavoriteSpot icon="☕" color="#14B8A6" name="Rosa's Kitchen" subtitle="Sunday brunch" />
          </View>
        </View>

        {/* ── Sign out ──────────────────────── */}
        <View style={styles.section}>
          <Button title="Sign out" onPress={signOut} variant="danger" testID="sign-out-button" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.display),
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  // Profile top section
  profileTop: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.primary,
    padding: 3,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  avatarCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: ff(fonts.display),
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.display),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
  },
  bio: {
    fontSize: 14,
    color: colors.textBody,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    fontFamily: ff(fonts.sans),
  },

  // Sections
  section: { marginTop: spacing.lg, gap: spacing.sm },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.display),
  },

  // Interest chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  chipIcon: { fontSize: 14 },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textBody,
    fontFamily: ff(fonts.sans),
  },

  // Favorite spots
  spotsCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  spotIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  spotEmoji: { fontSize: 22 },
  spotInfo: { flex: 1 },
  spotName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: ff(fonts.sans),
  },
  spotSub: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
  },
  spotDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 44 + spacing.md,
  },
});
