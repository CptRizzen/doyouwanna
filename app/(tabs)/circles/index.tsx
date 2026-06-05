import { Link, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCircles } from '@/api/circles';
import { Button, Card, ErrorText, Muted } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export default function CirclesList() {
  const router = useRouter();
  const { data: circles, isLoading, error } = useCircles();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        contentContainerStyle={styles.list}
        data={circles ?? []}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          <Button
            title="+ New circle"
            onPress={() => router.push('/(tabs)/circles/new')}
            testID="new-circle-button"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <ErrorText message={error instanceof Error ? error.message : null} />
              <Muted>No circles yet. Create one to start coordinating.</Muted>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/(tabs)/circles/[id]', params: { id: item.id } }} asChild>
            <Pressable>
              <Card>
                <Text style={styles.name}>{item.name}</Text>
                {item.activity_tags.length > 0 && (
                  <Muted>{item.activity_tags.join(' · ')}</Muted>
                )}
              </Card>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.md, gap: spacing.sm },
  name: { fontSize: 17, fontWeight: '600', color: colors.text },
  empty: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
});
