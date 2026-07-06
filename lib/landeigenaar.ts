const API_URL = "https://landeigenaar.nl/api/properties/?provider=LandEigenaar"

export type AanbodStatus = "te-koop" | "verkocht" | "verkocht-onder-voorbehoud"

export interface LandeigenaarPerceel {
  id: number
  title: string
  location: string
  province: string
  excerpt: string
  /** Bijv. "0,067 ha · € 3.750" */
  extra: string
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

function formatArea(area: string | null): string | null {
  if (!area) return null
  const ha = Number.parseFloat(area)
  if (!Number.isFinite(ha) || ha <= 0) return null
  return `${ha.toLocaleString("nl-NL", { maximumFractionDigits: 4 })} ha`
}

function formatPrice(price: number | null, priceDesc: string | null): string | null {
  if (price && price > 0) {
    return `€ ${price.toLocaleString("nl-NL")}`
  }
  return priceDesc || null
}

/** Strip HTML-tags uit manual_description voor een korte kaarttekst. */
function toExcerpt(html: string | null, maxLength = 180): string {
  if (!html) return ""
  const text = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`
}

function mapProperty(item: ApiProperty): LandeigenaarPerceel {
  const parts = [formatArea(item.area), formatPrice(item.price, item.price_desc)]
  const provinceName = item.province ? PROVINCE_NAMES[item.province] ?? item.province : ""

  return {
    id: item.id,
    title: item.title,
    location: item.location ?? "",
    province: provinceName,
    excerpt: toExcerpt(item.manual_description),
    extra: parts.filter(Boolean).join(" · "),
    status: STATUS_MAP[item.status] ?? "te-koop",
    image: item.image_urls?.[0] ?? item.image_url ?? null,
    externalUrl: `https://landeigenaar.nl/perceel/${item.id}`,
  }
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
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(
        `LandEigenaar API gaf status ${res.status} voor ${url}. Build afgebroken.`
      )
    }
    const data = (await res.json()) as ApiResponse
    items.push(...data.results)
    url = data.next
  }

  return items
    .filter((item) => item.is_active !== false)
    .map(mapProperty)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
}
