"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { getFirebaseAuth, getFirebaseDb, getGoogleProvider } from "@/lib/firebase-client"

type AuthContextType = {
  user: User | null
  loading: boolean
  balance: number
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshBalance: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  async function fetchBalance(uid: string) {
    const ref = doc(getFirebaseDb(), "users", uid)
    const snap = await getDoc(ref)
    if (snap.exists()) setBalance(snap.data().balance ?? 0)
  }

  async function ensureUserDoc(u: User) {
    const ref = doc(getFirebaseDb(), "users", u.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
        balance: 0,
        createdAt: serverTimestamp(),
      })
      setBalance(0)
    } else {
      setBalance(snap.data().balance ?? 0)
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      setUser(u)
      if (u) await ensureUserDoc(u)
      else setBalance(0)
      setLoading(false)
    })
    return unsub
  }, [])

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(getFirebaseAuth(), getGoogleProvider())
      await ensureUserDoc(result.user)
    } catch (err: unknown) {
      throw err
    }
  }

  async function logout() {
    await signOut(getFirebaseAuth())
    setBalance(0)
  }

  async function refreshBalance() {
    if (user) await fetchBalance(user.uid)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, balance, signInWithGoogle, logout, refreshBalance }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
