import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

export function LiveBadge() {
  return (
    <View style={styles.badge}>
      <View style={styles.dot} />
      <Text style={styles.label}>Live now</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    fontFamily: ff(fonts.sans),
  },
});
