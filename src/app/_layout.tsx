import '@/global.css';
import { Provider } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { store } from '@/store/store';
import { SubscriptionsCheckScreen } from '@/features/subscriptions/screens/subscriptions-check-screen';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Redux store: RTK Query's cache, available to every screen */}
      <Provider store={store}>
        <GluestackUIProvider mode="system">
          <SafeAreaView style={{ flex: 1 }}>
            {/* TEMPORARY: replaced by real screens in phase 4 */}
            <SubscriptionsCheckScreen />
          </SafeAreaView>
        </GluestackUIProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
