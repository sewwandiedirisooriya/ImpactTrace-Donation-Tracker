// app/_layout.tsx
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import Toast from 'react-native-toast-message';

// Keep the splash screen visible while we fecth resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        // Check onboarding, login status, and user role
        const [onboardingStatus, loginStatus, userRole] = await Promise.all([
          AsyncStorage.getItem('hasSeenOnboarding'),
          AsyncStorage.getItem('isLoggedIn'),
          AsyncStorage.getItem('userRole'),
        ]);

        // Determine initial route
        if (loginStatus === 'true') {
          // User is logged in, navigate based on role
          if (userRole === 'beneficiary') {
            setInitialRoute('/(tabs)/beneficiary-home');
          } else {
            // Admin or donor roles go to default home
            setInitialRoute('/(tabs)/home');
          }
        } else if (onboardingStatus === 'true') {
          // User has seen onboarding but not logged in, go to login
          setInitialRoute('/login');
        } else {
          // First time user, show onboarding
          setInitialRoute('/onboarding');
        }
        
        // Add a minimum splash screen time (optional, for branding)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error loading app:', e);
        setInitialRoute('/onboarding');
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady && initialRoute) {
      // Hide splash screen
      SplashScreen.hideAsync();

      // Navigate to determined route
      router.replace(initialRoute as any);
    }
  }, [isReady, initialRoute, router])

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding"/>
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="login" />
      </Stack>
      <Toast />
    </>
  );
}