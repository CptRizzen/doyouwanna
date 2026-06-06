import { Link, useRouter } from 'expo-router';
import {
  FlatList,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Search, Navigation } from 'lucide-react-native';
import { useEventsWithRsvp, type EventWithRsvp } from '@/api/events';
import { AvatarStack } from '@/components/AvatarStack';
import { LiveBadge } from '@/components/LiveBadge';
import { ErrorText, Muted } from '@/components/ui';
import { isCheckin } from '@/domain/events';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { formatDayGreeting, formatEventTimeShort } from '@/lib/format';

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

const RSVP_CFG: Record<string, { label: string; bg: string; text: string }> = {
  going:   { label: "You're going", bg: colors.successSoft, text: colors.success },
  maybe:   { label: 'Maybe',        bg: colors.primaryTint, text: colors.primary },
  invited: { label: 'Invited',      bg: colors.accentStrong, text: '#fff' },
};

// Placeholder avatar data — real app would come from event_attendees join
const PLACEHOLDER_AVATARS = [
  { uri: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Maya' },
  { uri: 'https://randomuser.me/api/portraits/men/32.jpg',   name: 'Theo' },
  { uri: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Ana' },
  { uri: 'https://randomuser.me/api/portraits/men/15.jpg',   name: 'Sam' },
];

function HeroCard({ event }: { event: EventWithRsvp }) {
  const rsvp = event.my_rsvp ? RSVP_CFG[event.my_rsvp] : null;
  const timeStr = isCheckin({ isCheckin: event.is_checkin, startsAt: event.starts_at })
    ? 'LIVE NOW'
    : formatEventTimeShort(event.starts_at);
  const isLive = event.is_checkin;

  const inner = (
    <View style={styles.heroContent}>
      {/* Top badges */}
      <View style={styles.heroTopRow}>
        <View style={styles.circleChip}>
          <View style={[styles.circleChipDot, { backgroundColor: colors.success }]} />
          <Text style={styles.circleChipText} numberOfLines={1}>Hiking Crew</Text>
        </View>
        {isLive && <LiveBadge />}
      </View>

      {/* Bottom info */}
      <View style={styles.heroBottom}>
        <Text style={styles.heroTime}>{timeStr}</Text>
        <Text style={styles.heroTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.heroFooter}>
          <AvatarStack avatars={PLACEHOLDER_AVATARS} size={26} max={4} />
          <Text style={styles.heroMeta}>6 going</Text>
          <View style={{ flex: 1 }} />
          {rsvp && (
            <View style={[styles.rsvpBadge, { backgroundColor: rsvp.bg }]}>
              <Text style={[styles.rsvpText, { color: rsvp.text }]}>{rsvp.label}</Text>
            </View>
          )}
          <Text style={styles.heroDist}>2.4 km</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Link href={{ pathname: '/(tabs)/events/[id]', params: { id: event.id } }} asChild>
      <Pressable style={styles.heroCard}>
        {event.photo_url ? (
          <ImageBackground
            source={{ uri: event.photo_url }}
            style={styles.heroImg}
            imageStyle={{ borderRadius: radius.xl }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.12)', 'rgba(23,20,15,0.82)']}
              style={styles.heroGrad}
            >
              {inner}
            </LinearGradient>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={['#FF7855', '#C22E13']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroImg}
          >
            <LinearGradient
              colors={['transparent', 'rgba(23,20,15,0.7)']}
              style={styles.heroGrad}
            >
              {inner}
            </LinearGradient>
          </LinearGradient>
        )}
      </Pressable>
    </Link>
  );
}

function RowCard({ event }: { event: EventWithRsvp }) {
  const timeStr = isCheckin({ isCheckin: event.is_checkin, startsAt: event.starts_at })
    ? 'Now'
    : formatEventTimeShort(event.starts_at);
  const rsvp = event.my_rsvp ? RSVP_CFG[event.my_rsvp] : null;

  return (
    <Link href={{ pathname: '/(tabs)/events/[id]', params: { id: event.id } }} asChild>
      <Pressable>
        <View style={styles.rowCard}>
          {event.photo_url ? (
            <ImageBackground
              source={{ uri: event.photo_url }}
              style={styles.rowThumb}
              imageStyle={{ borderRadius: radius.md }}
            />
          ) : (
            <LinearGradient
              colors={['#FF9D80', '#ED401E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rowThumb}
            />
          )}
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle} numberOfLines={1}>{event.title}</Text>
            <Text style={styles.rowMeta}>{timeStr}</Text>
          </View>
          {rsvp ? (
            <View style={[styles.rowRsvp, { backgroundColor: rsvp.bg }]}>
              <Text style={[styles.rowRsvpText, { color: rsvp.text }]}>{rsvp.label}</Text>
            </View>
          ) : (
            <Navigation color={colors.textSubtle} size={16} strokeWidth={2} />
          )}
        </View>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const { data: events, isLoading, error } = useEventsWithRsvp();
  const greeting = formatDayGreeting();

  const hero = events?.[0] ?? null;
  const rest = events?.slice(1) ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.list}
        data={rest}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={
          <>
            {/* ── Header ─────────────────────────── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.wordmark}>DO YOU WANNA</Text>
                <Text style={styles.greeting}>{greeting}</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable style={styles.iconBtn} hitSlop={8}>
                  <Search color={colors.text} size={20} strokeWidth={2} />
                </Pressable>
                <Pressable style={styles.iconBtn} hitSlop={8}>
                  <Bell color={colors.text} size={20} strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {/* ── Next up ────────────────────────── */}
            {hero && (
              <>
                <Text style={styles.sectionLabel}>Next up</Text>
                <HeroCard event={hero} />
              </>
            )}

            {/* ── From your circles ──────────────── */}
            {rest.length > 0 && (
              <Text style={styles.sectionLabel}>From your circles</Text>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading && !hero ? (
            <View style={styles.empty}>
              <ErrorText message={error instanceof Error ? error.message : null} />
              <Muted>No plans yet. Tap + to create one.</Muted>
            </View>
          ) : null
        }
        renderItem={({ item }) => <RowCard event={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  wordmark: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
    fontFamily: ff(fonts.display),
  },
  greeting: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    letterSpacing: 0.9,
    marginTop: 2,
    fontFamily: ff(fonts.sans),
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
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

  // Section labels
  sectionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.display),
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  // Hero
  heroCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xs,
    ...shadows.md,
  },
  heroImg: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  heroGrad: {
    flex: 1,
    justifyContent: 'space-between',
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  circleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  circleChipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  circleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.sans),
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroBottom: { gap: 4 },
  heroTime: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: ff(fonts.sans),
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 30,
    fontFamily: ff(fonts.display),
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  heroMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: ff(fonts.sans),
  },
  heroDist: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: ff(fonts.sans),
  },
  rsvpBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  rsvpText: { fontSize: 11, fontWeight: '800', fontFamily: ff(fonts.sans) },

  // Row card
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    ...shadows.sm,
  },
  rowThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    flexShrink: 0,
  },
  rowInfo: { flex: 1 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: ff(fonts.sans),
  },
  rowMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: ff(fonts.sans),
  },
  rowRsvp: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  rowRsvpText: { fontSize: 11, fontWeight: '700', fontFamily: ff(fonts.sans) },

  empty: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
});
