import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Text, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useState } from 'react';
import FormScreen from '@/my-app/form-screen';
import CounterScreen from '@/my-app/counter-screen';



export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
   <SafeAreaView style={{flex:1}}>
   <CounterScreen />
   </SafeAreaView>
  );
}
