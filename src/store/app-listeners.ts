import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { setupListeners } from '@reduxjs/toolkit/query';
import type { AppDispatch } from './store';

// RTK Query listens for BROWSER events by default. On a phone, we tell it ourselves:
// - focus:   the app came to the foreground / went to the background (AppState)
// - network: the connection dropped / came back (NetInfo)
export function setupAppListeners(dispatch: AppDispatch) {
  return setupListeners(dispatch, (dispatch, { onFocus, onFocusLost, onOnline, onOffline }) => {
    // --- Focus ---
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') dispatch(onFocus());
      else dispatch(onFocusLost());
    });

    // --- Network ---
    // isConnected is null while NetInfo is still checking, so we only react to true/false,
    // and only when the value actually CHANGES (NetInfo also reports e.g. Wi-Fi signal changes)
    let wasOnline: boolean | null = null;
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected;
      if (isOnline === null || isOnline === wasOnline) return;

      // Skip the very first report at startup: queries are already loading anyway
      const isFirstReport = wasOnline === null;
      wasOnline = isOnline;
      if (isFirstReport) return;

      dispatch(isOnline ? onOnline() : onOffline()); // back online → refetch; offline → pause
    });

    // Cleanup: stop both listeners
    return () => {
      appStateSubscription.remove();
      unsubscribeNetInfo();
    };
  });
}
