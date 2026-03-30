# Architecture Overview

## Pattern
**Monorepo with Multi-Runtime Services**
- pnpm workspaces for JS/TS packages
- Separate Python backend with uv

## System Layers

### 1. API Layer (`backend/api.py`)
- FastAPI application with CORS
- Modular routers: agents, threads, billing, admin, etc.
- JWT authentication via `auth_utils.verify_and_get_user_id_from_jwt`
- Rate limiting (IP-based, MAX_CONCURRENT_IPS=25)

### 2. Core Domain (`backend/core/`)
- `agents/` - Agent CRUD, runs, tools, setup
- `threads/` - Conversation threading
- `agentpress/` - Thread manager abstraction
- `billing/` - Stripe integration
- `sandbox/` - Code execution environments
- `tools/` - Agent tool definitions
- `mcp_module/` - MCP protocol implementation

### 3. Services (`backend/core/services/`)
- `redis.py` - Caching layer
- `supabase.py` - Database connection (DBConnection class)
- `db.py` - SQL execution helpers
- Transcription, API keys, orphan cleanup

### 4. Frontend (`apps/frontend/`)
- Next.js App Router (`src/app/`)
- Components (`src/components/`)
- State management (`src/stores/`)
- i18n support (`src/i18n/`)

## Data Flow
```
Client → Next.js → FastAPI → Core Services → Database
                         ↓
                    LLM Providers (via LiteLLM)
                         ↓
                    Sandboxes (E2B/Daytona)
```

## Entry Points
- `backend/api.py` - FastAPI main
- `apps/frontend/src/app/` - Next.js pages
- `start.py` - Development orchestrator
- `Makefile` - Build/dev commands

## Key Abstractions
- `ThreadManager` - Conversation state management
- `DBConnection` - Async database pool
- Modular router pattern for API domains
