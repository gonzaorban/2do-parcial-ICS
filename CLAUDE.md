# CLAUDE.md

Esta guía es para sesiones futuras de Claude Code (u otro agent) que tomen el
proyecto sin contexto previo.

## Contexto del proyecto

**Qué es:** "Generador de Excusas para no entregar el TP". App Next.js 15
mínima — un botón que llama a `/api/excuse` y muestra una excusa con badge de
severidad.

**Por qué existe:** Es el entregable del **2do parcial de Integración y Entrega continua(ICS)** de la UTN. La nota viene por el **pipeline de
CI/CD** que se monta alrededor, no por la app en sí.

**Estado actual:** Pipeline CI/CD implementado. SonarCloud activado y configurado
con SONAR_TOKEN. Deploy a Vercel vía GitHub Actions (`amondnet/vercel-action`).
Corre `bash setup.sh` o `npm install` para instalar localmente.

## Stack y dónde vive cada pieza

| Item | Path |
|------|------|
| App router pages | [src/app/](src/app/) |
| API route | [src/app/api/excuse/route.ts](src/app/api/excuse/route.ts) |
| UI component | [src/components/ExcuseGenerator.tsx](src/components/ExcuseGenerator.tsx) |
| Domain (schema + service) | [src/lib/](src/lib/) |
| Unit tests | [tests/unit/](tests/unit/) |
| CI workflow | [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| Deploy workflow | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) |
| Docker | [Dockerfile](Dockerfile), [docker-compose.yml](docker-compose.yml) |
| Setup script | [setup.sh](setup.sh) |

## Comandos habituales

```bash
# Bootstrap (primera vez o entorno limpio)
bash setup.sh              # todo: install + lint + test + build
bash setup.sh install      # solo deps
bash setup.sh verify       # lint + test + build

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

## Pipeline (implementado)

1. ✅ **SonarCloud** — `sonar-project.properties` con projectKey
   (gonzaorban_2do-parcial-ICS) y organization. Workflow:
   `SonarSource/sonarcloud-github-action@v2`. `SONAR_TOKEN` secret en GitHub.
   Coverage: `collectCoverageFrom` en jest.config.mjs. Security hotspots
   resueltos. Vive en [.github/workflows/ci.yml](.github/workflows/ci.yml).
2. ✅ **Vercel deploy** — lo ejecuta GitHub Actions con `amondnet/vercel-action`
   (no la CLI nativa ni la git-integration de Vercel). Vive en
   [.github/workflows/deploy.yml](.github/workflows/deploy.yml), disparado por
   `workflow_run` tras un CI verde en `main`. Secrets: `VERCEL_TOKEN` /
   `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` (ya cargados en GitHub). Para evitar
   deploys duplicados, la Git Integration de Vercel debería estar desconectada.

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