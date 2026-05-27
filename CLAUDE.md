# CLAUDE.md

Esta guía es para sesiones futuras de Claude Code (u otro agent) que tomen el
proyecto sin contexto previo.

## Contexto del proyecto

**Qué es:** "Generador de Excusas para no entregar el TP". App Next.js 15
mínima — un botón que llama a `/api/excuse` y muestra una excusa con badge de
severidad.

**Por qué existe:** Es el entregable del **2do parcial de Integración y
Continuous Delivery (ICS)** de la UTN. La nota viene por el **pipeline de
CI/CD** que se monta alrededor, no por la app en sí.

**Estado actual:** Andamiaje completo en disco. El usuario corre `bash setup.sh`
para instalar y verificar localmente (`npm install` no está corrido todavía si
ves esto en una sesión limpia).

## Stack y dónde vive cada pieza

| Item | Path |
|------|------|
| App router pages | [src/app/](src/app/) |
| API route | [src/app/api/excuse/route.ts](src/app/api/excuse/route.ts) |
| UI component | [src/components/ExcuseGenerator.tsx](src/components/ExcuseGenerator.tsx) |
| Domain (schema + service) | [src/lib/](src/lib/) |
| Unit tests | [tests/unit/](tests/unit/) |
| E2E tests | [e2e/](e2e/) |
| CI workflow | [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| Docker | [Dockerfile](Dockerfile), [docker-compose.yml](docker-compose.yml) |
| Setup script | [setup.sh](setup.sh) |

## Comandos habituales

```bash
# Bootstrap (primera vez o entorno limpio)
bash setup.sh              # todo: install + lint + test + build + e2e
bash setup.sh install      # solo deps
bash setup.sh verify       # lint + test + build (sin e2e)

# Dev
npm run dev                # localhost:3000 con Turbopack
docker compose up --build  # mismo, en container

# Quality
npm run lint
npm run format             # prettier --write
npm run format:check
npm test                   # jest
npm run test:coverage
npm run e2e                # playwright (levanta dev solo)
BASE_URL=https://... npm run e2e   # contra deploy
```

## Decisiones tomadas (importantes)

- **Jest config:** se usa **`next/jest`** (preset SWC oficial de Next 15) y se
  decidió **no incluir `ts-jest`**. Son redundantes — `next/jest` ya transforma
  TS via SWC. Si futuro Claude propone agregar `ts-jest`, revisar primero
  porque ya se descartó.
- **Playwright:** un solo navegador (Chromium) para velocidad en CI. Si se
  necesita Firefox/WebKit, agregar como proyecto adicional en
  [playwright.config.ts](playwright.config.ts).
- **`BASE_URL`:** Playwright usa `process.env.BASE_URL` o
  `http://localhost:3000`. Si la env está seteada, **no levanta `npm run dev`
  automáticamente** (clave para correr contra Vercel preview en CI).
- **Docker:** multi-stage. `dev` target es el que usa `docker-compose.yml`.
  Los stages `build` y `runner` (standalone) están listos para un futuro
  deploy fuera de Vercel; ahora no se usan.
- **Output `standalone`** en `next.config.ts`: necesario para el stage
  `runner` del Dockerfile.

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

## Roadmap del pipeline (qué falta)

Cada uno es un prompt aparte del usuario:

1. **SonarCloud** — alta + `sonar-project.properties` + step en workflow +
   `SONAR_TOKEN` secret.
2. **Snyk** — `snyk/actions/node` + `SNYK_TOKEN` secret. Step antes del build.
3. **Vercel deploy** — job `deploy` con `amondnet/vercel-action` +
   `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`. Output URL de
   preview.
4. **Playwright en CI** — job `e2e` dependiente de `deploy`. Corre con
   `BASE_URL=$preview` y sube `playwright-report/` como artifact.

Todos esos puntos están como `# TODO:` ya escritos en
[.github/workflows/ci.yml](.github/workflows/ci.yml) — al implementarlos,
solo hay que descomentar y rellenar secrets/configs.

## Cosas a NO hacer

- ❌ Hacer `git push` o agregar remote sin consentimiento explícito.
- ❌ Agregar `ts-jest` (decisión revertida — ver "Decisiones tomadas").
- ❌ Romper el formato de las excusas (`id` int positivo, `text` 10-200 chars,
  `severity` en `['leve','grave','critica']`). El schema Zod te frena, pero
  no hace falta llegar a ese punto.
- ❌ Expandir el scope de la app. Si el usuario pide más features, preguntar
  primero — el foco del parcial es el pipeline, no la app.
- ❌ Configurar Sonar/Snyk/Vercel sin que el usuario lo pida explícitamente.

## Cómo verificar un cambio antes de cerrar

```bash
npm run lint && npm test && npm run build
```

Si tocaste UI o el endpoint:

```bash
npm run e2e
```

Si tocaste el Dockerfile:

```bash
docker compose up --build
# verificar localhost:3000 manualmente
```
