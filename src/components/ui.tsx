import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '@/constants/theme';

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  testID,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  testID?: string;
}) {
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      ...shadows.primary,
    },
    secondary: {
      backgroundColor: colors.surfaceCard,
      borderWidth: 1.5,
      borderColor: colors.borderDefault,
    },
    danger: {
      backgroundColor: colors.danger,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  }[variant];

  const textColor = {
    primary: '#FFFFFF',
    secondary: colors.text,
    danger: '#FFFFFF',
    ghost: colors.primary,
  }[variant];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textSubtle}
        {...props}
      />
    </View>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    letterSpacing: -0.2,
  },

  field: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    color: colors.text,
    backgroundColor: colors.surfaceCard,
  },

  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceCard,
    ...shadows.sm,
  },

  error: {
    color: colors.danger,
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    marginBottom: spacing.sm,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? fonts.display : undefined,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },

  muted: {
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    color: colors.textMuted,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
