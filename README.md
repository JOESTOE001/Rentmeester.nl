# Rentmeester

Website voor het tonen en beheren van vastgoedaanbod (percelen, bouwkavels, woningen).

## Tech stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS**
- **TypeScript**
- Aanbod: live uit de LandEigenaar API (`lib/landeigenaar.ts`, opgehaald tijdens de build)
- Overige content: Markdown in `content/`

## Projectstructuur

```text
/
├── src/
│   ├── app/              # Next.js App Router (aanbod, projecten, etc.)
│   ├── components/       # UI-componenten
│   └── lib/              # Utilities en helpers (o.a. landeigenaar.ts)
├── content/              # Markdown-content (projecten e.d.)
├── scripts/              # Scrape-scripts (projecten)
└── public/
```

## Commando’s

| Commando | Actie |
|----------|--------|
| `npm install` | Installeert dependencies |
| `npm run dev` | Start dev-server op `localhost:3000` |
| `npm run build` | Bouwt productie-build |
| `npm run start` | Start productieserver |
| `npm run scrape-projecten` | Scraped projecten (script) |
| `npm run lint` | Voert ESLint uit |

## Ontwikkeling

1. Clone de repository.
2. `npm install`
3. `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000).

## Deploy op de server

Zodat de live site overeenkomt met lokaal: bouw en start **altijd vanuit de projectroot** en deploy de **volledige** projectmap (inclusief `content/`, `data/`, `lib/`). Zie **[DEPLOY.md](./DEPLOY.md)** voor details.
