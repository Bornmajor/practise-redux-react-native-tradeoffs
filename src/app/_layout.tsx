// Provider: the component that makes the Redux store available to everything inside it
import { Provider } from 'react-redux';
// SafeAreaView: keeps content away from the notch / status bar
import { SafeAreaView } from 'react-native-safe-area-context';

// The store we created in step 3
import { store } from '@/shared/store/store';
// The screen you're showing now; step 5 will replace this with the Todos screen
//import TasksScreen from '@/my-app/tasks-screen';
import TodosScreen from '@/features/todos/screens/todos-screen';

// The root layout: Expo Router renders this around every screen in the app
export default function RootLayout() {
  // Return the UI tree for the whole app
  return (
    // Give the store to every component inside; must be the outermost wrapper
    <Provider store={store}>
      {/* Keep the screen inside the safe area and let it fill the height */}
      <SafeAreaView style={{ flex: 1 }}>
        {/* The current screen; any component in here can now use the Redux hooks */}
        <TodosScreen />
      </SafeAreaView>
    </Provider>
  );
}