# Technology Stack

## Languages & Runtime
- **Backend**: Python 3.11+ (FastAPI, async/await patterns)
- **Frontend**: TypeScript/React (Next.js 16.1.4)
- **Mobile**: React Native (Expo)
- **Desktop**: Electron-based

## Core Frameworks
- **API**: FastAPI with uvicorn/gunicorn
- **Frontend**: Next.js 16 (App Router), React 18/19
- **State**: Zustand (stores/)
- **Styling**: Tailwind CSS, shadcn/ui components

## Key Dependencies

### Backend (`backend/pyproject.toml`)
- `litellm>=1.80` - Multi-provider LLM abstraction
- `prisma==0.15.0` - Database ORM
- `supabase==2.17.0` - Auth & realtime
- `redis==5.2.1` / `upstash-redis` - Caching
- `mcp==1.9.4` - Model Context Protocol
- `stripe==11.6.0` - Payments
- `langfuse==2.60.5` - LLM observability
- `anthropic>=0.69.0`, `openai>=1.99.5` - LLM providers
- `e2b-code-interpreter`, `daytona-sdk` - Sandboxed execution
- `tavily-python` - Web search
- `boto3` - AWS services

### Frontend (`package.json`)
- `next@^16.1.4` - Framework
- `@types/react@^19.2.7` - React 19 types
- pnpm workspaces monorepo

## Infrastructure
- **Database**: PostgreSQL (via Supabase/Prisma)
- **Cache**: Redis (Upstash)
- **Auth**: Supabase Auth + JWT
- **Containerization**: Docker, docker-compose
- **Package Manager**: pnpm (frontend), uv (backend)

## Configuration
- `mise.toml` - Runtime version management
- `.env` files per environment
- `docker-compose.yaml` - Local services
