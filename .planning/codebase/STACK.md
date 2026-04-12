# Technology stack

This document reflects the **kidpen** monorepo at the repository root. Paths are relative to the repo root unless noted.

## Monorepo and package management

- **Workspace tool:** `pnpm` with workspaces defined in `pnpm-workspace.yaml` (`apps/*`, `packages/*`).
- **Root manifest:** `package.json` — private meta-package named `kidpen` with convenience scripts:
  - `dev:frontend` → `pnpm --filter Kidpen dev`
  - `dev:mobile` → `pnpm --filter kidpen dev`
  - `build:frontend` → `pnpm --filter Kidpen build`
- **Root dependency:** `next` is listed at the root (`^16.1.4`) alongside the frontend app’s own Next version; prefer **`apps/frontend/package.json`** as the source of truth for the web app runtime.

## Web frontend (`apps/frontend`)

- **Framework:** Next.js (App Router) with **Turbopack** in dev (`next dev --turbopack` in `apps/frontend/package.json`).
- **Language:** TypeScript.
- **UI:** React 19 (via pnpm overrides in root `package.json`), **Radix UI** primitives, **Tailwind CSS** (incl. `@tailwindcss/typography`), **TipTap** editor ecosystem, **CodeMirror 6**, **Syncfusion** spreadsheet React components, **Framer Motion** (typical stack from `apps/frontend/package.json`).
- **Data / auth:** `@supabase/supabase-js`, `@supabase/ssr`, **TanStack Query** (`@tanstack/react-query`).
- **Payments / comms:** Stripe (`@stripe/stripe-js`, `@stripe/react-stripe-js`), **Novu** (`@novu/nextjs`, `@novu/notification-center`), **Cal.com** embed.
- **Tooling:** ESLint via `next lint` (`apps/frontend/eslint.config.mjs`), Prettier scripts in `apps/frontend/package.json`.

## Mobile app (`apps/mobile`)

- **Framework:** **Expo SDK ~54** with **Expo Router** (`expo-router`), React Native.
- **Styling:** NativeWind-related stack (see `apps/mobile/package.json` for `nativewind`, `tailwindcss`, `react-native-reanimated`, etc.).
- **Primitives:** `@rn-primitives/*` family for accessible RN components.
- **Shared code:** `@agentpress/shared` workspace dependency (same as frontend).
- **Backend client:** `@supabase/supabase-js`, TanStack Query.

## Desktop (`apps/desktop`)

- Separate **Electron-style** desktop package (`apps/desktop/package.json`) — inspect that file for exact Electron/Tauri stack and build scripts.

## Shared TypeScript library (`packages/shared`)

- Package name: **`@agentpress/shared`** (`packages/shared/package.json`).
- **Exports:** main types, streaming helpers, tools, utils, errors (`packages/shared/package.json` `exports` map).
- **State:** `zustand` as a dependency; **peer** React 18/19.

## Python backend (`backend/`)

- **Project:** `kidpen` in `backend/pyproject.toml` (Python **>= 3.11**).
- **API framework:** **FastAPI** (`fastapi`, `uvicorn`, `gunicorn`).
- **App entry:** `backend/api.py` — constructs `FastAPI` app, lifespan, mounts routers from `core.*` and `auth.api`.
- **LLM / agents:** `litellm`, `openai`, `anthropic`, **MCP** (`mcp`), eval tooling (`braintrust`, `autoevals`, `langfuse`).
- **Data / infra clients:** `supabase`, `redis`, `upstash-redis`, **Prisma Python client** (`prisma` in dependencies — schema location may be outside this grep; treat DB access as Prisma/Supabase-backed), `boto3`.
- **Sandboxes / code execution:** `e2b-code-interpreter`, **Daytona** SDKs (`daytona-sdk`, `daytona-api-client*`, `daytona`).
- **Integrations:** `stripe`, `composio`, `tavily-python`, `replicate`, `apify-client`, Google APIs (`google-api-python-client`, `google-auth*`), `novu-py`, `chunkr-ai`, email (`mailtrap`), **WeasyPrint** / document stack, `paramiko`, etc. (see full `backend/pyproject.toml`).

## SDK (`sdk/`)

- **Purpose:** Kidpen SDK (`sdk/pyproject.toml`) — **`fastmcp`**, `httpx`, minimal surface for agent/MCP-style clients.

## Infrastructure (`infra/`)

- **`infra/package.json`** — treat as Node-based infra tooling (scripts/deps for deploy or IaC helpers); open file for specifics.

## Runtime and deployment signals

- **GitHub Actions:** `.github/workflows/` includes `e2e-api-tests.yml`, `docker-build.yml`, `azure-deploy.yml`, `mobile-eas-update.yml`, `desktop-build.yml`, etc. — indicates **multi-target CI** (API, Docker, Azure, EAS).
- **Docker:** `backend/core/sandbox/docker/` contains Node `package.json` for sandbox images and related tooling.

## Version skew to watch

- Root `package.json` pins `next` while `Kidpen` frontend has its own Next — align upgrades deliberately.
- Mobile Expo SDK and frontend Next/React versions evolve on different cadences; shared types in `packages/shared` reduce drift but do not eliminate it.
