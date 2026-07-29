"use client"

import { X, ShoppingCart, Trash2, CreditCard, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/games"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

type Props = {
  onClose: () => void
  onCheckout: () => void
  onRequireLogin: () => void
}

export function CartPanel({ onClose, onCheckout, onRequireLogin }: Props) {
  const { user } = useAuth()
  const { items, removeFromCart, total } = useCart()

  function handleCheckout() {
    if (!user) { onRequireLogin(); return }
    onCheckout()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Giỏ hàng"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-bold">Giỏ hàng ({items.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
            aria-label="Đóng giỏ hàng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
              <p className="font-semibold text-muted-foreground">Giỏ hàng trống</p>
              <p className="text-sm text-muted-foreground/60">
                Hãy thêm game bạn yêu thích vào đây nhé!
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.appid}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3"
                >
                  <img
                    src={item.portrait || "/placeholder.svg"}
                    alt={item.title}
                    className="h-16 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    {item.discount > 0 && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatVND(item.originalPrice)}
                      </p>
                    )}
                    <p className="font-mono text-sm font-bold text-primary">{formatVND(item.price)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.appid)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                    aria-label={`Xóa ${item.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-muted-foreground">Tổng cộng</span>
              <span className="font-mono text-xl font-bold text-primary text-glow">
                {formatVND(total)}
              </span>
            </div>
            <Button
              className="w-full gap-2 rounded-full text-base font-semibold glow-neon"
              onClick={handleCheckout}
            >
              <CreditCard className="h-4 w-4" />
              Thanh toán
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
