# Generador de Excusas para no entregar el TP

App académica para el **2do parcial de Integración y Entrega continua(ICS)** —
UTN, Ingeniería en Sistemas. El foco no es la app sino el **pipeline de CI/CD**
que la rodea.

La app es deliberadamente chica: un botón que pide una excusa random a un
endpoint y la muestra con un badge de severidad. Las excusas tienen humor de
programador y ciberseguridad mezclados.

## Stack

| Capa | Herramienta | Rol en el pipeline |
|------|-------------|--------------------|
| Framework | Next.js 15 + App Router + Turbopack | Build artifact |
| Lenguaje | TypeScript (strict) | Type safety en CI |
| Validación | Zod | Schema compartido entre runtime, tests unit y E2E |
| Linter | ESLint (`eslint-config-next`) | Gate de estilo en CI |
| Formatter | Prettier | Pre-commit / format check |
| Unit tests | Jest + `next/jest` + Testing Library | Quality gate en CI |
| E2E | Playwright (Chromium) | Smoke contra deploy preview (pendiente) |
| Container | Docker multi-stage + docker-compose | Reproducibilidad local |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | Orquestador |
| Security | Snyk (pendiente) | Vulnerability scan en CI |
| Quality | SonarCloud (pendiente) | Code quality gate en CI |
| Deploy | Vercel + CLI oficial | CD on push to `main` |

## Cómo correr en local

### Con npm

```bash
npm install
npm run dev          # http://localhost:3000
```

### Con Docker

```bash
docker compose up --build   # http://localhost:3000 con hot-reload
```

### Con el script todo-en-uno

```bash
bash setup.sh        # install + lint + test + build + playwright e2e
bash setup.sh verify # solo lint + test + build
bash setup.sh e2e    # solo playwright
```

## Tests

### Unitarios (Jest)

```bash
npm test
npm run test:watch
npm run test:coverage
```

Suite en [tests/unit/excuse.service.test.ts](tests/unit/excuse.service.test.ts):
valida el catálogo entero contra el schema, hace 50 iteraciones de
`getRandomExcuse()` y chequea el enum de severity.

### End-to-end (Playwright)

```bash
npx playwright install chromium      # primera vez
npm run e2e                          # corre los tests
npm run e2e:ui                       # modo UI
BASE_URL=https://tu-deploy.vercel.app npm run e2e   # contra el deploy
```

Suite en [e2e/excuse.spec.ts](e2e/excuse.spec.ts): home carga, click muestra
excusa, API responde JSON válido contra `ExcuseSchema`.

## Estructura del proyecto

```
.
├── .github/workflows/ci.yml      # CI base (lint + test + build + TODOs)
├── .claude/settings.json         # Config del agent harness
├── Dockerfile                    # Multi-stage (deps, dev, build, runner)
├── docker-compose.yml            # Dev local con hot-reload
├── setup.sh                      # Script bootstrap
├── CLAUDE.md                     # Guía para futuras sesiones con Claude
├── jest.config.mjs               # next/jest preset
├── playwright.config.ts          # Chromium, BASE_URL desde env
├── e2e/
│   └── excuse.spec.ts            # 3 tests E2E
├── tests/unit/
│   └── excuse.service.test.ts    # 3 tests unitarios
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── api/excuse/route.ts   # GET → excusa random
    ├── components/
    │   └── ExcuseGenerator.tsx   # Client component con botón + badge
    └── lib/
        ├── excuse.schema.ts      # Zod schema + tipo
        └── excuse.service.ts     # Catálogo + helpers
```

## Roadmap

Lo que falta para completar el pipeline (cada uno es un prompt aparte):

- [ ] **SonarCloud** — alta del proyecto, `sonar-project.properties`, workflow
      step con `SonarSource/sonarcloud-github-action` y `SONAR_TOKEN` secret.
      Configurar quality gate (coverage mínima, no new bugs/code smells).
- [ ] **Snyk** — alta de cuenta, `SNYK_TOKEN` secret, step con
      `snyk/actions/node` antes del build. Tener en mente las
      vulnerabilidades de Next 15 / React 19 todavía recientes.
- [x] **Vercel deploy** — `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
      secrets en GitHub. Job `deploy` con Vercel CLI oficial (`vercel@latest`).
      Output del job = URL de producción. `next.config.ts` condiciona
      `output: 'standalone'` para que Docker siga funcionando.
- [ ] **Playwright en CI** — job `e2e` que dependa de `deploy`, instala
      Chromium, corre con `BASE_URL=$preview-url`, sube `playwright-report/`
      como artifact.

Todos los hooks están comentados como `# TODO:` en
[.github/workflows/ci.yml](.github/workflows/ci.yml).

## Convenciones

- **Código** (variables, funciones, archivos, comentarios): inglés.
- **UI y textos de excusas**: español argentino, humor mezclado de
  programador y ciberseguridad.
- **Commits**: conventional commits en inglés (`feat:`, `fix:`, `chore:`,
  `test:`, `docs:`, `ci:`).
- **TypeScript strict mode** activado, sin `any` salvo justificación.

## Licencia

Académico, sin licencia formal.
