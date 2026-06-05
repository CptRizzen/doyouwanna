import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyProfile } from '@/api/profiles';
import { Button, Card, Muted, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile } = useMyProfile();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Title>{profile?.display_name ?? profile?.username ?? 'Profile'}</Title>
        <Card>
          <Muted>Username</Muted>
          <Title>@{profile?.username ?? '—'}</Title>
          <Muted>Email</Muted>
          <Muted>{user?.email}</Muted>
          <Muted>Discovery</Muted>
          <Muted>{profile?.discovery_mode ?? 'off'}</Muted>
          {profile?.activity_tags?.length ? (
            <>
              <Muted>Activities</Muted>
              <Muted>{profile.activity_tags.join(' · ')}</Muted>
            </>
          ) : null}
        </Card>
        <Button title="Sign out" onPress={signOut} variant="danger" testID="sign-out-button" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
});
