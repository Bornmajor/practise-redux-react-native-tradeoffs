import '@/global.css';
// import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { store } from '@/store/store';
import { FlavorBadge } from '@/components/flavor-badge';
import { NaiveListScreen } from '@/features/list-lab/screens/naive-list-screen';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <GluestackUIProvider mode="system">
          {/* TEMPORARY (long-list practice): open straight into the list lab.
              Restore the normal app with: git checkout src/app/_layout.tsx */}
          <SafeAreaView style={{ flex: 1 }}>
            <NaiveListScreen />
          </SafeAreaView>

          {/* Subscriptions app (commented out while practising long lists)
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Subscriptions' }} />
            <Stack.Screen name="subscriptions/new" options={{ title: 'New subscription' }} />
            <Stack.Screen name="subscriptions/[id]" options={{ title: 'Edit subscription' }} />
            <Stack.Screen name="list-lab/index" options={{ title: 'List lab: naive' }} />
          </Stack>
          */}

          {/* DEV / UAT corner badge (hidden in prod) */}
          <FlavorBadge />
        </GluestackUIProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
