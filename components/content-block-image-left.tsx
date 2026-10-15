import Image from "next/image"
import Link from "next/link"

export interface ContentBlockImageLeftProps {
  /** Afbeelding: pad vanaf public, bijv. /images/aanbod/bantega.jpg */
  imageSrc: string
  imageAlt: string
  /** Titel (wordt in groen, vet, hoofdletters getoond) */
  title: string
  /** Korte beschrijving */
  excerpt?: string
  /** Feiten als opsomming, in plaats van lopende tekst. */
  points?: string[]
  /** Link naar detailpagina (bijv. /aanbod/[slug]) */
  linkHref: string
  linkLabel?: string
  /** Optioneel: statuslabel (bijv. "Te koop") */
  statusLabel?: string
  /** Kleur van het statuslabel. */
  statusTone?: "te-koop" | "verkocht-onder-voorbehoud" | "verkocht"
  /** Optioneel: extra regel tekst */
  extra?: string
  /** Maakt de volledige tegel klikbaar in plaats van alleen de tekstlink. */
  fullCardLink?: boolean
  /** Opent de link in een nieuw tabblad (voor externe URL's). */
  external?: boolean
}

export function ContentBlockImageLeft({
  imageSrc,
  imageAlt,
  title,
  excerpt,
  points,
  linkHref,
  linkLabel = "Lees meer...",
  statusLabel,
  statusTone,
  extra,
  fullCardLink = false,
  external = false,
}: ContentBlockImageLeftProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {}
  const cardClassName =
    "group relative block overflow-hidden rounded-xl border border-border bg-card py-8 px-6 shadow-sm transition-all duration-300 lg:px-10 lg:py-10"

  const content = (
    <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
      {/* Links: afbeelding */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 40vw"
        />
      </div>

      {/* Rechts: tekst */}
      <div className="flex min-w-0 flex-col justify-center">
        {statusLabel && (
          <span
            className={`mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-medium ${
              statusTone === "te-koop"
                ? "bg-accent text-accent-foreground"
                : statusTone === "verkocht-onder-voorbehoud"
                  ? "bg-muted text-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {statusLabel}
          </span>
        )}
        <h2 className="font-sans text-lg font-bold uppercase tracking-wide text-accent lg:text-xl">
          {title}
        </h2>
        {points && points.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-relaxed text-foreground marker:text-accent">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : (
          excerpt && (
            <p className="mt-3 text-base leading-relaxed text-foreground">
              {excerpt}
            </p>
          )
        )}
        {extra && <p className="mt-1 text-sm text-muted-foreground">{extra}</p>}
        {fullCardLink ? (
          <span className="mt-4 inline-flex items-center text-sm font-medium text-primary underline decoration-dotted underline-offset-2 group-hover:text-accent">
            {linkLabel}
          </span>
        ) : (
          <Link
            href={linkHref}
            {...externalProps}
            className="mt-4 inline-flex items-center text-sm font-medium text-primary underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  )

  if (fullCardLink) {
    return (
      <Link
        href={linkHref}
        {...externalProps}
        className={`${cardClassName} hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
      >
        {content}
      </Link>
    )
  }

  return <section className={cardClassName}>{content}</section>
}
