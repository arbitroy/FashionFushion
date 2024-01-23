// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore } from "firebase/firestore";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage as getFirebaseStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBExEmnUtH4xdOUCCJVZ_BPOYp3sFm24wc",
  authDomain: "fashionfushion-407309.firebaseapp.com",
  projectId: "fashionfushion-407309",
  storageBucket: "fashionfushion-407309.appspot.com",
  messagingSenderId: "440968322493",
  appId: "1:440968322493:web:fd54998ac85050827c46d4",
  measurementId: "G-BJQLE9RM4N"
};

const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_STORAGE = getFirebaseStorage(FIREBASE_APP);
const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(),
});
const FIREBASE_DB = getFirestore(FIREBASE_APP);

export { FIREBASE_APP, FIREBASE_STORAGE, FIREBASE_AUTH, FIREBASE_DB };
