import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { House, UsersRound, Map, UserRound, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, shadows } from '@/constants/theme';

const ICONS = {
  events: House,
  circles: UsersRound,
  map: Map,
  profile: UserRound,
} as const;

const LABELS = {
  events: 'Home',
  circles: 'Circles',
  map: 'Nearby',
  profile: 'You',
} as const;

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Build tab items, injecting the Plan FAB at center position (index 2)
  const tabs = state.routes;
  const items: Array<{ type: 'tab'; index: number } | { type: 'fab' }> = [];
  tabs.forEach((_, i) => {
    if (i === 2) items.push({ type: 'fab' });
    items.push({ type: 'tab', index: i });
  });

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map((item, key) => {
        if (item.type === 'fab') {
          return (
            <Pressable
              key="plan-fab"
              onPress={() => router.push('/new-plan')}
              accessibilityLabel="Plan an event"
              style={styles.fabWrap}
            >
              <View style={styles.fab}>
                <Plus color="#fff" size={26} strokeWidth={2.6} />
              </View>
            </Pressable>
          );
        }

        const { index } = item;
        const route = tabs[index];
        const focused = state.index === index;
        const Icon = ICONS[route.name as keyof typeof ICONS];
        const label = LABELS[route.name as keyof typeof LABELS] ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab} accessibilityLabel={label}>
            {Icon && (
              <Icon
                color={focused ? colors.primary : colors.textSubtle}
                size={24}
                strokeWidth={focused ? 2.5 : 2}
              />
            )}
            <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,251,245,0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    // Frosted glass on web/iOS via backdrop blur (web-only style)
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' } as object)
      : {}),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingBottom: 2,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSubtle,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.primary,
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: -14,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
    ...shadows.primary,
  },
});
