// Import the functions you need from the SDKs you need

// compat packages are API compatible with namespaced code
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-PN0Qq5tZHmE3havskfLcswKgVO0FI18",
  authDomain: "cometscraper.firebaseapp.com",
  databaseURL: "https://cometscraper-default-rtdb.firebaseio.com",
  projectId: "cometscraper",
  storageBucket: "cometscraper.appspot.com",
  messagingSenderId: "214010943200",
  appId: "1:214010943200:web:aecfb79795374e628f2285",
  measurementId: "G-6XCFVQM6N3"
};

    firebase.initializeApp(firebaseConfig)

  
  
  export const auth = firebase.auth() 
  export const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
  export const database = firebase.database();