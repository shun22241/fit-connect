import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Provider } from 'react-redux'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'

import { store } from '../store/store'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationProvider } from '../contexts/NotificationContext'

// SplashScreen を表示し続ける
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // カスタムフォントがあればここで読み込み
    // 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <NotificationProvider>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#f8fafc',
                  },
                  headerTintColor: '#1f2937',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen
                  name="workout/[id]"
                  options={{
                    title: 'ワークアウト詳細',
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="post/[id]"
                  options={{
                    title: '投稿詳細',
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="profile/[id]"
                  options={{
                    title: 'プロフィール',
                    presentation: 'modal',
                  }}
                />
              </Stack>
              <StatusBar style="auto" />
            </NotificationProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}
