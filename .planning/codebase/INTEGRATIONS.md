# External integrations

Concrete integration points discovered from manifests and `backend/api.py` router wiring. Use this when planning secrets, quotas, and failure modes.

## Authentication and user data

- **Supabase:** `@supabase/supabase-js` and `@supabase/ssr` (frontend), `supabase` Python client (backend). JWT verification and thread/agent authorization live under `backend/core/utils/auth_utils.py` (FastAPI dependencies). Auth HTTP surface: `auth/api` mounted from `backend/api.py`.
- **OAuth / SSO:** `fastapi-sso` in `backend/pyproject.toml` — enterprise or social login flows as implemented in `auth` and related modules.

## Primary datastore and APIs

- **Supabase / Postgres:** `DBConnection` in `backend/core/services/supabase.py` (imported from `backend/api.py`) — treat as the central DB/API façade.
- **Redis:** `redis`, `upstash-redis` — caching, rate limiting, or job coordination (see `backend/core/services/redis` usage from `backend/api.py`).

## LLM, observability, and evals

- **LiteLLM** — unified model routing (`litellm` in `backend/pyproject.toml`).
- **OpenAI / Anthropic** — direct SDKs for completions and agent flows.
- **Langfuse** — tracing (`langfuse`).
- **Braintrust / autoevals** — evaluation pipelines.
- **Google Analytics Data** — product analytics API client listed in backend dependencies.

## Payments and billing

- **Stripe** — backend `stripe` package; frontend `@stripe/react-stripe-js` for Elements-style flows.

## Notifications

- **Novu** — `@novu/nextjs` / `@novu/notification-center` on web; `novu-py` on backend.

## Sandboxed execution and tooling

- **E2B** — `e2b-code-interpreter` for hosted code execution.
- **Daytona** — multiple Daytona packages for sandbox/workspace orchestration.
- **MCP** — `mcp` Python package; server/tooling under `backend/core/mcp_module/` (see tree).
- **Composio** — `composio` for third-party tool connectors (agents).

## Search, media, and enrichment

- **Tavily** — `tavily-python` web search from tools (e.g. `backend/core/tools/web_search_tool.py`).
- **Apify** — `apify-client` for managed scraping actors.
- **Replicate** — model hosting API.
- **Chunkr** — `chunkr-ai` document processing.
- **Reality Defender** — `realitydefender` dependency (content authenticity / moderation — confirm usage in services before relying on behavior).

## Google Workspace

- **Google APIs** — `google-api-python-client`, OAuth libs; feature code under paths such as `backend/core/google/` (e.g. `google_docs_service.py`).

## Telephony / voice (where used)

- Frontend includes **Vapi**-related tool views under `apps/frontend/src/components/thread/tool-views/vapi-call/` — integrate only with explicit env keys and compliance review.

## Email

- **Mailtrap** — `mailtrap` Python package (dev/staging vs production configuration is environment-specific).

## Scheduling and background work

- **APScheduler** + **croniter** — in-process or worker-style scheduling patterns in backend services.

## CI / deployment targets (not runtime libraries but integration contracts)

- **GitHub Actions** workflows under `.github/workflows/` call deployed APIs (e.g. `e2e-api-tests.yml` uses `https://api.kidpen.space/v1` for production-style checks).
- **Azure** — `azure-deploy.yml` suggests Microsoft Azure as a deployment target.
- **EAS** — `mobile-eas-update.yml` for Expo Application Services.

## Frontend-only third parties

- **Cal.com** — `@calcom/embed-react`.
- **Hugeicons / Simple Icons** — icon packs in `apps/frontend/package.json`.

When adding a new integration, document the **env var names** in the implementing module’s docstring or `.env.example` (if present) so this file stays maintainable.
