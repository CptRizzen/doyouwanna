import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function CirclesStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Circles' }} />
      <Stack.Screen name="new" options={{ title: 'New Circle', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Circle' }} />
    </Stack>
  );
}
