import { Timer } from "lucide-react"
import { dealGames, formatVND } from "@/lib/games"

export function DealsRail() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
      <div className="flex items-center gap-2">
        <Timer className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Giảm giá mạnh nhất hôm nay
        </h2>
      </div>

      <ul className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
        {dealGames.map((game) => (
          <li
            key={game.appid}
            className="group w-[248px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60 md:w-[272px]"
          >
            <div className="relative aspect-[460/215] overflow-hidden bg-secondary">
              <img
                src={game.header || "/placeholder.svg"}
                alt={`Ảnh game ${game.title}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute right-2 top-2 rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground">
                -{game.discount}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{game.title}</p>
              <div className="shrink-0 text-right leading-tight">
                <p className="font-mono text-[11px] text-muted-foreground line-through">
                  {formatVND(game.originalPrice)}
                </p>
                <p className="font-mono text-sm font-bold text-primary">
                  {formatVND(game.price)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
