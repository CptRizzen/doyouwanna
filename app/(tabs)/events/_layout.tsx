import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function EventsStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Events' }} />
      <Stack.Screen name="new" options={{ title: 'New Event', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Event' }} />
    </Stack>
  );
}
