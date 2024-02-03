import { initializeApp } from 'firebase/app';
import 'firebase/auth'; // Import the specific Firebase services you need

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

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;