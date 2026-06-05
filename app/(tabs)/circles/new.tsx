import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useCreateCircle } from '@/api/circles';
import { Button, ErrorText, Field } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { parseTags } from '@/lib/tags';

export default function NewCircle() {
  const router = useRouter();
  const createCircle = useCreateCircle();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    try {
      await createCircle.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        activity_tags: parseTags(tags),
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create circle');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Hiking Crew" />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What's this circle for?"
        multiline
      />
      <Field
        label="Activity tags (comma separated)"
        value={tags}
        onChangeText={setTags}
        placeholder="hiking, trivia"
        autoCapitalize="none"
      />
      <ErrorText message={error} />
      <Button
        title="Create circle"
        onPress={onSubmit}
        loading={createCircle.isPending}
        disabled={!name.trim()}
        testID="create-circle-submit"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
});
