# Generador de Excusas para no entregar el TP

App académica para el **2do parcial de Integración y Entrega continua(ICS)** —
UTN, Ingeniería en Sistemas. El foco no es la app sino el **pipeline de CI/CD**
que la rodea.

La app es deliberadamente chica: un botón que pide una excusa random a un
endpoint y la muestra con un badge de severidad. Las excusas tienen humor de
programador y ciberseguridad mezclados.

## Arquitectura

Aunque mínima, la app es **full-stack**: Next.js no es solo frontend, es un
framework que incluye su propio backend. La división la marca el App Router:

```
   FRONTEND (browser)              BACKEND (Node server)
   ┌──────────────────┐            ┌──────────────────────┐
   │ ExcuseGenerator  │──fetch()──▶│ api/excuse/route.ts  │
   │ 'use client'     │◀──JSON─────│   GET() → JSON        │
   └──────────────────┘            └──────────────────────┘
     React + Tailwind                getRandomExcuse()
                                      Node.js runtime
```

- **Frontend** — [src/components/ExcuseGenerator.tsx](src/components/ExcuseGenerator.tsx)
  es un Client Component (`'use client'`) que corre en el navegador. No genera
  la excusa: la **pide** al backend con `fetch('/api/excuse')`.
- **Backend** — [src/app/api/excuse/route.ts](src/app/api/excuse/route.ts) es un
  Route Handler que corre **del lado del servidor en Node.js** y expone
  `GET /api/excuse`. El catálogo de excusas vive acá y nunca se envía entero al
  cliente.
- **Tipos compartidos** — front y back importan el mismo `Excuse` de
  [src/lib/excuse.schema.ts](src/lib/excuse.schema.ts).

**Node.js** es el runtime en dos planos: corre el tooling de CI/CD (`next`,
`jest`, `eslint`) y el código del servidor en producción. En Vercel ese endpoint
se despliega como **serverless function** (efímera, por request), no como un
servidor Node corriendo 24/7 — es un detalle de deployment, no cambia que
arquitectónicamente hay backend.

## Stack

| Capa       | Herramienta                                             | Rol en el pipeline                                 |
| ---------- | ------------------------------------------------------- | -------------------------------------------------- |
| Framework  | Next.js 15 + App Router + Turbopack                     | Build artifact                                     |
| Lenguaje   | TypeScript (strict)                                     | Type safety en CI                                  |
| Runtime    | Node.js 20                                              | Ejecuta el tooling de CI/CD y el backend en server |
| Validación | Zod                                                     | Schema compartido entre runtime y tests unit       |
| Linter     | ESLint (`eslint-config-next`)                           | Gate de estilo en CI                               |
| Formatter  | Prettier                                                | Gate de formato en CI (`format:check`)             |
| Unit tests | Jest + `next/jest` + Testing Library                    | Quality gate en CI                                 |
| Container  | Docker multi-stage + docker-compose                     | Reproducibilidad local                             |
| CI         | GitHub Actions (`.github/workflows/ci.yml`)             | Orquestador                                        |
| Quality    | SonarCloud                                              | Quality gate + coverage analysis                   |
| Deploy     | Vercel vía GitHub Actions (CLI oficial `vercel@latest`) | CD on push to `main`                               |

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
├── .github/workflows/
│   ├── ci.yml                    # CI: lint + test + build + SonarCloud
│   └── deploy.yml                # CD: deploy a Vercel vía CLI oficial (workflow_run)
├── .claude/settings.json         # Config del agent harness
├── Dockerfile                    # Multi-stage (deps, dev, build, runner)
├── docker-compose.yml            # Dev local con hot-reload
├── setup.sh                      # Script bootstrap (install + lint + test + build)
├── CLAUDE.md                     # Guía para futuras sesiones con Claude
├── README.md                     # Este archivo
├── sonar-project.properties      # Config de SonarCloud (projectKey, coverage)
├── next.config.ts                # Config de Next (output standalone)
├── jest.config.mjs               # next/jest preset
├── jest.setup.ts                 # Setup de Testing Library
├── eslint.config.mjs             # ESLint (eslint-config-next)
├── tailwind.config.ts            # Tailwind
├── postcss.config.mjs            # PostCSS
├── tsconfig.json                 # TypeScript (strict)
├── .prettierrc / .prettierignore # Prettier
├── package.json                  # Scripts y deps
├── tests/unit/
│   └── excuse.service.test.ts    # 3 tests unitarios
└── src/
    ├── app/
    │   ├── globals.css
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
