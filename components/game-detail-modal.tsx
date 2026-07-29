"use client"

import { useState } from "react"
import {
  X,
  ShoppingCart,
  CreditCard,
  Star,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND, type Game } from "@/lib/games"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

type Props = {
  game: Game
  onClose: () => void
  onRequireLogin: () => void
  onBuyNow: (game: Game) => void
}

// Fake system requirements dựa trên năm phát hành & metacritic
function getSystemReqs(game: Game) {
  const year = parseInt(game.releaseDate?.slice(-4) ?? "2020")
  const heavy = year >= 2022 || (game.metacritic ?? 0) >= 85
  return {
    min: {
      os: "Windows 10 64-bit",
      cpu: heavy ? "Intel Core i5-8600K / AMD Ryzen 5 3600" : "Intel Core i5-4460 / AMD FX-6300",
      ram: heavy ? "12 GB RAM" : "8 GB RAM",
      gpu: heavy ? "NVIDIA GTX 1070 / AMD RX 5700" : "NVIDIA GTX 970 / AMD R9 390",
      storage: heavy ? "70 GB" : "40 GB",
    },
    rec: {
      os: "Windows 10/11 64-bit",
      cpu: heavy ? "Intel Core i7-10700K / AMD Ryzen 7 5800X" : "Intel Core i7-6700K / AMD Ryzen 5 1600",
      ram: heavy ? "16 GB RAM" : "12 GB RAM",
      gpu: heavy ? "NVIDIA RTX 3070 / AMD RX 6700 XT" : "NVIDIA GTX 1080 / AMD RX 580",
      storage: heavy ? "70 GB SSD" : "40 GB SSD",
    },
  }
}

export function GameDetailModal({ game, onClose, onRequireLogin, onBuyNow }: Props) {
  const { user } = useAuth()
  const { addToCart, isInCart } = useCart()
  const [tab, setTab] = useState<"info" | "sysreq">("info")
  const inCart = isInCart(game.appid)
  const reqs = getSystemReqs(game)

  async function handleAddToCart() {
    if (!user) { onRequireLogin(); return }
    await addToCart({
      appid: game.appid,
      title: game.title,
      price: game.price,
      portrait: game.portrait,
      discount: game.discount,
      originalPrice: game.originalPrice,
    })
  }

  function handleBuyNow() {
    if (!user) { onRequireLogin(); return }
    onBuyNow(game)
  }

  const screenshots = [game.hero, game.header, game.portrait].filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Hero image */}
        <div className="relative h-52 shrink-0 overflow-hidden md:h-64">
          <img
            src={game.hero || game.header || "/placeholder.svg"}
            alt={`Hero của ${game.title}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Buy/Cart buttons overlaid */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div className="leading-tight">
              {game.discount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/20 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                    -{game.discount}%
                  </span>
                  <span className="font-mono text-xs text-muted-foreground line-through">
                    {formatVND(game.originalPrice)}
                  </span>
                </div>
              )}
              <p className="font-mono text-2xl font-bold text-primary text-glow">
                {formatVND(game.price)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 rounded-full border-border bg-background/80 backdrop-blur"
                onClick={handleAddToCart}
                disabled={inCart}
                aria-label={inCart ? "Đã có trong giỏ" : "Thêm vào giỏ hàng"}
              >
                {inCart ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{inCart ? "Đã thêm" : "Giỏ hàng"}</span>
              </Button>
              <Button
                className="gap-2 rounded-full glow-neon"
                onClick={handleBuyNow}
              >
                <CreditCard className="h-4 w-4" />
                Mua ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col overflow-y-auto">
          {/* Title + meta */}
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
            <div>
              <h2 className="text-balance text-xl font-bold md:text-2xl">{game.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {game.genres.join(" · ")} &nbsp;·&nbsp; {game.releaseDate}
              </p>
            </div>
            {game.rating !== null && (
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{game.rating}</span>
                <span className="text-xs text-muted-foreground">/ 5</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-4 flex border-b border-border px-5">
            {(["info", "sysreq"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`mr-6 pb-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "info" ? "Thông tin" : "Cấu hình"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {tab === "info" ? (
              <div className="flex flex-col gap-5">
                <p className="text-sm leading-relaxed text-muted-foreground">{game.short}</p>

                {/* Screenshots */}
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {screenshots.map((src, i) => (
                    <img
                      key={i}
                      src={src || "/placeholder.svg"}
                      alt={`Ảnh gameplay ${i + 1} của ${game.title}`}
                      className="h-32 w-56 shrink-0 rounded-xl object-cover"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {(["min", "rec"] as const).map((level) => (
                  <div
                    key={level}
                    className="rounded-xl border border-border bg-secondary/40 p-4"
                  >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {level === "min" ? "Tối thiểu" : "Đề nghị"}
                    </p>
                    <ul className="flex flex-col gap-2 text-sm">
                      {[
                        { icon: Monitor, label: "OS", val: reqs[level].os },
                        { icon: Cpu, label: "CPU", val: reqs[level].cpu },
                        { icon: MemoryStick, label: "RAM", val: reqs[level].ram },
                        { icon: Monitor, label: "GPU", val: reqs[level].gpu },
                        { icon: HardDrive, label: "Lưu trữ", val: reqs[level].storage },
                      ].map(({ icon: Icon, label, val }) => (
                        <li key={label} className="flex items-start gap-2">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>
                            <span className="text-muted-foreground">{label}: </span>
                            {val}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
