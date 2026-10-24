import '@/global.css';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { store } from '@/store/store';
import { FlavorBadge } from '@/components/flavor-badge';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <GluestackUIProvider mode="system">
          {/* Stack: each screen slides in on top, with a header and a back button */}
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Subscriptions' }} />
            <Stack.Screen name="subscriptions/new" options={{ title: 'New subscription' }} />
            <Stack.Screen name="subscriptions/[id]" options={{ title: 'Edit subscription' }} />
            <Stack.Screen name="list-lab/index" options={{ title: 'List lab: naive' }} />
          </Stack>
          {/* DEV / UAT corner badge (hidden in prod) */}
          <FlavorBadge />
        </GluestackUIProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
