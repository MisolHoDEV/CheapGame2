"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import type { ReactNode } from "react"

// Simple pass-through wrapper — keeps layout.tsx a pure Server Component
// while providing Firebase-backed contexts to the entire client tree.
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
