#!/usr/bin/env bash
# ============================================================================
# setup.sh — Bootstrap del proyecto "Generador de Excusas" (2do parcial ICS)
# ----------------------------------------------------------------------------
# Este script reproduce todos los pasos del plan original sin tener que
# correr `create-next-app` (todos los archivos ya están versionados en este
# repo). Solo instala dependencias, ejecuta lint/test/build.
#
# Uso:
#   bash setup.sh             # corre TODO (install + lint + test + build)
#   bash setup.sh install     # solo dependencias
#   bash setup.sh verify      # lint + test + build
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
    docker)
      up_docker
      ;;
    all|"")
      log "==> Setup completo del proyecto"
      install_deps
      run_lint
      run_unit_tests
      run_build
      ok "Todo verde. El proyecto está listo."
      cat <<EOF

╔════════════════════════════════════════════════════════════════════╗
║ Próximos pasos                                                     ║
╠════════════════════════════════════════════════════════════════════╣
║ 1. npm run dev               → levanta la app en localhost:3000    ║
║ 2. docker compose up         → mismo, pero containerizado          ║
║ 3. git init && git add -A    → cuando quieras versionar            ║
║                                                                    ║
║ Pipeline (ver .github/workflows/):                                 ║
║   - CI: lint + test + build + SonarCloud                           ║
║   - Deploy: Vercel vía GitHub Actions on main                      ║
╚════════════════════════════════════════════════════════════════════╝
EOF
      ;;
    *)
      err "Comando desconocido: $cmd"
      echo "Uso: bash setup.sh [all|install|verify|docker]"
      exit 1
      ;;
  esac
}

main "$@"
