# Deploy op de server (landgoedeigenaar.nl)

Zodat de site op de server **hetzelfde** is als lokaal, moet het volgende kloppen.

## 1. Alles bouwen en starten vanuit de projectroot

De app leest content en data **ten opzichte van de map waar je het commando uitvoert** (`process.cwd()`).

- **Build:** altijd in de projectroot: `npm run build`
- **Start:** altijd in dezelfde projectroot: `npm run start` (of `npm start`)

Als je bijvoorbeeld alleen de map `.next` naar de server kopieert en daar `next start` draait, ontbreekt de map `content/` en zul je een andere (lege) site zien.

## 2. Deze mappen en bestanden moeten op de server staan

Zorg dat op de server (bijv. `/var/www/rentmeester`) **de volledige projectstructuur** aanwezig is:

| Nodig voor de site |
|--------------------|
| `content/` (markdown-content, bijv. projecten) |
| `data/` (o.a. `projecten.ts`, `nieuws.ts`) |
| `lib/` (o.a. `landeigenaar.ts`) |
| `public/` (favicon, logo’s, placeholder.svg) |
| `src/` (alle app- en componentcode) |
| `package.json`, `next.config.mjs`, `postcss.config.mjs`, `tsconfig.json` |
| `node_modules/` (na `npm install`) |
| `.next/` (na `npm run build`) |

Dus: **niet** alleen `.next` + `node_modules` deployen; ook `content/`, `data/`, `lib/` en de rest van de repo.

**Verwachte boom** (projectroot = bijv. `/var/www/rentmeester`): naast `src/` moeten op hetzelfde niveau staan: `content/`, `data/`, `lib/`, `components/`, `hooks/`, `public/`, `scripts/`. De tsconfig heeft `"@/*": ["./*"]`, dus `@/data` = `./data`, `@/lib` = `./lib`, etc.

**Structuur controleren op de server:**
```bash
cd /var/www/rentmeester
chmod +x scripts/verify-deploy-structure.sh
./scripts/verify-deploy-structure.sh
```
Het script meldt "OK" of "ONVOLLEDIG" en wat er ontbreekt.

## 3. Build-check

Het aanbod op `/aanbod` wordt tijdens `npm run build` opgehaald uit de LandEigenaar API. Als de API niet bereikbaar is, faalt de build; de laatst gedeployde versie blijft dan online.

## 4. Typische deploy-stappen op de server

```bash
# In de projectmap (bijv. /var/www/rentmeester)
cd /var/www/rentmeester
git pull   # of bestanden op een andere manier updaten

npm ci
npm run build   # faalt als de LandEigenaar API niet bereikbaar is
npm run start   # of: pm2 start npm --name "rentmeester" -- start
```

Nginx proxy naar `http://127.0.0.1:3000` (zoals in je bestaande config) is voldoende.

## 5. Als de site toch anders is dan lokaal

Controleer:

1. **Zelfde code:** zelfde branch/commit als lokaal?
2. **Zelfde map:** wordt `npm run build` en `npm run start` uitgevoerd in de map waar ook `content/`, `data/` en `lib/` staan?
3. **API bereikbaar:** kan de server `https://landeigenaar.nl/api/properties/` bereiken tijdens de build?
4. **Geen oude cache:** eventueel `rm -rf .next` en opnieuw `npm run build`.

Als dit allemaal klopt, zou de site op de server hetzelfde moeten zijn als lokaal.
