// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJsFBRZO3Gc-QtMeXO1dAU8vPKQQKm3FI",
  authDomain: "habit-tracker-4b67a.firebaseapp.com",
  projectId: "habit-tracker-4b67a",
  storageBucket: "habit-tracker-4b67a.firebasestorage.app",
  messagingSenderId: "439161294229",
  appId: "1:439161294229:web:03acde6c7c1cd0c4f97a9c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
