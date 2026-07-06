#!/bin/bash
# Controleer of de projectroot (bijv. /var/www/rentmeester) goed is opgebouwd voor deploy.
# Gebruik: ./scripts/verify-deploy-structure.sh   (uitvoeren vanuit projectroot)

set -e
ROOT="${1:-.}"
cd "$ROOT"
echo "Controleren van projectroot: $(pwd)"
echo ""

MISSING=0

check_dir()  { [ -d "$1" ]  || { echo "  MISSING dir:  $1"; MISSING=1; }; }
check_file() { [ -f "$1" ] || { echo "  MISSING file: $1"; MISSING=1; }; }

echo "--- Verplichte mappen ---"
check_dir "content"
check_dir "data"
check_dir "lib"
check_dir "public"
check_dir "src"
check_dir "src/app"
check_dir "components"
check_dir "scripts"
echo ""

echo "--- Verplichte bestanden ---"
check_file "package.json"
check_file "next.config.mjs"
check_file "postcss.config.mjs"
check_file "tsconfig.json"
check_file "data/projecten.ts"
check_file "data/nieuws.ts"
check_file "lib/landeigenaar.ts"
check_file "lib/services.ts"
check_file "lib/utils.ts"
check_file "components/navigation.tsx"
check_file "components/footer.tsx"
echo ""

echo "--- Build-output (na npm run build) ---"
if [ ! -d ".next" ]; then
  echo "  .next/ ontbreekt — voer eerst 'npm run build' uit"
  MISSING=1
else
  echo "  OK: .next/ aanwezig"
fi
if [ ! -d "node_modules" ]; then
  echo "  node_modules/ ontbreekt — voer eerst 'npm install' of 'npm ci' uit"
  MISSING=1
else
  echo "  OK: node_modules/ aanwezig"
fi
echo ""

if [ "$MISSING" -eq 1 ]; then
  echo "Resultaat: ONVOLLEDIG — bovenstaande ontbreekt. Deploy kan problemen geven."
  exit 1
fi
echo "Resultaat: OK — structuur is geschikt voor deploy."
exit 0
