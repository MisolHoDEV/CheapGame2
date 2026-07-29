"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { DealsRail } from "@/components/deals-rail"
import { GameGrid } from "@/components/game-grid"
import { SiteFooter } from "@/components/site-footer"
import { GameDetailModal } from "@/components/game-detail-modal"
import { LoginModal } from "@/components/login-modal"
import { CartPanel } from "@/components/cart-panel"
import { ProfilePanel } from "@/components/profile-panel"
import { CheckoutPanel } from "@/components/checkout-panel"
import type { Game } from "@/lib/games"
import { useCart } from "@/contexts/cart-context"

type Modal =
  | { type: "none" }
  | { type: "login" }
  | { type: "game"; game: Game }
  | { type: "cart" }
  | { type: "profile" }
  | { type: "checkout"; items: Game[] }

export function StoreShell() {
  const [query, setQuery] = useState("")
  const [modal, setModal] = useState<Modal>({ type: "none" })
  const { items: cartItems } = useCart()

  function openDetail(game: Game) {
    setModal({ type: "game", game })
  }

  function requireLogin() {
    setModal({ type: "login" })
  }

  function openCart() {
    setModal({ type: "cart" })
  }

  function openProfile() {
    setModal({ type: "profile" })
  }

  function openCheckoutFromCart() {
    setModal({ type: "checkout", items: cartItems as Game[] })
  }

  function openCheckoutFromGame(game: Game) {
    setModal({ type: "checkout", items: [game] })
  }

  function closeModal() {
    setModal({ type: "none" })
  }

  return (
    <div className="grid-fade-bg min-h-screen">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onLoginClick={() => setModal({ type: "login" })}
        onCartClick={openCart}
        onProfileClick={openProfile}
      />
      <main>
        <Hero />
        <DealsRail />
        <GameGrid
          query={query}
          onOpenDetail={openDetail}
          onRequireLogin={requireLogin}
        />
      </main>
      <SiteFooter />

      {/* Modals */}
      {modal.type === "login" && <LoginModal onClose={closeModal} />}

      {modal.type === "game" && (
        <GameDetailModal
          game={modal.game}
          onClose={closeModal}
          onRequireLogin={() => setModal({ type: "login" })}
          onBuyNow={openCheckoutFromGame}
        />
      )}

      {modal.type === "cart" && (
        <CartPanel
          onClose={closeModal}
          onCheckout={openCheckoutFromCart}
          onRequireLogin={requireLogin}
        />
      )}

      {modal.type === "profile" && (
        <ProfilePanel
          onClose={closeModal}
          onLoginClick={requireLogin}
        />
      )}

      {modal.type === "checkout" && (
        <CheckoutPanel
          items={modal.items}
          onClose={closeModal}
          onTopup={openProfile}
        />
      )}
    </div>
  )
}
