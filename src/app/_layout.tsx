import CounterScreen from '@/my-app/counter-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {

  return (
   <GestureHandlerRootView style={{flex:1}}>
     <GluestackUIProvider mode="system">
      <SafeAreaView style={{flex:1}}>
   <CounterScreen />
   </SafeAreaView>
    </GluestackUIProvider>
   </GestureHandlerRootView>
   
  
  );
}
