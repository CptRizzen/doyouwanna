import { Link, useRouter } from 'expo-router';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Plus, Search } from 'lucide-react-native';
import { useCircles } from '@/api/circles';
import { AvatarStack, type AvatarItem } from '@/components/AvatarStack';
import { LiveBadge } from '@/components/LiveBadge';
import { ErrorText, Muted } from '@/components/ui';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

// Default palette for circles without a color set
const CIRCLE_COLORS = [
  '#7FB800', '#FFB020', '#14B8A6', '#FF5A3C',
  '#3B9EFF', '#8B5CF6', '#FF5FA2', '#C2734A',
];

// Placeholder member avatars — real data comes from circle_members join
const PLACEHOLDER_MEMBERS: AvatarItem[] = [
  { uri: 'https://randomuser.me/api/portraits/men/45.jpg',   name: 'Alex' },
  { uri: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Maya' },
  { uri: 'https://randomuser.me/api/portraits/men/32.jpg',   name: 'Theo' },
  { uri: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Ana' },
];

interface CircleCardProps {
  name: string;
  id: string;
  icon: string;
  color: string;
  memberCount: number;
  isLive?: boolean;
  nextEventTitle?: string | null;
  nextEventTime?: string | null;
}

function CircleCard({ name, id, icon, color, memberCount, isLive, nextEventTitle, nextEventTime }: CircleCardProps) {
  return (
    <Link href={{ pathname: '/(tabs)/circles/[id]', params: { id } }} asChild>
      <Pressable>
        <View style={styles.card}>
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
            <Text style={styles.iconEmoji}>{icon}</Text>
          </View>

          {/* Main content */}
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
              {isLive && <LiveBadge />}
            </View>
            <View style={styles.cardMeta}>
              <AvatarStack avatars={PLACEHOLDER_MEMBERS} size={24} max={4} />
              <Text style={styles.cardFriends}>{memberCount} friends</Text>
            </View>
            {nextEventTitle && (
              <View style={styles.nextEvent}>
                <View style={[styles.nextDot, { backgroundColor: color }]} />
                <Text style={styles.nextText} numberOfLines={1}>
                  Next · {nextEventTitle}
                  {nextEventTime ? ` · ${nextEventTime}` : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function CirclesScreen() {
  const router = useRouter();
  const { data: circles, isLoading, error } = useCircles();

  const totalFriends = (circles ?? []).reduce((s) => s + 2, 0); // placeholder count

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.list}
        data={circles ?? []}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          <>
            {/* ── Header ─────────────────────────── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.wordmark}>DO YOU WANNA</Text>
                <Text style={styles.heading}>Your circles</Text>
                <Text style={styles.subtitle}>
                  {circles?.length ?? 0} circles · {totalFriends} friends
                </Text>
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
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <ErrorText message={error instanceof Error ? error.message : null} />
              <Muted>No circles yet. Create your first one.</Muted>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <CircleCard
            id={item.id}
            name={item.name}
            icon={(item as any).icon ?? '⭐'}
            color={(item as any).color ?? CIRCLE_COLORS[index % CIRCLE_COLORS.length]}
            memberCount={8}
            isLive={index === 0}
            nextEventTitle={null}
            nextEventTime={null}
          />
        )}
        ListFooterComponent={
          <Pressable
            onPress={() => router.push('/(tabs)/circles/new')}
            style={styles.newCircleBtn}
            testID="new-circle-button"
          >
            <Plus color={colors.primary} size={18} strokeWidth={2.5} />
            <Text style={styles.newCircleBtnText}>New circle</Text>
          </Pressable>
        }
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
    paddingBottom: spacing.md,
  },
  wordmark: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
    fontFamily: ff(fonts.display),
    marginBottom: 2,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.display),
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
    marginTop: 2,
  },
  headerActions: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
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

  // Circle card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 26 },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.sans),
    flex: 1,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardFriends: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
  },
  nextEvent: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  nextDot: { width: 6, height: 6, borderRadius: 3 },
  nextText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: ff(fonts.sans),
    flex: 1,
  },

  // New circle button
  newCircleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryTint,
  },
  newCircleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: ff(fonts.sans),
  },

  empty: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
});
