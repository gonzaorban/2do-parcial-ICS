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
- **Coverage de UI excluido (page.tsx / layout.tsx):** los componentes de
  presentación del App Router son JSX sin lógica testeable y se **excluyen del
  coverage** en dos lugares que deben quedar alineados: `collectCoverageFrom` en
  [jest.config.mjs](jest.config.mjs) y `sonar.coverage.exclusions` en
  [sonar-project.properties](sonar-project.properties). **Por qué:** el Quality
  Gate de Sonar mide `new_coverage ≥ 80%` sobre New Code; la UI de puro markup
  daría 0% y rompería el gate en cada PR que toque solo JSX. Si futuro Claude
  propone agregar tests de render con `@testing-library/react` solo para subir
  este coverage, **preguntar primero** — fue una decisión consciente excluir, no
  un olvido. (`sonar.coverage.exclusions` saca del cálculo de coverage pero NO
  del análisis de bugs/seguridad; es distinto de `sonar.exclusions`.)
- **Sonar: New Code en PR vs main (no es un bug):** el gate de `new_coverage` se
  calcula sobre baselines distintas. En un **PR**, el New Code es solo el diff
  del PR; si son puras líneas no cubribles (JSX), el ratio es `0/0` → Sonar
  **omite** la condición → gate **verde**. En `main` (rama `LONG`), el New Code
  se mide contra `previous_version` (baseline anclada a una fecha porque no se
  setea `sonar.projectVersion`) y arrastra líneas ejecutables sin cubrir →
  `new_coverage = 0% < 80%` → **rojo**. El análisis de `main` corre **post-merge**.
  Por eso un PR puede mergear verde y el gate de `main` recién después marcar
  rojo. El check `SonarCloud Code Analysis` ES requerido en el ruleset (junto con
  `Lint, Test, Build`); el merge se permite si el check del **PR** está verde,
  porque GitHub solo evalúa los checks del PR.

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
   `SonarSource/sonarqube-scan-action` (pinneada a `@…v8.1.0`; la vieja
   `sonarcloud-github-action` está deprecada). `SONAR_TOKEN` secret en GitHub.
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
4. ✅ **Notificaciones a Discord** — ambos workflows postean a un webhook
   (secret `DISCORD_WEBHOOK`) con `curl`; si el secret no existe, los steps se
   omiten. Eventos: **CI falló** ([ci.yml](.github/workflows/ci.yml)), **Deploy
   OK** y **Deploy falló** ([deploy.yml](.github/workflows/deploy.yml)). El embed
   de CI distingue el origen con un campo `Contexto`: `PR #<n> (<branch>)` vs
   `main (push)`, usando `github.head_ref` para el nombre legible de la rama (no
   el merge ref `<n>/merge`), e incluye link al commit y a los logs del run.
   **El CI solo notifica en fallo, no en éxito** — es deliberado (el verde ya se
   ve en el check del PR, y en `main` encadena el deploy que sí avisa). Si futuro
   Claude propone agregar avisos de CI exitoso, **preguntar primero**: fue una
   decisión consciente para evitar ruido, no un olvido. Detalle en la sección
   "Notificaciones a Discord" del [README.md](README.md).

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
