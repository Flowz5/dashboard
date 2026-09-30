import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnMULteV7ymKlXXxHjxFwkjXpfrZbri5A",
  authDomain: "dashboard-dev-377f1.firebaseapp.com",
  projectId: "dashboard-dev-377f1",
  storageBucket: "dashboard-dev-377f1.firebasestorage.app",
  messagingSenderId: "1041158346636",
  appId: "1:1041158346636:web:c830057ae1895bf0e4a8a9",
  measurementId: "G-07N60BD79W"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
