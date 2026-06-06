import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

export interface AvatarItem {
  uri?: string | null;
  name: string;
}

interface Props {
  avatars: AvatarItem[];
  size?: number;
  max?: number;
}

const ff = (f: string) => (Platform.OS === 'web' ? f : undefined);

export function AvatarStack({ avatars, size = 32, max = 4 }: Props) {
  const shown = avatars.slice(0, max);
  const overflow = avatars.length - shown.length;
  const overlap = Math.round(size * 0.35);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((a, i) => (
        <View
          key={i}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: i === 0 ? 0 : -overlap,
              zIndex: shown.length - i,
            },
          ]}
        >
          {a.uri ? (
            <Image
              source={{ uri: a.uri }}
              style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }}
            />
          ) : (
            <View
              style={[
                styles.initialsCircle,
                { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 },
              ]}
            >
              <Text style={[styles.initials, { fontSize: Math.round(size * 0.32) }]}>
                {a.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={[
            styles.overflow,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -overlap,
            },
          ]}
        >
          <Text style={[styles.overflowText, { fontSize: Math.round(size * 0.32) }]}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
  },
  initialsCircle: {
    backgroundColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    color: colors.textBody,
    fontFamily: ff(fonts.sans),
  },
  overflow: {
    borderWidth: 2,
    borderColor: colors.surfaceCard,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontWeight: '700',
    color: '#fff',
    fontFamily: ff(fonts.sans),
  },
});
