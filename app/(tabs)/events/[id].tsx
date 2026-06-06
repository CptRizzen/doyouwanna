import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  Heart,
  MapPin,
  Navigation,
  Share2,
  Users,
} from 'lucide-react-native';
import { useEventAttendees, useMyRsvp, useSetRsvp } from '@/api/attendees';
import { useEvent } from '@/api/events';
import { AvatarStack, type AvatarItem } from '@/components/AvatarStack';
import { LiveBadge } from '@/components/LiveBadge';
import { ErrorText } from '@/components/ui';
import { RSVP_TRANSITIONS } from '@/domain/rsvp';
import { RsvpStatus } from '@/domain/types';
import { isCheckin } from '@/domain/events';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';
import { formatEventTimeShort } from '@/lib/format';

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

const RSVP_LABELS: Record<RsvpStatus, string> = {
  invited:    'Invited',
  going:      'Going',
  maybe:      'Maybe',
  not_going:  'Not going',
  on_my_way:  "I'm on my way",
  arrived:    'Arrived',
};

const PLACEHOLDER_AVATARS: AvatarItem[] = [
  { uri: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Maya' },
  { uri: 'https://randomuser.me/api/portraits/men/32.jpg',   name: 'Theo' },
  { uri: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'Ana' },
  { uri: 'https://randomuser.me/api/portraits/men/15.jpg',   name: 'Sam' },
  { uri: 'https://randomuser.me/api/portraits/women/21.jpg', name: 'Joy' },
];

export default function EventDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id ?? '';
  const { data: event } = useEvent(eventId);
  const { data: myRsvp } = useMyRsvp(eventId);
  const { data: attendees } = useEventAttendees(eventId);
  const setRsvp = useSetRsvp(eventId);

  const [openToDiscovery, setOpenToDiscovery] = useState(
    event?.visibility === 'discoverable',
  );

  const current: RsvpStatus = myRsvp?.rsvp_status ?? 'invited';
  const isLive = event ? isCheckin({ isCheckin: event.is_checkin, startsAt: event.starts_at }) : false;
  const timeStr = event ? formatEventTimeShort(event.starts_at) : '';
  const going = attendees?.filter((a) => a.rsvp_status === 'going' || a.rsvp_status === 'on_my_way').length ?? 0;

  const attendeeAvatars: AvatarItem[] = (attendees ?? []).slice(0, 5).map((a) => ({
    uri: null,
    name: a.profile?.display_name ?? a.profile?.username ?? '?',
  }));
  const displayAvatars = attendeeAvatars.length > 0 ? attendeeAvatars : PLACEHOLDER_AVATARS;

  // Names for "Maya, Theo & 4 more"
  const firstName = displayAvatars[0]?.name ?? '';
  const secondName = displayAvatars[1]?.name ?? '';
  const extraCount = Math.max(0, displayAvatars.length - 2);
  const attendeeLabel = extraCount > 0
    ? `${firstName}, ${secondName} & ${extraCount} more`
    : firstName;

  // Primary CTA: next logical RSVP action
  const nextAction = RSVP_TRANSITIONS[current]?.[0];
  const ctaLabel = nextAction ? RSVP_LABELS[nextAction] : RSVP_LABELS[current];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero photo ─────────────────────── */}
        <View style={styles.heroWrap}>
          {event?.photo_url ? (
            <ImageBackground
              source={{ uri: event.photo_url }}
              style={styles.heroImg}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.18)', 'rgba(23,20,15,0.72)']}
                style={styles.heroGrad}
              >
                {/* Nav buttons */}
                <View style={styles.heroNav}>
                  <Pressable onPress={() => router.back()} style={styles.heroNavBtn}>
                    <ArrowLeft color={colors.text} size={20} strokeWidth={2.5} />
                  </Pressable>
                  <View style={styles.heroNavRight}>
                    <Pressable style={styles.heroNavBtn}>
                      <Share2 color={colors.text} size={18} strokeWidth={2} />
                    </Pressable>
                    <Pressable style={styles.heroNavBtn}>
                      <Heart color={colors.text} size={18} strokeWidth={2} />
                    </Pressable>
                  </View>
                </View>

                {/* Bottom overlay */}
                <View style={styles.heroBadges}>
                  <View style={styles.circleChip}>
                    <View style={[styles.chipDot, { backgroundColor: colors.success }]} />
                    <Text style={styles.chipText} numberOfLines={1}>Hiking Crew</Text>
                  </View>
                  {isLive && <LiveBadge />}
                </View>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {event?.title ?? 'Event'}
                </Text>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={['#FF7855', '#C22E13']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImg}
            >
              <View style={styles.heroGrad}>
                <View style={styles.heroNav}>
                  <Pressable onPress={() => router.back()} style={styles.heroNavBtn}>
                    <ArrowLeft color="#fff" size={20} strokeWidth={2.5} />
                  </Pressable>
                  <View style={styles.heroNavRight}>
                    <Pressable style={styles.heroNavBtn}>
                      <Share2 color="#fff" size={18} strokeWidth={2} />
                    </Pressable>
                    <Pressable style={styles.heroNavBtn}>
                      <Heart color="#fff" size={18} strokeWidth={2} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.heroBadges}>
                  {isLive && <LiveBadge />}
                </View>
                <Text style={styles.heroTitle}>{event?.title ?? 'Event'}</Text>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* ── Details body ────────────────────── */}
        <View style={styles.body}>
          {/* When / Where / Distance / Going grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaCell}>
              <View style={styles.metaIcon}>
                <Calendar color={colors.textMuted} size={18} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={styles.metaLabel}>When</Text>
                <Text style={styles.metaValue}>{timeStr || 'Anytime'}</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaCell}>
              <View style={styles.metaIcon}>
                <MapPin color={colors.textMuted} size={18} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={styles.metaLabel}>Where</Text>
                <Text style={styles.metaValue} numberOfLines={2}>
                  {(event as any)?.place_name ?? 'TBD'}
                </Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaCell}>
              <View style={styles.metaIcon}>
                <Navigation color={colors.textMuted} size={18} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={styles.metaLabel}>Distance</Text>
                <Text style={styles.metaValue}>Nearby</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaCell}>
              <View style={styles.metaIcon}>
                <Users color={colors.textMuted} size={18} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={styles.metaLabel}>Going</Text>
                <Text style={styles.metaValue}>{going || '—'} friends</Text>
              </View>
            </View>
          </View>

          {/* Attendee strip */}
          {displayAvatars.length > 0 && (
            <View style={styles.attendeeRow}>
              <AvatarStack avatars={displayAvatars} size={34} max={5} />
              <Text style={styles.attendeeLabel}>{attendeeLabel}</Text>
            </View>
          )}

          {/* Description */}
          {event?.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : null}

          {/* Discovery toggle */}
          <View style={styles.discoveryRow}>
            <View style={styles.discoveryInfo}>
              <Text style={styles.discoveryTitle}>Open to discovery</Text>
              <Text style={styles.discoverySubtitle}>Only your circle can see this plan</Text>
            </View>
            <Switch
              value={openToDiscovery}
              onValueChange={setOpenToDiscovery}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={openToDiscovery ? colors.primary : colors.textSubtle}
              ios_backgroundColor={colors.border}
            />
          </View>

          <ErrorText message={setRsvp.error instanceof Error ? setRsvp.error.message : null} />

          {/* RSVP options */}
          {RSVP_TRANSITIONS[current].length > 1 && (
            <View style={styles.rsvpRow}>
              {RSVP_TRANSITIONS[current].slice(1).map((status) => (
                <Pressable
                  key={status}
                  onPress={() => setRsvp.mutate(status)}
                  disabled={setRsvp.isPending}
                  style={styles.rsvpSecondary}
                  testID={`rsvp-${status}`}
                >
                  <Text style={styles.rsvpSecondaryText}>{RSVP_LABELS[status]}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Primary CTA ────────────────────── */}
      <View style={styles.footer}>
        {nextAction ? (
          <Pressable
            style={styles.ctaBtn}
            onPress={() => setRsvp.mutate(nextAction)}
            disabled={setRsvp.isPending}
            testID={`rsvp-${nextAction}`}
          >
            <Navigation color="#fff" size={18} strokeWidth={2.2} />
            <Text style={styles.ctaBtnText}>{ctaLabel}</Text>
          </Pressable>
        ) : (
          <View style={[styles.ctaBtn, styles.ctaBtnDone]}>
            <Text style={styles.ctaBtnText}>{RSVP_LABELS[current]}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Hero
  heroWrap: { overflow: 'hidden' },
  heroImg: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  heroGrad: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: spacing.md + 8,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroNavRight: { flexDirection: 'row', gap: spacing.xs },
  heroNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  heroBadges: {
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
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontFamily: ff(fonts.sans),
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    fontFamily: ff(fonts.display),
    lineHeight: 32,
    marginTop: 4,
  },

  // Body
  body: {
    padding: spacing.md,
    gap: spacing.lg,
  },

  // Meta grid
  metaGrid: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    ...shadows.sm,
  },
  metaCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    width: '50%',
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: ff(fonts.sans),
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: ff(fonts.sans),
    marginTop: 1,
  },
  metaDivider: {
    position: 'absolute',
    backgroundColor: colors.border,
  },

  // Attendee row
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  attendeeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: ff(fonts.sans),
  },

  // Description
  description: {
    fontSize: 15,
    color: colors.textBody,
    lineHeight: 22,
    fontFamily: ff(fonts.sans),
  },

  // Discovery
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
  discoveryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: ff(fonts.sans),
  },
  discoverySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
    fontFamily: ff(fonts.sans),
  },

  // RSVP
  rsvpRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rsvpSecondary: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rsvpSecondaryText: {
    color: colors.primary,
    fontWeight: '600',
    fontFamily: ff(fonts.sans),
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    ...shadows.primary,
  },
  ctaBtnDone: {
    backgroundColor: colors.success,
    ...(shadows.primary as any),
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: ff(fonts.sans),
  },
});
