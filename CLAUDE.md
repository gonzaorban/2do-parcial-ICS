# CLAUDE.md

Esta guía es para sesiones futuras de Claude Code (u otro agent) que tomen el
proyecto sin contexto previo.

## Contexto del proyecto

**Qué es:** "Generador de Excusas para no entregar el TP". App Next.js 15
mínima — un botón que llama a `/api/excuse` y muestra una excusa con badge de
severidad.

**Arquitectura:** es **full-stack**, no puro frontend. El front es un Client
Component (`'use client'`) que hace `fetch('/api/excuse')`; el back es un Route
Handler ([src/app/api/excuse/route.ts](src/app/api/excuse/route.ts)) que corre
en Node.js del lado del servidor (en Vercel, como serverless function). Front y
back comparten el tipo `Excuse` de [src/lib/excuse.schema.ts](src/lib/excuse.schema.ts).
Ver sección "Arquitectura" del [README.md](README.md).

**Por qué existe:** Es el entregable del **2do parcial de Integración y Entrega continua(ICS)** de la UTN. La nota viene por el **pipeline de
CI/CD** que se monta alrededor, no por la app en sí.

**Estado actual:** Pipeline CI/CD implementado. SonarCloud activado y configurado
con SONAR_TOKEN. Deploy a Vercel vía GitHub Actions con la CLI oficial
(`vercel@latest`). Rama `main` protegida (ver "Protección de main").
Corre `npm install` (o `docker compose up --build`) para levantarlo localmente.

## Stack y dónde vive cada pieza

| Item                      | Path                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| App router pages          | [src/app/](src/app/)                                                     |
| API route                 | [src/app/api/excuse/route.ts](src/app/api/excuse/route.ts)               |
| UI component              | [src/components/ExcuseGenerator.tsx](src/components/ExcuseGenerator.tsx) |
| Domain (schema + service) | [src/lib/](src/lib/)                                                     |
| Unit tests                | [tests/unit/](tests/unit/)                                               |
| CI workflow               | [.github/workflows/ci.yml](.github/workflows/ci.yml)                     |
| Deploy workflow           | [.github/workflows/deploy.yml](.github/workflows/deploy.yml)             |
| Docker                    | [Dockerfile](Dockerfile), [docker-compose.yml](docker-compose.yml)       |

## Comandos habituales

```bash
# Bootstrap (primera vez o entorno limpio)
npm install                # solo deps
npm install && npm run lint && npm test && npm run build  # install + verify

# Dev
npm run dev                # localhost:3000 con Turbopack
docker compose up --build  # mismo, en container

# Quality
npm run lint
npm run format             # prettier --write
npm run format:check
npm test                   # jest
npm run test:coverage
```

## Decisiones tomadas (importantes)

- **Jest config:** se usa **`next/jest`** (preset SWC oficial de Next 15) y se
  decidió **no incluir `ts-jest`**. Son redundantes — `next/jest` ya transforma
  TS via SWC. Si futuro Claude propone agregar `ts-jest`, revisar primero
  porque ya se descartó.
- **Docker:** solo para **desarrollo local**. El Dockerfile tiene dos stages
  (`deps` + `dev`) y `docker-compose.yml` levanta el target `dev` con
  hot-reload. Se descartaron los stages `build`/`runner` (standalone de
  producción) porque el hosting es Vercel y no se va a deployar un container
  propio. Si futuro Claude propone re-agregarlos, preguntar primero: fue una
  decisión consciente (YAGNI), no un olvido.
- **`next.config.ts` sin `output: 'standalone'`:** se removió junto con el
  stage `runner` (era su única razón de existir). Vercel buildea con el output
  nativo de Next, no necesita standalone.

## Convenciones de código

- Variables, funciones, archivos, comentarios → **inglés**.
- UI y textos de excusas → **español argentino**, con humor mezclado de
  **programador + ciberseguridad** (es parte del tono pedido por el usuario).
- TypeScript strict, **sin `any`** salvo justificación visible en el código.
- No agregar librerías fuera del stack documentado en el README sin
  preguntarle al usuario primero.

## Convenciones de commits

Conventional Commits, en inglés:

- `feat:` nueva funcionalidad
- `fix:` bug fix
- `chore:` infraestructura, configs, deps
- `test:` agregar/modificar tests
- `docs:` documentación
- `ci:` cambios al workflow / pipeline
- `refactor:` cambios internos sin cambio de comportamiento

**No** hacer `git push` ni `git remote add` hasta que el usuario lo indique explícitamente.

## Pipeline (implementado)

El job de CI (`Lint, Test, Build` en [.github/workflows/ci.yml](.github/workflows/ci.yml))
corre los steps en orden _fail-fast_: **Format check** (`npm run format:check`) →
**Lint** → **Unit tests** (con `--coverage`) → **Build** → **SonarQube Scan**.
El format check es un gate: si el código no está formateado con Prettier, el CI
falla. Por eso, antes de commitear, corré `npm run format`. El scan de Sonar va
último porque consume el coverage que generan los tests. Detalle del orden y el
flujo CI→CD en la sección "Pipeline CI/CD" del [README.md](README.md).

1. ✅ **SonarCloud** — `sonar-project.properties` con projectKey
   (gonzaorban_2do-parcial-ICS) y organization. Workflow:
   `SonarSource/sonarcloud-github-action@v2`. `SONAR_TOKEN` secret en GitHub.
   Coverage: `collectCoverageFrom` en jest.config.mjs. Security hotspots
   resueltos. Vive en [.github/workflows/ci.yml](.github/workflows/ci.yml).
2. ✅ **Vercel deploy** — lo ejecuta GitHub Actions con la **CLI oficial de
   Vercel** (`vercel@latest`: `pull` + `build` + `deploy`). NO se usa
   `amondnet/vercel-action` (arrastraba una CLI 25.1.0 muerta). Vive en
   [.github/workflows/deploy.yml](.github/workflows/deploy.yml), disparado por
   `workflow_run` tras un CI verde en `main`. Secrets: `VERCEL_TOKEN` /
   `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` (ya cargados en GitHub). Para evitar
   deploys duplicados, la Git Integration de Vercel debería estar desconectada.
3. ✅ **Protección de main** — ver sección dedicada abajo.

## Protección de main

La rama `main` está protegida en GitHub (Settings → Rules → Rulesets) para que
todo cambio pase por PR con CI verde. Se configuró por la **web** con un
**ruleset** (no la regla clásica):

- **Target branches:** incluye `main` (vía "Include default branch" o pattern
  `main`). ⚠️ Si el target queda vacío, GitHub avisa _"This ruleset does not
  target any resources and will not be applied"_ — hay que agregar el target.
- **Enforcement status:** Active.
- **Reglas activas:**
  - ✅ Require a pull request before merging (bloquea push directo a `main`).
  - ✅ Require status checks to pass before merging + branches up to date.
    - Status check requerido: **`Lint, Test, Build`** (es el `name:` del job en
      [.github/workflows/ci.yml](.github/workflows/ci.yml)). Opcionalmente el
      check de SonarCloud.

**Implicancia para sesiones futuras:** no se puede mergear a `main` sin PR y sin
CI verde. Esto refuerza la regla de no hacer `git push` directo a `main`.

## Cosas a NO hacer

- ❌ Hacer `git push` o agregar remote sin consentimiento explícito.
- ❌ Agregar `ts-jest` (decisión revertida — ver "Decisiones tomadas").
- ❌ Romper el formato de las excusas (`id` int positivo, `text` 10-200 chars,
  `severity` en `['leve','grave','critica']`). El schema Zod te frena, pero
  no hace falta llegar a ese punto.
- ❌ Expandir el scope de la app. Si el usuario pide más features, preguntar
  primero — el foco del parcial es el pipeline, no la app.
- ❌ Configurar Sonar/Vercel sin que el usuario lo pida explícitamente.

## Cómo verificar un cambio antes de cerrar

```bash
npm run lint && npm test && npm run build
```

Si tocaste el Dockerfile:

```bash
docker compose up --build
# verificar localhost:3000 manualmente
```
