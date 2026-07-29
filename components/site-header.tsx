"use client"

import { useMemo, useState } from "react"
import { Search, Wallet, LogIn, Gamepad2, Menu, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatVND, games } from "@/lib/games"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"

type SiteHeaderProps = {
  query: string
  onQueryChange: (value: string) => void
  onLoginClick: () => void
  onCartClick: () => void
  onProfileClick: () => void
}

export function SiteHeader({
  query,
  onQueryChange,
  onLoginClick,
  onCartClick,
  onProfileClick,
}: SiteHeaderProps) {
  const [focused, setFocused] = useState(false)
  const { user, balance } = useAuth()
  const { items } = useCart()

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return games.filter((g) => g.title.toLowerCase().includes(q)).slice(0, 5)
  }, [query])

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:h-20 md:px-6">

        {/* Left: Logo */}
        <div className="flex shrink-0 items-center">
          <a href="/" className="flex items-center gap-2" aria-label="CheapGame trang chủ">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground glow-neon md:h-10 md:w-10">
              <Gamepad2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="hidden text-xl font-bold tracking-tight text-glow sm:inline">
              CheapGame<span className="text-primary">.</span>
            </span>
          </a>
        </div>

        {/* Center: Search (takes remaining space) */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative mx-4 flex-1 md:mx-8"
          role="search"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 150)}
            placeholder="Tìm game trong kho..."
            aria-label="Tìm kiếm game"
            className="h-10 w-full rounded-full border border-border bg-secondary/60 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-secondary focus:ring-2 focus:ring-ring/40 md:h-11"
          />

          {focused && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
              {suggestions.map((g) => (
                <li key={g.appid}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex w-full items-center gap-3 px-3 py-2 transition-colors hover:bg-secondary text-left"
                  >
                    <img
                      src={g.header || "/placeholder.svg"}
                      alt=""
                      className="h-8 w-[68px] shrink-0 rounded object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{g.title}</span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-primary">
                      {formatVND(g.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Balance chip — only when logged in, desktop only */}
          {user && (
            <button
              onClick={onProfileClick}
              className="hidden items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 transition-colors hover:border-primary/50 md:flex"
              aria-label="Xem số dư"
            >
              <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
              <div className="leading-tight text-left">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Số dư</p>
                <p className="font-mono text-sm font-semibold text-foreground">{formatVND(balance)}</p>
              </div>
            </button>
          )}

          {/* Cart */}
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full border-border bg-transparent"
            onClick={onCartClick}
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="h-4 w-4" />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {items.length > 9 ? "9+" : items.length}
              </span>
            )}
          </Button>

          {/* Profile / Login */}
          {user ? (
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 transition-colors hover:border-primary/50"
              aria-label="Hồ sơ"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? "Avatar"}
                  referrerPolicy="no-referrer"
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="hidden max-w-[80px] truncate text-sm font-medium md:inline">
                {user.displayName?.split(" ").pop()}
              </span>
            </button>
          ) : (
            <Button
              variant="outline"
              className="hidden gap-1.5 rounded-full border-border bg-transparent md:inline-flex"
              onClick={onLoginClick}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Đăng nhập
            </Button>
          )}

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            aria-label="Mở menu"
            onClick={user ? onProfileClick : onLoginClick}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}
