import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider } from "react-redux"
import {store} from "@/store";
import {Slot} from "expo-router/build/ui/Slot";
import MiniPlayer from "@/components/home/MiniPlayer";
import {usePlayerStore} from "@/store/playerStore";
import {AuthProvider} from "@/context/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

    const { currentSong } = usePlayerStore()

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
      <Provider store={store}>
          <AuthProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack screenOptions={{ headerShown: false }}>
                      <Slot/>
                  </Stack>

                  {/* Render MiniPlayer above the tab bar if a song is playing */}
                  {currentSong && <MiniPlayer />}
                  <StatusBar style="auto" />
              </ThemeProvider>
          </AuthProvider>
      </Provider>
  );
}
