import React, { createContext, useContext, useEffect, useState } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

// 通知の動作設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

interface NotificationContextType {
  expoPushToken: string | null
  notification: Notifications.Notification | null
  requestPermission: () => Promise<boolean>
  schedulePushNotification: (
    title: string,
    body: string,
    seconds: number,
  ) => Promise<void>
  cancelAllNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null)

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token ?? null)
    })

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification)
      },
    )

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response)
        // 通知がタップされた時の処理
      })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener)
      Notifications.removeNotificationSubscription(responseListener)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    return finalStatus === 'granted'
  }

  const schedulePushNotification = async (
    title: string,
    body: string,
    seconds: number,
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { timestamp: Date.now() },
      },
      trigger: { seconds },
    })
  }

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync()
  }

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        requestPermission,
        schedulePushNotification,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    )
  }
  return context
}

async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
      return
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data
    console.log('Expo push token:', token)
  } else {
    alert('Must use physical device for Push Notifications')
  }

  return token
}
