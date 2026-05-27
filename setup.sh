#!/usr/bin/env bash
# ============================================================================
# setup.sh — Bootstrap del proyecto "Generador de Excusas" (2do parcial ICS)
# ----------------------------------------------------------------------------
# Este script reproduce todos los pasos del plan original sin tener que
# correr `create-next-app` (todos los archivos ya están versionados en este
# repo). Solo instala dependencias, ejecuta lint/test/build, levanta dev y
# corre los E2E.
#
# Uso:
#   bash setup.sh             # corre TODO (install + lint + test + build + e2e)
#   bash setup.sh install     # solo dependencias
#   bash setup.sh verify      # lint + test + build (sin e2e)
#   bash setup.sh e2e         # solo playwright (asume deps ya instaladas)
#   bash setup.sh docker      # levanta el stack de dev en docker-compose
# ============================================================================

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { printf "${BLUE}[setup]${NC} %s\n" "$*"; }
ok()   { printf "${GREEN}[ok]${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}[warn]${NC} %s\n" "$*"; }
err()  { printf "${RED}[err]${NC} %s\n" "$*" >&2; }

# Detectar sistema operativo para Playwright
IS_WINDOWS=false
case "${OSTYPE:-}" in
  msys*|cygwin*|win32*) IS_WINDOWS=true ;;
esac
if [[ -z "${OSTYPE:-}" ]] && [[ "$(uname -s 2>/dev/null || echo)" =~ MINGW|MSYS|CYGWIN ]]; then
  IS_WINDOWS=true
fi

# ----------------------------------------------------------------------------
# Steps
# ----------------------------------------------------------------------------

install_deps() {
  log "Instalando dependencias con npm install..."
  npm install
  ok "Dependencias instaladas."
}

run_lint() {
  log "Corriendo ESLint (next lint)..."
  npm run lint
  ok "Lint pasó sin errores."
}

run_unit_tests() {
  log "Corriendo unit tests con Jest..."
  npm test
  ok "Unit tests pasaron."
}

run_build() {
  log "Compilando con next build..."
  npm run build
  ok "Build exitoso."
}

install_playwright_browsers() {
  log "Instalando navegadores de Playwright (solo Chromium)..."
  if [[ "$IS_WINDOWS" == "true" ]]; then
    # En Windows, --with-deps no aplica (es Linux-only)
    npx playwright install chromium
  else
    npx playwright install --with-deps chromium
  fi
  ok "Playwright Chromium instalado."
}

run_e2e() {
  log "Corriendo E2E tests (Playwright)..."
  log "El config va a levantar 'npm run dev' automáticamente si BASE_URL no está seteado."
  npx playwright test
  ok "E2E tests pasaron."
}

smoke_dev() {
  log "Smoke test: levantando 'npm run dev' por 15 segundos para verificar arranque..."
  npm run dev &
  local dev_pid=$!
  sleep 15
  if curl -fs http://localhost:3000 > /dev/null 2>&1; then
    ok "Dev server responde en http://localhost:3000"
  else
    warn "No se pudo curl localhost:3000 (puede ser normal si Turbopack está compilando)"
  fi
  kill "$dev_pid" 2>/dev/null || true
  wait "$dev_pid" 2>/dev/null || true
}

up_docker() {
  log "Levantando stack de desarrollo con docker compose..."
  docker compose up --build
}

# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------

main() {
  local cmd="${1:-all}"

  case "$cmd" in
    install)
      install_deps
      ;;
    verify)
      install_deps
      run_lint
      run_unit_tests
      run_build
      ;;
    e2e)
      install_playwright_browsers
      run_e2e
      ;;
    docker)
      up_docker
      ;;
    all|"")
      log "==> Setup completo del proyecto"
      install_deps
      run_lint
      run_unit_tests
      run_build
      install_playwright_browsers
      run_e2e
      ok "Todo verde. El proyecto está listo."
      cat <<EOF

╔════════════════════════════════════════════════════════════════════╗
║ Próximos pasos                                                     ║
╠════════════════════════════════════════════════════════════════════╣
║ 1. npm run dev               → levanta la app en localhost:3000    ║
║ 2. docker compose up         → mismo, pero containerizado          ║
║ 3. git init && git add -A    → cuando quieras versionar            ║
║                                                                    ║
║ Pendientes del pipeline (ver .github/workflows/ci.yml):            ║
║   - SonarCloud (code quality gate)                                 ║
║   - Snyk (vulnerability scan)                                      ║
║   - Vercel deploy on main                                          ║
║   - Playwright E2E contra el deploy preview                        ║
╚════════════════════════════════════════════════════════════════════╝
EOF
      ;;
    *)
      err "Comando desconocido: $cmd"
      echo "Uso: bash setup.sh [all|install|verify|e2e|docker]"
      exit 1
      ;;
  esac
}

main "$@"
