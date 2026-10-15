import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContentBlockImageLeft } from "@/components/content-block-image-left"
import {
  getLandeigenaarAanbod,
  type AanbodStatus,
  type LandeigenaarPerceel,
} from "@/lib/landeigenaar"

export const metadata: Metadata = {
  title: "Aanbod | Bakker Rentmeesters",
  description:
    "Actueel aanbod van LandEigenaar: percelen agrarische grond, bos en natuur in heel Nederland.",
}

const statusLabels: Record<AanbodStatus, string> = {
  "te-koop": "Te koop",
  verkocht: "Verkocht",
  "verkocht-onder-voorbehoud": "Verkocht onder voorbehoud",
}

const PLACEHOLDER_IMAGE = "/placeholder.svg"

function AanbodCard({ item }: { item: LandeigenaarPerceel }) {
  const statusLabel = statusLabels[item.status]
  return (
    <ContentBlockImageLeft
      imageSrc={item.image ?? PLACEHOLDER_IMAGE}
      imageAlt={item.title}
      title={item.title}
      points={item.points}
      linkHref={item.externalUrl}
      linkLabel="Bekijk op LandEigenaar.nl"
      statusLabel={statusLabel}
      statusTone={item.status}
      fullCardLink
      external
    />
  )
}

export default async function AanbodPage() {
  const items = await getLandeigenaarAanbod()

  return (
    <main className="min-h-screen bg-transparent">
      <Navigation />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:p-8">
            <h1 className="font-serif text-4xl font-bold text-foreground">
              Aanbod
            </h1>
            <p className="mt-2 text-muted-foreground">
              Actueel aanbod van LandEigenaar: percelen agrarische grond, bos
              en natuur. Klik op een perceel voor alle details op
              LandEigenaar.nl.
            </p>
          </div>

          <ul className="mt-10 flex flex-col gap-6 list-none p-0 m-0">
            {items.map((item) => (
              <li key={item.id}>
                <AanbodCard item={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </main>
  )
}
