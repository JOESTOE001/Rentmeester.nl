# Aanbod: automatisch via de LandEigenaar API

Het aanbod op `/aanbod` wordt **niet meer handmatig beheerd**. Er zijn geen .md-bestanden of indexbestanden meer voor percelen.

## Hoe het werkt

- Tijdens de **build** haalt `lib/landeigenaar.ts` het volledige aanbod op van:
  `https://landeigenaar.nl/api/properties/?provider=LandEigenaar`
- Elke kaart op `/aanbod` linkt (in een nieuw tabblad) naar de detailpagina op landeigenaar.nl: `https://landeigenaar.nl/perceel/{id}`
- Afbeeldingen worden rechtstreeks vanaf landeigenaar.nl geladen.
- Percelen "te koop" staan bovenaan; verkochte percelen onderaan.

## Aanbod verversen

Het aanbod is zo actueel als de laatste build:

- **Automatisch:** de GitHub Actions-workflow (`.github/workflows/deploy.yml`) bouwt en deployt de site dagelijks via een `schedule`-trigger.
- **Handmatig:** start de workflow via *Actions → Deploy to GitHub Pages → Run workflow*, of push een commit naar `main`.

## Aanbod wijzigen

Wijzigingen in het aanbod (nieuwe percelen, prijzen, status verkocht) doe je in het **beheer van landeigenaar.nl**. Bij de eerstvolgende build verschijnen ze automatisch op rentmeester.nl.
