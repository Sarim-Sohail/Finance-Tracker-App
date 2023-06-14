import React, { useState, useEffect, useRef } from 'react'
import { Animated, StyleSheet, SafeAreaView, Alert, Image } from 'react-native'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, firestore } from '../firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import themeConfig from '../themeConfig'
import messaging from '@react-native-firebase/messaging'
import { updateDoc, doc } from 'firebase/firestore'
import Context from './Context'
import PushNotification, { Importance } from 'react-native-push-notification'

const Splash = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [shouldNavigate, setShouldNavigate] = useState(false)
  const { token, setToken } = React.useContext(Context)

  useEffect(() => {
    messaging()
      .getToken()
      .then(async token => {
        console.log('Device Token : ', token)
        setToken(token)
      })

    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification
      )
      navigation.navigate('Home')
    })

    messaging().onMessage(async remoteMessage => {
      PushNotification.createChannel(
        {
          channelId: 'default',
          channelName: 'Default Channel',
          importance: Importance.HIGH,
          vibrate: true,
          vibration: 300,
          playSound: true,
          soundName: 'default'
        },
        created => console.log(`createChannel returned '${created}'`)
      )

      PushNotification.localNotification({
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
        channelId: 'default'
      })
    })

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage)
    })

    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification
          )
        }
      })
  }, [])

  const updateToken = async token => {
    try {
      const user = auth.currentUser
      if (user) {
        const userID = user.uid
        const userDocRef = doc(firestore, 'users', userID)

        await updateDoc(userDocRef, {
          token: token
        })
        console.log('Token field updated successfully')
      } else {
        console.log('No user authenticated')
      }
    } catch (error) {
      console.error('Error updating token field:', error)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShouldNavigate(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true
    }).start()
  }, [fadeAnim])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        if (shouldNavigate) {
          navigation.navigate('Main')
        }
      } else {
        AsyncStorage.multiGet(['email', 'password']).then(response => {
          const storedEmail = response[0][1]
          const storedPassword = response[1][1]
          if (storedEmail && storedPassword) {
            signInWithEmailAndPassword(auth, storedEmail, storedPassword)
              .then(() => {
                console.log('User logged in automatically')
                updateToken(token)
                if (shouldNavigate) {
                  navigation.navigate('Main')
                }
              })
              .catch(error => {
                console.log('Error occurred during automatic login:', error)
                if (shouldNavigate) {
                  navigation.navigate('Login')
                }
              })
          } else {
            if (shouldNavigate) {
              navigation.navigate('Login')
            }
          }
        })
      }
    })
    return unsubscribe
  }, [shouldNavigate])

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('../assets/icons/4539251.png')}
          style={{ width: 200, height: 200 }}
          size={24}
          resizeMode='contain'
        />
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeConfig.primary,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default Splash
