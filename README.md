# Generador de Excusas para no entregar el TP

App académica para el **2do parcial de Integración y Entrega continua(ICS)** —
UTN, Ingeniería en Sistemas. El foco no es la app sino el **pipeline de CI/CD**
que la rodea.

La app es deliberadamente chica: un botón que pide una excusa random a un
endpoint y la muestra con un badge de severidad. Las excusas tienen humor de
programador y ciberseguridad mezclados.

## Stack

| Capa | Herramienta | Rol en el pipeline |
|------|-------------|-----------|
| Framework | Next.js 15 + App Router + Turbopack | Build artifact |
| Lenguaje | TypeScript (strict) | Type safety en CI |
| Validación | Zod | Schema compartido entre runtime y tests unit |
| Linter | ESLint (`eslint-config-next`) | Gate de estilo en CI |
| Formatter | Prettier | Pre-commit / format check |
| Unit tests | Jest + `next/jest` + Testing Library | Quality gate en CI |
| Container | Docker multi-stage + docker-compose | Reproducibilidad local |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | Orquestador |
| Quality | SonarCloud | Quality gate + coverage analysis |
| Deploy | Vercel vía GitHub Actions (`amondnet/vercel-action`) | CD on push to `main` |

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
bash setup.sh        # install + lint + test + build
bash setup.sh verify # solo lint + test + build
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

## Estructura del proyecto

```
.
├── .github/workflows/ci.yml      # CI: lint + test + build + SonarCloud
├── .github/workflows/deploy.yml  # CD: deploy a Vercel vía GitHub Actions
├── .claude/settings.json         # Config del agent harness
├── Dockerfile                    # Multi-stage (deps, dev, build, runner)
├── docker-compose.yml            # Dev local con hot-reload
├── setup.sh                      # Script bootstrap
├── CLAUDE.md                     # Guía para futuras sesiones con Claude
├── jest.config.mjs               # next/jest preset
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

## Licencia

Académico, sin licencia formal.