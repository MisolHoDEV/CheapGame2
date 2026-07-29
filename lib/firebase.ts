import { initializeApp, getApps, getApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBeECyj-XJoNxY0dzaxkwGEptRvVEc0lKs",
  authDomain: "cheapgamehay-eae09.firebaseapp.com",
  projectId: "cheapgamehay-eae09",
  storageBucket: "cheapgamehay-eae09.firebasestorage.app",
  messagingSenderId: "337141803316",
  appId: "1:337141803316:web:f2a90633a4bfd0ca931d61",
  measurementId: "G-T66LM2ST6J",
}

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

export function getFirebaseAnalytics() {
  if (typeof window === "undefined") {
    return null
  }

  return getAnalytics(getFirebaseApp())
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp())
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp())
}

export function getGoogleProvider() {
  return new GoogleAuthProvider()
}
