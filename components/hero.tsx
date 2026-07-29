"use client"

import { useState } from "react"
import { Star, Zap, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { featuredGames, formatVND } from "@/lib/games"

export function Hero() {
  const [index, setIndex] = useState(0)
  const game = featuredGames[index]

  if (!game) return null

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6 md:pt-8">
      <div className="relative overflow-hidden rounded-3xl border border-border">
        <img
          key={game.appid}
          src={game.hero || "/placeholder.svg"}
          alt={`Ảnh nền game ${game.title}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative flex min-h-[380px] flex-col justify-end gap-4 p-6 md:min-h-[460px] md:max-w-2xl md:p-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="size-3.5" aria-hidden="true" />
            Ưu đãi nổi bật · giảm {game.discount}%
          </span>

          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-glow md:text-5xl">
            {game.title}
          </h1>

          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            {game.short}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {game.rating !== null && (
              <span className="flex items-center gap-1 font-medium text-primary">
                <Star className="size-4 fill-current" aria-hidden="true" />
                {game.rating}
                <span className="text-muted-foreground">
                  (Metacritic {game.metacritic})
                </span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              {game.releaseDate}
            </span>
            <span className="text-muted-foreground">{game.genres.join(" · ")}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button size="lg" className="rounded-full font-semibold glow-neon">
              Mua ngay · {formatVND(game.price)}
            </Button>
            <span className="font-mono text-sm text-muted-foreground line-through">
              {formatVND(game.originalPrice)}
            </span>
          </div>

          <div className="flex gap-2 pt-2" role="tablist" aria-label="Chọn game nổi bật">
            {featuredGames.map((g, i) => (
              <button
                key={g.appid}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={g.title}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-primary" : "w-4 bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
