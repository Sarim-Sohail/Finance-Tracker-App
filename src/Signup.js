import React from 'react'
import {
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native'
import { useState } from 'react'
import { auth, firestore } from '../firebaseConfig'
import { addDoc, setDoc, doc, collection } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import themeConfig from '../themeConfig'

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repassword, setRepassword] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [job, setJob] = useState('')
  const [address, setAddress] = useState('')
  const [budget, setBudget] = useState('')

  const handleSignup = async () => {
    if (
      !email ||
      !password ||
      !repassword ||
      !name ||
      !age ||
      !address ||
      !budget
    ) {
      alert('Please fill in all the fields')
      return
    }

    if (password !== repassword) {
      alert('Passwords do not match')
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user
      console.log('User document added')

      await setDoc(doc(firestore, 'users', user.uid), {
        id: user.uid,
        email: email,
        name: name,
        age: parseInt(age),
        job: job,
        address: address,
        picture: '',
        incomeTotal: 0,
        expenseTotal: 0,
        budgetTotal: parseInt(budget),
        budgetLeft: parseInt(budget)
      })

      navigation.navigate('Main')
    } catch (error) {
      alert(error.message)
      console.log(error)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Register</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder='Enter your email'
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        ></TextInput>

        <TextInput
          placeholder='Enter your name'
          value={name}
          onChangeText={text => setName(text)}
          style={styles.input}
        ></TextInput>

        <TextInput
          keyboardType='numeric'
          placeholder='Enter your age'
          value={age}
          onChangeText={text => setAge(text)}
          style={styles.input}
          returnKeyType='done'
        ></TextInput>

        <TextInput
          placeholder='Enter your address'
          value={address}
          onChangeText={text => setAddress(text)}
          style={styles.input}
        ></TextInput>

        <TextInput
          placeholder='Enter your current job title (if applicable)'
          value={job}
          onChangeText={text => setJob(text)}
          style={styles.input}
        ></TextInput>

        <TextInput
          keyboardType='numeric'
          placeholder='Enter your budget'
          value={budget}
          onChangeText={text => setBudget(text)}
          style={styles.input}
          returnKeyType='done'
        ></TextInput>

        <TextInput
          placeholder='Enter your password'
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        ></TextInput>

        <TextInput
          placeholder='Enter your password again'
          value={repassword}
          onChangeText={text => setRepassword(text)}
          style={styles.input}
          secureTextEntry
        ></TextInput>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSignup} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Login')
          }}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default Signup

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputContainer: {
    width: '80%'
  },
  input: {
    backgroundColor: themeConfig.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5
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
    color: themeConfig.white ,
    fontWeight: '700',
    fontSize: 16
  },
  buttonOutlineText: {
    color: themeConfig.primary,
    fontWeight: '700',
    fontSize: 16
  }
})
