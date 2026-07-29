"use client"

import { useState } from "react"
import { X, CreditCard, CheckCircle, AlertCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND, type Game } from "@/lib/games"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import {
  doc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-client"
type CheckoutItem = Pick<Game, "appid" | "title" | "price" | "portrait">

type Props = {
  items: CheckoutItem[]
  onClose: () => void
  onTopup: () => void
}

export function CheckoutPanel({ items, onClose, onTopup }: Props) {
  const { user, balance, refreshBalance } = useAuth()
  const { clearCart } = useCart()
  const [step, setStep] = useState<"review" | "done" | "insufficient">("review")
  const [loading, setLoading] = useState(false)

  const total = items.reduce((s, i) => s + i.price, 0)
  const canAfford = balance >= total

  async function handlePurchase() {
    if (!user || !canAfford) { setStep("insufficient"); return }
    setLoading(true)
    try {
await updateDoc(doc(getFirebaseDb(), "users", user.uid), { balance: increment(-total) })
    await addDoc(collection(getFirebaseDb(), "transactions"), {
        uid: user.uid,
        type: "purchase",
        amount: -total,
        items: items.map((i) => ({ appid: i.appid, title: i.title, price: i.price })),
        createdAt: serverTimestamp(),
      })
      // Save purchased games to user's library
      for (const item of items) {
        await addDoc(collection(getFirebaseDb(), "library"), {
          uid: user.uid,
          appid: item.appid,
          title: item.title,
          portrait: item.portrait,
          purchasedAt: serverTimestamp(),
        })
      }
      await refreshBalance()
      await clearCart()
      setStep("done")
    } catch {
      // handle silently
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Thanh toán"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "done" ? (
          <div className="flex flex-col items-center gap-4 px-8 py-12">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/15">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Mua hàng thành công!</h2>
            <p className="text-center text-sm text-muted-foreground">
              {items.length} game đã được thêm vào thư viện của bạn.
            </p>
            <div className="flex items-center justify-between w-full rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">Số dư còn lại</span>
              <span className="font-mono font-semibold text-primary">{formatVND(balance)}</span>
            </div>
            <Button className="mt-2 w-full rounded-full" onClick={onClose}>
              Xem thư viện
            </Button>
          </div>
        ) : step === "insufficient" ? (
          <div className="flex flex-col items-center gap-4 px-8 py-12">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/15">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold">Số dư không đủ</h2>
            <p className="text-center text-sm text-muted-foreground">
              Bạn cần thêm{" "}
              <span className="font-semibold text-foreground">{formatVND(total - balance)}</span>{" "}
              để hoàn tất giao dịch.
            </p>
            <Button className="w-full gap-2 rounded-full glow-neon" onClick={onTopup}>
              <Wallet className="h-4 w-4" />
              Nạp tiền ngay
            </Button>
            <Button variant="outline" className="w-full rounded-full" onClick={() => setStep("review")}>
              Quay lại
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-bold">Xác nhận thanh toán</h2>
            </div>

            {/* Items */}
            <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <li key={item.appid} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-2.5">
                  <img
                    src={item.portrait || "/placeholder.svg"}
                    alt={item.title}
                    className="h-12 w-9 shrink-0 rounded-lg object-cover"
                  />
                  <span className="flex-1 truncate text-sm font-medium">{item.title}</span>
                  <span className="shrink-0 font-mono text-sm font-bold text-primary">{formatVND(item.price)}</span>
                </li>
              ))}
            </ul>

            {/* Balance */}
            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Số dư hiện tại</span>
                <span className="font-mono font-semibold">{formatVND(balance)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng thanh toán</span>
                <span className="font-mono font-semibold text-primary">-{formatVND(total)}</span>
              </div>
              <div className="my-1 border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số dư sau</span>
                <span className={`font-mono font-bold ${canAfford ? "text-foreground" : "text-destructive"}`}>
                  {canAfford ? formatVND(balance - total) : "Không đủ"}
                </span>
              </div>
            </div>

            {!canAfford && (
              <p className="text-sm text-destructive">
                Số dư không đủ. Vui lòng nạp thêm tiền.
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full" onClick={onClose}>
                Hủy
              </Button>
              {canAfford ? (
                <Button
                  className="flex-1 gap-2 rounded-full glow-neon"
                  onClick={handlePurchase}
                  disabled={loading}
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  )}
                  Thanh toán
                </Button>
              ) : (
                <Button className="flex-1 gap-2 rounded-full glow-neon" onClick={onTopup}>
                  <Wallet className="h-4 w-4" />
                  Nạp tiền
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
