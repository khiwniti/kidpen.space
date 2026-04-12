# Repository structure

Top-level layout and where to find common concerns. Paths are from the repo root.

## Top-level directories

| Path | Role |
|------|------|
| `apps/frontend/` | Next.js web application (`Kidpen` package) — marketing, dashboard, admin, thread UI |
| `apps/mobile/` | Expo React Native app (`kidpen` package) — mirrors core flows on device |
| `apps/desktop/` | Desktop shell (Electron or similar — confirm in `apps/desktop/package.json`) |
| `backend/` | Python FastAPI service (`api.py` + `core/` domain tree, `auth/`) |
| `packages/shared/` | `@agentpress/shared` — shared TS types, streaming, tools surface |
| `sdk/` | Small Python SDK for external integrators |
| `infra/` | Infrastructure scripts or helpers (Node package) |
| `setup/` | Setup/bootstrap steps (e.g. `setup/steps/` Python for guided install) |
| `.github/workflows/` | CI/CD: API e2e, Docker, Azure, EAS, desktop builds |
| `.planning/` | GSD artifacts: `PROJECT.md`, `ROADMAP.md`, `codebase/`, `phases/`, `research/` |

## Frontend (`apps/frontend/src/`)

- **`app/`** — Next.js App Router routes: `(home)`, `(dashboard)`, `global-error.tsx`, etc.
- **`components/`** — Feature and presentational UI (thread tool views under `components/thread/tool-views/`, admin under `components/admin/` and `app/(dashboard)/admin/`).
- **`hooks/`** — React hooks for data fetching, threads, onboarding, triggers.
- **`lib/`** — Utilities, storage abstractions (`lib/storage/factory.ts`), API clients.

## Mobile (`apps/mobile/`)

- **`app/`** — Expo Router screens.
- **`components/`** — RN screens and widgets (threads, files, triggers, chat tool views).
- **`contexts/`** — React context providers (e.g. `AgentContext`, `LanguageContext`).
- **`lib/`** — Mobile-specific helpers and models.

## Backend (`backend/`)

- **`api.py`** — FastAPI application assembly and middleware.
- **`core/`** — Almost all product logic:
  - `agentpress/` — thread manager, message services, tool execution pipeline.
  - `agents/` — agent run lifecycle, CRUD, tools, JSON configs.
  - `sandbox/` — Docker images, APIs, presentation/HTML/PPTX pipelines.
  - `tools/` — Built-in agent tools (web search, browser, spreadsheets, etc.).
  - `admin/` — Operational HTTP APIs.
  - `services/` — Redis, Supabase connection, transcription, metrics, API keys.
  - `mcp_module/` — MCP server integration.
  - `triggers/`, `notifications/`, `memory/`, `templates/`, `google/`, etc.
- **`auth/`** — Authentication routes separate from `core/`.
- **`evals/`** — Evaluation datasets and harness code.

## Naming conventions (observed)

- **Python:** snake_case modules, `router` objects per `api.py` file, `*_repo.py` for persistence helpers in `core/endpoints/` and elsewhere.
- **TypeScript/React:** PascalCase components, `use-*` hooks, co-located `_utils.ts` in complex tool views.
- **Routes:** Next **route groups** in parentheses `(home)`, `(dashboard)`; Expo file-based routes in `apps/mobile/app/`.

## Large or generated-adjacent trees

- **`backend/core/sandbox/`** — Docker assets and WIP processors; high churn.
- **`conversations/`** (if present at root) — may hold exported thread JSON; avoid treating as source code.

When adding a feature, prefer **mirroring** structure across `apps/frontend` and `apps/mobile` only when UX parity is required; otherwise keep mobile thinner and route shared logic through `@agentpress/shared` or the API.
