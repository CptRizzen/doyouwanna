import { Tabs } from 'expo-router';
import { colors } from '@/constants/theme';
import { CustomTabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tabs.Screen name="events" options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen name="circles" options={{ title: 'Circles', headerShown: false }} />
      <Tabs.Screen name="map" options={{ title: 'Nearby', headerShown: false }} />
      <Tabs.Screen name="profile" options={{ title: 'You', headerShown: false }} />
    </Tabs>
  );
}
