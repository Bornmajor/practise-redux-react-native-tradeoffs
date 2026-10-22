import { configureStore } from '@reduxjs/toolkit';
import { subscriptionsApi } from '@/features/subscriptions/state/subscriptions.api';
import { setupAppListeners } from './app-listeners';

export const store = configureStore({
  reducer: {
    // RTK Query's cache, under the key 'subscriptionsApi'
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
  },
  // RTK Query's middleware runs the requests, caching and refetching
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(subscriptionsApi.middleware),
});

// Make refetchOnFocus / refetchOnReconnect work on a phone (see app-listeners.ts)
setupAppListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
