import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddMemberByUsername, useCircle, useCircleMembers } from '@/api/circles';
import { Button, Card, ErrorText, Field, Muted, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export default function CircleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const circleId = id ?? '';
  const { data: circle } = useCircle(circleId);
  const { data: members } = useCircleMembers(circleId);
  const addMember = useAddMemberByUsername(circleId);

  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onAdd = async () => {
    setError(null);
    try {
      await addMember.mutateAsync(username.trim());
      setUsername('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add member');
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
