import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import {
  ArrowLeft,
  ChevronRight,
  Lock,
  Map,
  MoreHorizontal,
  Radio,
  UserPlus,
} from 'lucide-react-native';
import { useCircle, useCircleMembers } from '@/api/circles';
import { useCreateInvite } from '@/api/invites';
import { useEventsWithRsvp } from '@/api/events';
import { AvatarStack, type AvatarItem } from '@/components/AvatarStack';
import { LiveBadge } from '@/components/LiveBadge';
import { Button, ErrorText, Field, Muted } from '@/components/ui';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { formatEventTimeShort } from '@/lib/format';

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

const CIRCLE_COLORS = [
  '#7FB800', '#FFB020', '#14B8A6', '#FF5A3C',
  '#3B9EFF', '#8B5CF6', '#FF5FA2', '#C2734A',
];

const PLACEHOLDER_AVATARS: AvatarItem[] = [
  { uri: 'https://randomuser.me/api/portraits/men/45.jpg',   name: 'Alex' },
  { uri: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Maya' },
  { uri: 'https://randomuser.me/api/portraits/men/32.jpg',   name: 'Theo' },
  { uri: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Ana' },
  { uri: 'https://randomuser.me/api/portraits/men/15.jpg',   name: 'Sam' },
  { uri: 'https://randomuser.me/api/portraits/women/21.jpg', name: 'Joy' },
];

export default function CircleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const circleId = id ?? '';
  const { data: circle } = useCircle(circleId);
  const { data: members } = useCircleMembers(circleId);
  const { data: events } = useEventsWithRsvp();
  const createInvite = useCreateInvite();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);

  const color = (circle as any)?.color ?? CIRCLE_COLORS[0];
  const icon = (circle as any)?.icon ?? '⭐';
  const memberCount = members?.length ?? 0;
  const circleEvents = events ?? [];
  const memberAvatars: AvatarItem[] = PLACEHOLDER_AVATARS.slice(0, Math.min(memberCount || 6, 8));

  const onInvite = async () => {
    setInviteError(null);
    setInviteSent(false);
    try {
      await createInvite.mutateAsync({ email: inviteEmail.trim(), circleId });
      setInviteEmail('');
      setInviteSent(true);
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : 'Could not send invite');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Colored header ─────────────────── */}
        <View style={[styles.colorHeader, { backgroundColor: color }]}>
          {/* Nav row */}
          <View style={styles.navRow}>
            <Pressable onPress={() => router.back()} style={styles.navBtn} hitSlop={8}>
              <ArrowLeft color="#fff" size={22} strokeWidth={2.5} />
            </Pressable>
            <Pressable style={styles.navBtn} hitSlop={8}>
              <MoreHorizontal color="#fff" size={22} strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Circle identity */}
          <View style={styles.circleIdentity}>
            <View style={styles.circleIconWrap}>
              <Text style={styles.circleIconEmoji}>{icon}</Text>
            </View>
            <View style={styles.circleInfo}>
              <Text style={styles.circleName}>{circle?.name ?? 'Circle'}</Text>
              <Text style={styles.circleSubtitle}>
                {circle?.activity_tags?.[0] ?? 'Circle'} · {memberCount || 8} friends
              </Text>
            </View>
          </View>

          {/* Members row */}
          <View style={styles.membersRow}>
            <AvatarStack avatars={memberAvatars} size={36} max={6} />
            <View style={{ flex: 1 }} />
            <Pressable style={styles.inviteBtn}>
              <UserPlus color={color} size={16} strokeWidth={2.5} />
              <Text style={[styles.inviteBtnText, { color }]}>Invite</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Body ───────────────────────────── */}
        <View style={styles.body}>
          {/* Live tracking banner */}
          <View style={styles.liveBanner}>
            <View style={styles.liveBannerAvatar}>
              <View style={[styles.liveAvatarInner, { backgroundColor: colors.surfaceSunken }]}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
              <View style={styles.liveAvatarDot} />
            </View>
            <View style={styles.liveBannerText}>
              <Text style={styles.liveBannerTitle}>
                <Text style={{ fontWeight: '700' }}>Maya</Text> is on the way
              </Text>
              <Text style={styles.liveBannerSub}>
                Sharing live · to{' '}
                {circleEvents[0]?.title ?? 'the meetup'}
              </Text>
            </View>
            <Pressable>
              <View style={styles.mapBtn}>
                <Map color={colors.primary} size={14} strokeWidth={2} />
                <Text style={styles.mapBtnText}>Map</Text>
              </View>
            </Pressable>
          </View>

          {/* Upcoming plans */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Upcoming plans</Text>
              <Pressable>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            {circleEvents.slice(0, 1).map((event) => (
              <Link
                key={event.id}
                href={{ pathname: '/(tabs)/events/[id]', params: { id: event.id } }}
                asChild
              >
                <Pressable>
                  <View style={styles.eventCard}>
                    {event.photo_url ? (
                      <ImageBackground
                        source={{ uri: event.photo_url }}
                        style={styles.eventCardImg}
                        imageStyle={{ borderRadius: radius.xl }}
                      >
                        <LinearGradient
                          colors={['transparent', 'rgba(23,20,15,0.78)']}
                          style={styles.eventCardGrad}
                        >
                          <View style={styles.eventCardTopRow}>
                            <View style={styles.circleChip}>
                              <View style={[styles.chipDot, { backgroundColor: colors.success }]} />
                              <Text style={styles.chipText}>{circle?.name ?? 'Circle'}</Text>
                            </View>
                            {event.is_checkin && <LiveBadge />}
                          </View>
                          <View style={styles.eventCardBottom}>
                            <Text style={styles.eventTimeStr}>
                              {formatEventTimeShort(event.starts_at).toUpperCase()}
                            </Text>
                            <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                            <View style={styles.eventMeta}>
                              <AvatarStack avatars={PLACEHOLDER_AVATARS.slice(0, 4)} size={26} max={4} />
                              <Text style={styles.eventGoing}>6 going</Text>
                              <View style={{ flex: 1 }} />
                              <Text style={styles.eventDist}>2.4 km</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </ImageBackground>
                    ) : (
                      <LinearGradient
                        colors={[color + 'CC', color + '88']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.eventCardImg}
                      >
                        <LinearGradient
                          colors={['transparent', 'rgba(23,20,15,0.55)']}
                          style={styles.eventCardGrad}
                        >
                          <View style={styles.eventCardTopRow}>
                            <View style={styles.circleChip}>
                              <View style={[styles.chipDot, { backgroundColor: color }]} />
                              <Text style={styles.chipText}>{circle?.name ?? 'Circle'}</Text>
                            </View>
                          </View>
                          <View style={styles.eventCardBottom}>
                            <Text style={styles.eventTimeStr}>
                              {formatEventTimeShort(event.starts_at).toUpperCase()}
                            </Text>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <View style={styles.eventMeta}>
                              <AvatarStack avatars={PLACEHOLDER_AVATARS.slice(0, 4)} size={26} max={4} />
                              <Text style={styles.eventGoing}>6 going</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </LinearGradient>
                    )}
                  </View>
                </Pressable>
              </Link>
            ))}

            {circleEvents.length === 0 && (
              <Muted>No upcoming plans for this circle.</Muted>
            )}
          </View>

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Lock color={colors.success} size={15} strokeWidth={2} />
            <Text style={styles.privacyText}>
              Only <Text style={{ fontWeight: '700' }}>{circle?.name ?? 'this circle'}</Text> can see
              these plans and anyone sharing live here.
            </Text>
          </View>

          {/* Invite by email */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Invite someone</Text>
            <Field
              label="Email address"
              value={inviteEmail}
              onChangeText={(v) => { setInviteEmail(v); setInviteSent(false); }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="friend@example.com"
            />
            <ErrorText message={inviteError} />
            {inviteSent && <Muted>Invite sent!</Muted>}
            <Button
              title="Send invite"
              onPress={onInvite}
              loading={createInvite.isPending}
              disabled={!inviteEmail.trim()}
              variant="secondary"
              testID="send-invite-button"
            />
          </View>
        </View>
      </ScrollView>

      {/* ── Broadcast CTA ──────────────────── */}
      <View style={styles.footer}>
        <Pressable
          style={styles.broadcastBtn}
          onPress={() => router.push('/new-plan')}
        >
          <Radio color="#fff" size={18} strokeWidth={2.2} />
          <Text style={styles.broadcastBtnText}>Broadcast a plan</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Colored header
  colorHeader: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md + 4,
    paddingBottom: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  circleIconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIconEmoji: { fontSize: 30 },
  circleInfo: { flex: 1 },
  circleName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? fonts.display : undefined,
    lineHeight: 30,
  },
  circleSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    marginTop: 2,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  inviteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },

  // Body
  body: { padding: spacing.md, gap: spacing.md },

  // Live banner
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#D6F5E6',
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  liveBannerAvatar: {
    position: 'relative',
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  liveAvatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  liveAvatarDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: '#D6F5E6',
  },
  liveBannerText: { flex: 1 },
  liveBannerTitle: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },
  liveBannerSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    marginTop: 1,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },

  // Section
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: Platform.OS === 'web' ? fonts.display : undefined,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },

  // Event card
  eventCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  eventCardImg: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  eventCardGrad: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  eventCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  circleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },
  eventCardBottom: { gap: 3 },
  eventTimeStr: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.7,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? fonts.display : undefined,
    lineHeight: 26,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  eventGoing: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },
  eventDist: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },

  // Privacy note
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  privacyText: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },

  // Footer CTA
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  broadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    ...shadows.primary,
  },
  broadcastBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
  },
});
