"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-client"
import { useAuth } from "@/contexts/auth-context"
import type { Game } from "@/lib/games"

type CartItem = Pick<Game, "appid" | "title" | "price" | "portrait" | "discount" | "originalPrice">

type CartContextType = {
  items: CartItem[]
  addToCart: (game: CartItem) => Promise<void>
  removeFromCart: (appid: number) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (appid: number) => boolean
  total: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (!user) {
      setItems([])
      return
    }
    const ref = doc(getFirebaseDb(), "carts", user.uid)
    getDoc(ref).then((snap) => {
      if (snap.exists()) setItems(snap.data().items ?? [])
      else setItems([])
    })
  }, [user])

  async function syncToFirestore(newItems: CartItem[]) {
    if (!user) return
    const ref = doc(getFirebaseDb(), "carts", user.uid)
    await setDoc(ref, { items: newItems }, { merge: true })
  }

  async function addToCart(game: CartItem) {
    if (!user) return
    if (items.some((i) => i.appid === game.appid)) return
    const next = [...items, game]
    setItems(next)
    await syncToFirestore(next)
  }

  async function removeFromCart(appid: number) {
    if (!user) return
    const next = items.filter((i) => i.appid !== appid)
    setItems(next)
    await syncToFirestore(next)
  }

  async function clearCart() {
    if (!user) return
    setItems([])
    await syncToFirestore([])
  }

  function isInCart(appid: number) {
    return items.some((i) => i.appid === appid)
  }

  const total = items.reduce((s, i) => s + i.price, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, isInCart, total }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
