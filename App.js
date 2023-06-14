import React, { useState, useEffect, useRef } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import themeConfig from './themeConfig'
import { StatusBar } from 'expo-status-bar'

import Splash from './src/Splash'
import Main from './src/Main'
import Login from './src/Login'
import Signup from './src/Signup'
import Context from './src/Context'
import Transaction from './src/Transaction'
import Detail from './src/Detail'

const Stack = createNativeStackNavigator()

import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'

export default function App () {
  const [capturedPhotoURL, setCapturedPhotoURL] = useState('')
  const [reload, setReload] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    async function registerForPushNotificationsAsync () {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!')
          return
        }
      } else {
        alert('Must use physical device for Push Notifications')
      }
    }
    registerForPushNotificationsAsync()
  }, [])

  return (
    <SafeAreaProvider>
      <Context.Provider
        value={{
          capturedPhotoURL,
          setCapturedPhotoURL,
          reload,
          setReload,
          token,
          setToken
        }}
      >
        <StatusBar style='dark' />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName='Splash'
            screenOptions={{ gestureEnabled: false }}
          >
            <Stack.Screen
              name='Splash'
              component={Splash}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='Main'
              component={Main}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='Login'
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='Signup'
              component={Signup}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name='Detail'
              component={Detail}
              options={{
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                headerTintColor: themeConfig.white
              }}
            />

            <Stack.Screen
              name='Transaction'
              component={Transaction}
              options={{
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                headerTintColor: themeConfig.white
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Context.Provider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: themeConfig.primary,
    color: themeConfig.white
  },
  headerTitleStyle: {
    color: themeConfig.white,
    backgroundColor: themeConfig.primary
  }
})
