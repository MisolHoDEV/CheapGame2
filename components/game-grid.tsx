"use client"

import { useMemo, useState } from "react"
import { Flame, SearchX } from "lucide-react"
import { games, categories, type Game } from "@/lib/games"
import { GameCard } from "@/components/game-card"

type SortKey = "popular" | "discount" | "price-asc" | "price-desc"

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Đánh giá cao" },
  { key: "discount", label: "Giảm nhiều" },
  { key: "price-asc", label: "Giá thấp → cao" },
  { key: "price-desc", label: "Giá cao → thấp" },
]

type Props = {
  query?: string
  onOpenDetail: (game: Game) => void
  onRequireLogin: () => void
}

export function GameGrid({ query = "", onOpenDetail, onRequireLogin }: Props) {
  const [active, setActive] = useState("Tất cả")
  const [sort, setSort] = useState<SortKey>("popular")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = games.filter((g) => {
      const matchGenre = active === "Tất cả" || g.genres.includes(active)
      const matchQuery = !q || g.title.toLowerCase().includes(q)
      return matchGenre && matchQuery
    })

    return list.sort((a, b) => {
      if (sort === "discount") return b.discount - a.discount
      if (sort === "price-asc") return a.price - b.price
      if (sort === "price-desc") return b.price - a.price
      return (b.metacritic ?? 0) - (a.metacritic ?? 0)
    })
  }, [active, sort, query])

  return (
    <section id="store" className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="size-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold tracking-tight md:text-2xl">
              Kho game ({visible.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs text-muted-foreground">
              Sắp xếp
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Lọc theo thể loại"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active === cat}
              onClick={() => setActive(cat)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/50 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold">Không tìm thấy game phù hợp</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Thử đổi thể loại hoặc từ khoá tìm kiếm khác.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6">
          {visible.map((game) => (
            <GameCard
              key={game.appid}
              game={game}
              onOpenDetail={onOpenDetail}
              onRequireLogin={onRequireLogin}
            />
          ))}
        </div>
      )}
    </section>
  )
}
