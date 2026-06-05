import { Redirect } from 'expo-router';

// The AuthGate in _layout handles redirects; default to the events tab.
export default function Index() {
  return <Redirect href="/(tabs)/events" />;
}
