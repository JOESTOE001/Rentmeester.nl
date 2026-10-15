import { get } from "node:https"

const API_URL = "https://landeigenaar.nl/api/properties/?provider=LandEigenaar"

export type AanbodStatus = "te-koop" | "verkocht" | "verkocht-onder-voorbehoud"

export interface LandeigenaarPerceel {
  id: number
  title: string
  location: string
  province: string
  /** Korte feiten voor op de kaart, als opsomming. */
  points: string[]
  status: AanbodStatus
  image: string | null
  /** Detailpagina op landeigenaar.nl (openen in nieuw tabblad) */
  externalUrl: string
}

interface ApiProperty {
  id: number
  provider_name: string
  title: string
  location: string | null
  price: number | null
  price_desc: string | null
  area: string | null
  status: string
  image_url: string | null
  image_urls: string[] | null
  province: string | null
  is_active: boolean
  manual_description: string | null
  bestemming_naam: string | null
  updated_at: string | null
  is_hidden?: boolean
}

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: ApiProperty[]
}

const PROVINCE_NAMES: Record<string, string> = {
  DR: "Drenthe",
  FL: "Flevoland",
  FR: "Friesland",
  GE: "Gelderland",
  GR: "Groningen",
  LB: "Limburg",
  NB: "Noord-Brabant",
  NH: "Noord-Holland",
  OV: "Overijssel",
  UT: "Utrecht",
  ZE: "Zeeland",
  ZH: "Zuid-Holland",
}

const STATUS_MAP: Record<string, AanbodStatus> = {
  te_koop: "te-koop",
  verkocht: "verkocht",
  verkocht_onder_voorbehoud: "verkocht-onder-voorbehoud",
}

const STATUS_ORDER: Record<AanbodStatus, number> = {
  "te-koop": 0,
  "verkocht-onder-voorbehoud": 1,
  verkocht: 2,
}

/** Kadastrale notatie: hectare.are.centiare, bijv. 1,981 ha → 1.98.10 ha. */
function formatArea(area: string | null): string | null {
  if (!area) return null
  const ha = Number.parseFloat(area)
  if (!Number.isFinite(ha) || ha <= 0) return null
  const totalCentiare = Math.round(ha * 10000)
  const hectares = Math.floor(totalCentiare / 10000)
  const ares = Math.floor((totalCentiare % 10000) / 100)
  const centiare = totalCentiare % 100
  const pad = (value: number) => value.toString().padStart(2, "0")
  return `${hectares}.${pad(ares)}.${pad(centiare)} ha`
}

function formatPrice(price: number | null, priceDesc: string | null): string | null {
  if (price && price > 0) {
    return `€ ${price.toLocaleString("nl-NL")}`
  }
  return priceDesc || null
}

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&euro;/gi, "€")
    .replace(/&sup2;/gi, "²")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/gi, "&")
}

function plainText(html: string): string {
  return decodeHtml(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
}

/** Kenmerken uit de beschrijving: <li>-items, anders regels die met een streepje beginnen. */
function extractFeatureBullets(html: string | null): string[] {
  if (!html) return []

  const listItems = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => plainText(match[1]))
    .filter(Boolean)
  if (listItems.length > 0) return listItems

  const lines = decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .split("\n")
    .map((line) => line.trim())

  return lines
    .filter((line) => /^[-•–]\s+\S/.test(line))
    .map((line) => line.replace(/^[-•–]\s+/, "").trim())
    .filter(Boolean)
}

function mentionsPrice(text: string): boolean {
  return /vraagprijs|prijs op aanvraag|€|\beur\b/i.test(text)
}

function mentionsArea(text: string): boolean {
  return /oppervlakte|\bha\b|m²|m2/i.test(text)
}

const MAX_POINTS = 8

function uniquePoints(points: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const point of points) {
    const key = point.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(point)
    if (result.length >= MAX_POINTS) break
  }
  return result
}

function toPoints(item: ApiProperty, provinceName: string): string[] {
  const area = formatArea(item.area)
  const price = formatPrice(item.price, item.price_desc)
  const features = extractFeatureBullets(item.manual_description)
  const featureText = features.join(" ")

  if (features.length > 0) {
    const points: string[] = []
    if (area && !mentionsArea(featureText)) points.push(area)
    if (price && !mentionsPrice(featureText)) points.push(price)
    points.push(...features)
    return uniquePoints(points)
  }

  const location = [item.location, provinceName].filter(Boolean).join(", ")
  const bestemming = item.bestemming_naam?.trim() || ""
  return uniquePoints(
    [area, price, bestemming, location].filter((point): point is string => Boolean(point))
  )
}

function mapProperty(item: ApiProperty): LandeigenaarPerceel {
  const provinceName = item.province ? PROVINCE_NAMES[item.province] ?? "" : ""

  return {
    id: item.id,
    title: item.title,
    location: item.location ?? "",
    province: provinceName,
    points: toPoints(item, provinceName),
    status: STATUS_MAP[item.status] ?? "te-koop",
    image: item.image_urls?.[0] ?? item.image_url ?? null,
    externalUrl: `https://landeigenaar.nl/perceel/${item.id}`,
  }
}

/** Node-https, niet de gecachte Next-fetch: die maakt /aanbod dynamisch en breekt de statische export. */
function fetchJson(url: string): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const req = get(url, (res) => {
      const status = res.statusCode ?? 0
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume()
        const nextUrl = new URL(res.headers.location, url).href
        resolve(fetchJson(nextUrl))
        return
      }
      if (status < 200 || status >= 300) {
        res.resume()
        reject(new Error(`LandEigenaar API gaf status ${status} voor ${url}. Build afgebroken.`))
        return
      }
      const chunks: Buffer[] = []
      res.on("data", (chunk: Buffer) => chunks.push(chunk))
      res.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) as ApiResponse)
        } catch (error) {
          reject(error)
        }
      })
    })
    req.on("error", reject)
  })
}

/**
 * Haalt het volledige LandEigenaar-aanbod op (alle pagina's).
 * Draait tijdens de build (statische export); bij een API-fout faalt de
 * build zodat de laatst gedeployde versie online blijft.
 */
export async function getLandeigenaarAanbod(): Promise<LandeigenaarPerceel[]> {
  const items: ApiProperty[] = []
  let url: string | null = API_URL

  while (url) {
    const data = await fetchJson(url)
    items.push(...data.results)
    url = data.next
  }

  return items
    .filter((item) => item.is_active !== false && !item.is_hidden)
    .sort((a, b) => {
      const statusDelta =
        STATUS_ORDER[STATUS_MAP[a.status] ?? "te-koop"] -
        STATUS_ORDER[STATUS_MAP[b.status] ?? "te-koop"]
      if (statusDelta !== 0) return statusDelta
      return (b.updated_at ?? "").localeCompare(a.updated_at ?? "")
    })
    .map(mapProperty)
}
