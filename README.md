# Generador de Excusas para no entregar el TP

App académica para el **2do parcial de Integración y Entrega continua(ICS)** —
UTN, Ingeniería en Sistemas. El foco no es la app sino el **pipeline de CI/CD**
que la rodea.

La app es deliberadamente chica: un botón que pide una excusa random a un
endpoint y la muestra con un badge de severidad. Las excusas tienen humor de
programador y ciberseguridad mezclados.

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

## Estructura del proyecto

```
.
├── .github/workflows/
│   ├── ci.yml                    # CI: format + lint + test + build + SonarCloud
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

## Pipeline CI/CD

El pipeline se divide en dos workflows encadenados: **CI** valida cada cambio y,
solo si pasa en `main`, **CD** despliega a Vercel.

### CI — [.github/workflows/ci.yml](.github/workflows/ci.yml)

Corre en cada `push` a `main` y en cada `pull_request`. Es un único job
(`Lint, Test, Build`) que ejecuta estos steps **en orden**:

| #   | Step           | Comando                       | Qué valida                                       |
| --- | -------------- | ----------------------------- | ------------------------------------------------ |
| 1   | Install        | `npm ci`                      | Deps exactas del lockfile                        |
| 2   | Format check   | `npm run format:check`        | Formato Prettier consistente                     |
| 3   | Lint           | `npm run lint`                | Estilo y reglas de ESLint                        |
| 4   | Unit tests     | `npm test -- --ci --coverage` | Lógica de dominio + genera coverage              |
| 5   | Build          | `npm run build`               | La app compila para producción                   |
| 6   | SonarQube Scan | `sonarqube-scan-action`       | Quality gate de SonarCloud (consume el coverage) |

**Por qué ese orden — principio _fail-fast_:** los steps van de más barato y
rápido a más lento y caro, así un PR roto recibe feedback en segundos en vez de
esperar el pipeline completo (y se ahorran minutos de runner). Format y lint son
casi instantáneos, por eso van primero; los tests detectan bugs de lógica antes
de gastar tiempo compilando; el build va después de que el código ya está
validado; y el scan de Sonar va **último** por dos razones: es lo más lento
(habla con la nube) y además **depende del coverage** que genera el step de
tests (`--coverage`). Si fallara cualquier step, el job se detiene ahí y los
siguientes no corren.

> El step de Sonar tiene `-Dsonar.qualitygate.wait=true`: espera el veredicto del
> quality gate y falla el CI si no se cumple. Solo corre si existe el secret
> `SONAR_TOKEN`.

### CD — [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

No se dispara por `push`, sino por `workflow_run`: arranca **cuando el CI
termina** y solo continúa si su conclusión fue `success` y la rama era `main`.
Usa la CLI oficial de Vercel (`vercel@latest`: `pull` → `build` → `deploy
--prod`). Es decir: **un cambio solo llega a producción si pasó todo el CI en
`main`**.

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

### Flujo completo

```
PR / push a main
      │
      ▼
   CI (ci.yml)  ──fail──▶  PR bloqueado (main protegida por ruleset)
      │
   success en main
      │
      ▼
   CD (deploy.yml) ──▶ Vercel (producción)
```

La rama `main` está protegida con un ruleset que exige PR + el check
`Lint, Test, Build` en verde, así que un CI rojo **impide el merge**. Ese es el
valor del pipeline: el código roto no entra a `main` ni llega a producción.

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

## Licencia

Académico, sin licencia formal.
