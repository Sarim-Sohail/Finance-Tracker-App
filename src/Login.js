import React from 'react'
import {
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
} from 'react-native'
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Checkbox from 'expo-checkbox'
import themeConfig from '../themeConfig'

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [checked, setChecked] = useState(false)

  const handleCheckboxPress = () => {
    setChecked(!checked)
  }
  const handleLogin = async () => {
    await signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user

        if (rememberMe) {
          AsyncStorage.setItem('email', email)
          AsyncStorage.setItem('password', password)
        } else {
          AsyncStorage.removeItem('email')
          AsyncStorage.removeItem('password')
        }
        console.log('User logged in manually')
        navigation.navigate('Main')
      })
      .catch(error => {
        alert(error.message)
        console.log(error)
      })
  }
  const checkboxColor = checked ? themeConfig.primary : themeConfig.black
  return (
    <SafeAreaView style={styles.container} >
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Login</Text>
      </View>
      <KeyboardAvoidingView style={styles.inputContainer} behavior='padding'>
        <TextInput
          placeholder='Enter your email'
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        ></TextInput>

        <TextInput
          placeholder='Enter your password '
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        ></TextInput>
      </KeyboardAvoidingView >

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={rememberMe}
          onValueChange={() => {
            setRememberMe(!rememberMe)
            handleCheckboxPress()}}
          style={styles.checkbox}
          color={checkboxColor}
        />
        <Text style={styles.checkboxText}>Remember Me</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Register </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputContainer: {
    width: '80%'
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themeConfig.primary
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginRight: 175,
    color: themeConfig.primary
  },
  checkbox: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginRight: 8,
    backgroundColor: themeConfig.black
  },
  checkboxText: {
    fontSize: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  input: {
    backgroundColor: themeConfig.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  button: {
    backgroundColor: themeConfig.primary,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonOutline: {
    backgroundColor: themeConfig.white,
    marginTop: 5,
    borderColor: themeConfig.primary,
    borderWidth: 2
  },
  buttonText: {
    color: themeConfig.white,
    fontWeight: '700',
    fontSize: 16
  },
  buttonOutlineText: {
    color: themeConfig.primary,
    fontWeight: '700',
    fontSize: 16
  }
})
