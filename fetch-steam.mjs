import fs from "node:fs"

const APPIDS = [
  1091500, 1245620, 292030, 1086940, 3240220, 2050650, 1145360, 1623730,
  1903340, 413150, 105600, 367520, 1030300, 2246340, 1966720, 1868140,
  1237970, 1657630, 1817230, 782330, 1244460, 1332010, 2379780, 108600,
  1364780, 2074920, 524220, 275850, 588650, 646570, 1229490, 1149460,
  1172380, 1817070,
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const out = []

for (const id of APPIDS) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${id}&cc=vn&l=vietnamese&filters=basic,price_overview,genres,release_date,metacritic`
    const res = await fetch(url)
    const json = await res.json()
    const entry = json?.[String(id)]
    if (!entry?.success) {
      console.error("FAIL", id)
      await sleep(400)
      continue
    }
    const d = entry.data
    if (d.type !== "game" || !d.price_overview) {
      console.error("SKIP", id, d.name, d.type, !!d.price_overview)
      await sleep(400)
      continue
    }
    out.push({
      appid: id,
      title: d.name,
      short: d.short_description || "",
      genres: (d.genres || []).map((g) => g.description),
      price: Math.round(d.price_overview.final / 100),
      originalPrice: Math.round(d.price_overview.initial / 100),
      discount: d.price_overview.discount_percent,
      metacritic: d.metacritic?.score ?? null,
      releaseDate: d.release_date?.date ?? "",
      header: d.header_image,
      portrait: `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`,
      hero: `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_hero.jpg`,
      logo: `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/logo.png`,
    })
    console.error("OK", id, d.name, d.price_overview.final_formatted)
  } catch (e) {
    console.error("ERR", id, e.message)
  }
  await sleep(400)
}

fs.writeFileSync("lib/steam-games.json", JSON.stringify(out, null, 2))
console.error("TOTAL", out.length)
