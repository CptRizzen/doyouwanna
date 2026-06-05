import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddMemberByUsername, useCircle, useCircleMembers } from '@/api/circles';
import { useCircleInvites, useCreateInvite, useRevokeInvite } from '@/api/invites';
import { Button, Card, ErrorText, Field, Muted, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export default function CircleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const circleId = id ?? '';
  const { data: circle } = useCircle(circleId);
  const { data: members } = useCircleMembers(circleId);
  const addMember = useAddMemberByUsername(circleId);

  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite(circleId);
  const { data: pendingInvites } = useCircleInvites(circleId);

  const [username, setUsername] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);

  const onAdd = async () => {
    setError(null);
    try {
      await addMember.mutateAsync(username.trim());
      setUsername('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add member');
    }
  };

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
      <FlatList
        contentContainerStyle={styles.content}
        data={members ?? []}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={
          <View>
            <Title>{circle?.name ?? 'Circle'}</Title>
            {circle?.description ? <Muted>{circle.description}</Muted> : null}

            <Text style={styles.sectionLabel}>Add member</Text>
            <Field
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="their_username"
            />
            <ErrorText message={error} />
            <Button
              title="Add to circle"
              onPress={onAdd}
              loading={addMember.isPending}
              disabled={!username.trim()}
              variant="secondary"
              testID="add-member-button"
            />

            <Text style={styles.sectionLabel}>Invite by email</Text>
            <Field
              label="Email address"
              value={inviteEmail}
              onChangeText={(v) => { setInviteEmail(v); setInviteSent(false); }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="friend@example.com"
            />
            <ErrorText message={inviteError} />
            {inviteSent ? (
              <Muted>Invite sent!</Muted>
            ) : null}
            <Button
              title="Send invite"
              onPress={onInvite}
              loading={createInvite.isPending}
              disabled={!inviteEmail.trim()}
              variant="secondary"
              testID="send-invite-button"
            />
            {pendingInvites && pendingInvites.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Pending invites</Text>
                {pendingInvites.map((inv) => (
                  <Card key={inv.id}>
                    <Text style={styles.memberName}>{inv.email}</Text>
                    <Muted>Expires {new Date(inv.expires_at).toLocaleDateString()}</Muted>
                    <Button
                      title="Revoke"
                      onPress={() => revokeInvite.mutate(inv.id)}
                      loading={revokeInvite.isPending}
                      variant="danger"
                    />
                  </Card>
                ))}
              </>
            ) : null}

            <Text style={styles.sectionLabel}>Members</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.memberName}>
              {item.profile?.display_name ?? item.profile?.username ?? 'Unknown'}
            </Text>
            <Muted>
              @{item.profile?.username} · {item.role}
            </Muted>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  memberName: { fontSize: 16, fontWeight: '600', color: colors.text },
});
