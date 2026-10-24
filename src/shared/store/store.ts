// configureStore creates the Redux store with good defaults (DevTools support, mistake checks)
import { configureStore } from '@reduxjs/toolkit';
// The Expo DevTools plugin: sends every action and state change to the DevTools window
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin';
// The todos reducer we exported as default from the slice in step 2
import todosReducer from '@/features/todos/todos.slice';

// Create the one store for the whole app
export const store = configureStore({
  // reducer: each key becomes a top-level part of the state
  reducer: {
    // State will look like { todos: { items: [...] } }; add more slices here later (e.g. auth)
    todos: todosReducer,
  },
  // Turn off the built-in browser-extension DevTools; it doesn't work in React Native
  devTools: false,
  // Add the Expo plugin on top of Redux Toolkit's default enhancers
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(devToolsEnhancer()),
});

// The type of the whole state, worked out automatically from the reducers above
export type RootState = ReturnType<typeof store.getState>;
// The type of store.dispatch, so TypeScript knows which actions it accepts
export type AppDispatch = typeof store.dispatch;