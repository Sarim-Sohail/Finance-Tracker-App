import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import themeConfig from '../themeConfig'
import { signOut } from 'firebase/auth'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage, firestore, auth } from '../firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import Context from './Context'

const Profile = ({ navigation }) => {
  const { capturedPhotoURL } = useContext(Context)
  const [userInfo, setUserInfo] = useState(null)
  const [imageURL, setImageURL] = useState('')
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [job, setJob] = useState('')
  const [address, setAddress] = useState('')

  const [uploading, setUploading] = useState(false)

  const user = auth.currentUser

  useEffect(() => {
    fetchUserInfo(user)
  }, [capturedPhotoURL, imageURL])

  const fetchUserInfo = async user => {
    try {
      const docRef = doc(firestore, 'users', user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const userData = docSnap.data()
        setUserInfo(userData)
        setImageURL(userData.picture)
        setName(userData.name)
        setEmail(userData.email)
        setAddress(userData.address)
        setAge(userData.age)
        setJob(userData.job)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
      .then(() => {
        AsyncStorage.removeItem('email')
        AsyncStorage.removeItem('password')
        navigation.replace('Login')
      })
      .catch(error => alert(error.message))
  }

  const handleCameraImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    if (status !== 'granted') {
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    })

    if (!result.canceled) {
      const pictureRef = ref(storage, `pictures/${user.uid}`)
      const response = await fetch(result.assets[0].uri)
      const blob = await response.blob()
      const uploadTask = uploadBytesResumable(pictureRef, blob)

      uploadTask.on(
        'state_changed',
        snapshot => {},
        error => {
          console.log('Error uploading image:', error)
        },
        async () => {
          setUploading(true)
          const downloadURL = await getDownloadURL(pictureRef)
          await updateDoc(doc(firestore, 'users', user.uid), {
            picture: downloadURL
          })
          console.log('User image uploaded by camera')
          setImageURL(downloadURL)
          setUploading(false)
        }
      )
    }
  }

  const handleLibraryImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    })

    if (!result.canceled) {
      const pictureRef = ref(storage, `pictures/${user.uid}`)
      const response = await fetch(result.assets[0].uri)
      const blob = await response.blob()
      const uploadTask = uploadBytesResumable(pictureRef, blob)

      uploadTask.on(
        'state_changed',
        snapshot => {},
        error => {
          console.log('Error uploading image:', error)
        },
        async () => {
          setUploading(true)
          const downloadURL = await getDownloadURL(pictureRef)
          await updateDoc(doc(firestore, 'users', user.uid), {
            picture: downloadURL
          })
          console.log('User image uploaded by library')
          setImageURL(downloadURL)
          setUploading(false)
        }
      )
    }
  }

  const handleImage = async () => {
    Alert.alert(
      'Image Options',
      'Please select an option',
      [
        {
          text: 'Choose from Library',
          onPress: () => {
            setLoading(true)
            handleLibraryImage()
          }
        },
        {
          text: 'Use your Camera',
          onPress: () => {
            setLoading(true)
            handleCameraImage()
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    )
  }

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size='large' color={themeConfig.primary} />
        </View>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleImage}>
        {uploading ? (
          <ActivityIndicator size='large' color={themeConfig.primary} />
        ) : (
          <View style={styles.pictureContainer}>
            {imageURL != '' ? (
              uploading ? (
                <ActivityIndicator size='large' color={themeConfig.primary} />
              ) : (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageURL }}
                    style={styles.profileImage}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                  />

                  {loading && (
                    <ActivityIndicator
                      size='large'
                      color={themeConfig.primary}
                      style={styles.loadingIndicator}
                    />
                  )}
                </View>
              )
            ) : (
              <Ionicons
                name='md-person-add-outline'
                size={64}
                color={themeConfig.gray}
              />
            )}
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.backgroundStyle}>
        <View style={{ marginLeft: 48, marginTop: 20, marginBottom: 20 }}>
          <Text style={styles.infoHeading}>Name: </Text>
          <KeyboardAvoidingView behavior='position' style={styles.profileText}>
            <TextInput
              style={styles.infoStyle}
              value={name}
              onChangeText={value => {
                setName(value)
              }}
              returnKeyType='done'
              onBlur={async () => {
                await updateDoc(doc(firestore, 'users', user.uid), {
                  name: name
                })
                console.log('User profile has been updated')
              }}
            />
          </KeyboardAvoidingView>

          <Text style={styles.infoHeading}>Email: </Text>
          <View style={styles.profileText}>
            <Text style={styles.infoStyle}>{userInfo.email}</Text>
          </View>

          <Text style={styles.infoHeading}>Age: </Text>
          <KeyboardAvoidingView behavior='position' style={styles.profileText}>
            <TextInput
              style={styles.infoStyle}
              value={age.toString()}
              onChangeText={value => {
                setAge(value)
              }}
              keyboardType='numeric'
              returnKeyType='done'
              onBlur={async () => {
                await updateDoc(doc(firestore, 'users', user.uid), {
                  age: parseInt(age)
                })
                console.log('User profile has been updated')
              }}
            />
          </KeyboardAvoidingView>

          <Text style={styles.infoHeading}>Job Title: </Text>
          <KeyboardAvoidingView behavior='position' style={styles.profileText}>
            <TextInput
              style={styles.infoStyle}
              value={job}
              onChangeText={value => {
                setJob(value)
              }}
              returnKeyType='done'
              onBlur={async () => {
                await updateDoc(doc(firestore, 'users', user.uid), {
                  job: job
                })
                console.log('User profile has been updated')
              }}
            />
          </KeyboardAvoidingView>
          <Text style={styles.infoHeading}>Address: </Text>
          <KeyboardAvoidingView behavior='position' style={styles.profileText}>
            <TextInput
              style={styles.infoStyle}
              value={address}
              onChangeText={value => {
                setAddress(value)
              }}
              returnKeyType='done'
              onBlur={async () => {
                await updateDoc(doc(firestore, 'users', user.uid), {
                  address: address
                })
                console.log('User profile has been updated')
              }}
            />
          </KeyboardAvoidingView>
        </View>
      </View>
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeConfig.white
  },
  backgroundStyle: {
    width: '100%'
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pictureContainer: {
    width: 130,
    height: 130,
    borderRadius: 70,
    backgroundColor: themeConfig.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    top: 20
  },
  infoHeading: {
    fontWeight: 300,
    fontSize: 15,
    marginLeft: -5,
    marginBottom: 0
  },
  profileText: {
    fontWeight: 'bold',
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: themeConfig.black,
    marginLeft: -10,
    paddingRight: 10,
    borderColor: themeConfig.black,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 7,
    width: 300,
    elevation: 20,
    shadowColor: themeConfig.lightGray
  },
  infoStyle: {
    fontSize: 15,
    marginLeft: 0
  },
  imageContainer: {
    position: 'relative'
  },
  loadingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loading: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    color: themeConfig.primary
  },
  button: {
    backgroundColor: themeConfig.primary,
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',

    marginBottom: 20
  },
  buttonText: {
    color: themeConfig.white,
    fontWeight: '700',
    fontSize: 16
  }
})
