// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB1QF3QKOZxO3asVOuh8QHaZpmnbkWCCp0',
  authDomain: 'finance-tracker-ee2d0.firebaseapp.com',
  projectId: 'finance-tracker-ee2d0',
  storageBucket: 'finance-tracker-ee2d0.appspot.com',
  messagingSenderId: '904626889984',
  appId: '1:904626889984:web:2455c3d19b013f0f907fe5',
  measurementId: 'G-24W3GSSFRG'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)
const storage = getStorage(app)

export { app, auth, storage, firestore }
