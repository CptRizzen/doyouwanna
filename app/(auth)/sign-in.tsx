import { Link } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ErrorText, Field, Muted } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkText}>do you wanna</Text>
          <Text style={styles.tagline}>hang with your people</Text>
        </View>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        <ErrorText message={error} />
        <Button title="Sign in" onPress={onSubmit} loading={loading} testID="sign-in-button" />
        <View style={styles.footer}>
          <Muted>No account? </Muted>
          <Link href="/(auth)/sign-up" style={styles.link}>
            Sign up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: spacing.lg, maxWidth: 440, width: '100%', alignSelf: 'center' },
  wordmark: { alignItems: 'center', marginBottom: spacing.xxl },
  wordmarkText: {
    fontSize: 38,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? fonts.display : undefined,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: Platform.OS === 'web' ? fonts.sans : undefined,
    color: colors.textMuted,
    marginTop: 4,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: '600' },
});
