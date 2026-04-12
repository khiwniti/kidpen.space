# Architecture

High-level system shape for the **kidpen** monorepo: multi-surface clients, a Python API hub, and shared agent/thread abstractions.

## Architectural pattern

- **Split clients + single API:** Browser (**Next.js** in `apps/frontend`), native (**Expo** in `apps/mobile`), and **desktop** (`apps/desktop`) talk to a **FastAPI** service (`backend/api.py`) over HTTP/WebSocket patterns as implemented per route.
- **Shared domain types and streaming:** `packages/shared` (`@agentpress/shared`) supplies TypeScript types, streaming utilities, and tool-related helpers consumed by both web and mobile — reduces duplicate protocol logic.
- **Modular backend by domain:** `backend/api.py` aggregates many `APIRouter` instances from `core.<domain>.api` (threads, agents, admin, triggers, sandbox, setup, notifications, etc.) plus `auth.api`.

## Primary entry points

| Surface | Entry / bootstrap | Notes |
|--------|---------------------|--------|
| HTTP API | `backend/api.py` | `FastAPI` app, lifespan hooks, CORS, OpenAPI via `core.utils.openapi_config.configure_openapi` |
| Web app | `apps/frontend` Next App Router | `src/app/` tree, server and client components per Next 15+ conventions |
| Mobile | `apps/mobile` Expo Router | File-based routes under `apps/mobile/app/` |
| Sandboxed HTTP | `backend/core/sandbox/docker/server.py` | Secondary small `FastAPI` for container-side services |
| SDK | `sdk/` | Lightweight HTTP/MCP client for external automation |

## Core backend domains (from router imports in `backend/api.py`)

- **Threads & messaging:** `core.threads.api`, `core.agentpress.thread_manager` (thread lifecycle, execution orchestration under `backend/core/agentpress/thread_manager/`).
- **Agents:** `core.agents.api`, `core.agents.agent_crud`, `agent_tools`, `agent_json`, `agent_setup` — CRUD, configuration, tool wiring, JSON artifacts.
- **Sandbox:** `core.sandbox.api` — isolated execution, file/presentation pipelines (large subtree under `backend/core/sandbox/`).
- **Auth:** `auth.api` + `verify_and_get_user_id_from_jwt` for protected routes.
- **Admin & operations:** `core.admin.*` routers (feedback, analytics, stress tests, system status, sandbox pool).
- **Triggers:** `core.triggers.api` — scheduled or event-driven agent runs (`croniter` / APScheduler at dependency level).
- **API keys & services:** `core.services.api_keys_api`, transcription submodule, orphan cleanup for agent runs.
- **Versioning:** `core.versioning.api` — API or agent template versioning.
- **Categorization:** `core.categorization.api` — taxonomy/tagging for content or agents.

## Data flow (conceptual)

1. Client authenticates via **Supabase JWT** (or SSO path); backend validates in dependencies (`core.utils.auth_utils`).
2. Client opens or continues a **thread**; `ThreadManager` coordinates message fetch, tool calls, and streaming responses.
3. **Tools** execute in-process or delegate to **sandboxes** (E2B/Daytona), external APIs (Composio, Tavily, Google, etc.), or browser automation stacks as configured.
4. Observability hooks (**Langfuse**, logging via `core.utils.logger` / structlog) record traces where enabled.

## Cross-cutting concerns

- **Instance identity:** `core.utils.instance` — multi-instance deployments share metrics or locks.
- **Rate limiting:** In-memory IP tracking in `backend/api.py` (OrderedDict) — consider Redis-backed limits for horizontal scale.
- **Graceful shutdown:** `_is_shutting_down` flag influences health checks during deploys.

## Relationship to planning docs

`.planning/PROJECT.md` and `.planning/STATE.md` describe **product** direction (Thai STEM tutoring, hybrid edge/cloud). This file describes the **current engineering layout** of the forked platform codebase; reconcile product plans with actual modules before large refactors.
