import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ErrorText, Muted, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/**
 * Deep-link target for email invites (doyouwanna://invite/<token>).
 *
 * If signed out, the AuthGate routes to sign-in first; after auth the user can
 * return here to accept. Acceptance calls the accept_invite RPC, which joins
 * the circle/event server-side. The full email-send flow (Resend Edge Function)
 * lands in a later phase.
 */
export default function AcceptInvite() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onAccept = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc('accept_invite', {
        p_token: token ?? '',
      });
      if (rpcError) throw rpcError;
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not accept invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Title>You're invited</Title>
        {!session ? (
          <Muted>Sign in or create an account to accept this invite.</Muted>
        ) : done ? (
          <>
            <Muted>Invite accepted! You've been added.</Muted>
            <Button title="Go to events" onPress={() => router.replace('/(tabs)/events')} />
          </>
        ) : (
          <>
            <Muted>Accept this invite to join.</Muted>
            <ErrorText message={error} />
            <Button
              title="Accept invite"
              onPress={onAccept}
              loading={loading}
              testID="accept-invite-button"
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
});
