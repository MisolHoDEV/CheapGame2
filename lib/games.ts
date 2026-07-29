import raw from "./steam-games.json"

export type SteamGame = {
  appid: number
  title: string
  short: string
  genres: string[]
  price: number
  originalPrice: number
  discount: number
  metacritic: number | null
  releaseDate: string
  header: string
  portrait: string
  hero: string
  logo: string
}

export type Game = Omit<SteamGame, "price" | "discount"> & {
  /** Giá CheapGame bán = giá hiện tại trên Steam giảm tiếp 60% */
  price: number
  /** % giảm giữa giá CheapGame bán và giá gốc bị gạch */
  discount: number
  /** Giá hiện tại đang bán trên Steam (sau ưu đãi của Steam) */
  steamPrice: number
  /** % giảm mà Steam đang áp dụng */
  steamDiscount: number
  /** Điểm đánh giá quy đổi từ Metacritic sang thang 5 sao */
  rating: number | null
  /** Nhãn nổi bật hiển thị trên thẻ game */
  tag: "Giảm sâu" | "Mới ra" | "Đề cử" | null
}

/** Mức giảm thêm CheapGame áp dụng trên giá hiện tại của Steam */
export const EXTRA_DISCOUNT = 0.6

/** Làm tròn xuống bội số 1.000₫ cho giá tiền Việt */
function roundVnd(value: number) {
  return Math.floor(value / 1000) * 1000
}

const RECENT_YEARS = ["2024", "2025", "2026"]

function isRecent(releaseDate: string) {
  return RECENT_YEARS.some((y) => releaseDate.includes(y))
}

function buildTag(g: SteamGame): Game["tag"] {
  if (g.discount >= 50) return "Giảm sâu"
  if (isRecent(g.releaseDate)) return "Mới ra"
  if ((g.metacritic ?? 0) >= 90) return "Đề cử"
  return null
}

export const games: Game[] = (raw as SteamGame[]).map((g) => {
  const sellPrice = roundVnd(g.price * (1 - EXTRA_DISCOUNT))
  const totalDiscount =
    g.originalPrice > 0
      ? Math.round((1 - sellPrice / g.originalPrice) * 100)
      : 0

  return {
    ...g,
    price: sellPrice,
    discount: totalDiscount,
    steamPrice: g.price,
    steamDiscount: g.discount,
    rating: g.metacritic ? Math.round((g.metacritic / 20) * 10) / 10 : null,
    tag: buildTag(g),
  }
})

/** Game nổi bật cho khu vực hero: giảm giá sâu nhất trong nhóm điểm cao */
export const featuredGames: Game[] = [...games]
  .filter((g) => (g.metacritic ?? 0) >= 84)
  .sort((a, b) => b.discount - a.discount)
  .slice(0, 3)

export const dealGames: Game[] = [...games]
  .filter((g) => g.discount > 0)
  .sort((a, b) => b.discount - a.discount)
  .slice(0, 6)

/** Danh sách thể loại lấy trực tiếp từ dữ liệu Steam, sắp theo số lượng game */
export const categories: string[] = [
  "Tất cả",
  ...Object.entries(
    games.reduce<Record<string, number>>((acc, g) => {
      for (const genre of g.genres) acc[genre] = (acc[genre] ?? 0) + 1
      return acc
    }, {}),
  )
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre)
    .slice(0, 7),
]

export function formatVND(value: number) {
  if (value === 0) return "Miễn phí"
  return value.toLocaleString("vi-VN") + "₫"
}

export function steamUrl(appid: number) {
  return `https://store.steampowered.com/app/${appid}/`
}
