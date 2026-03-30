# Directory Structure

```
kidpen.space/
├── apps/                    # Frontend applications
│   ├── frontend/           # Next.js web app
│   │   └── src/
│   │       ├── app/        # App Router pages
│   │       ├── components/ # React components
│   │       ├── hooks/      # Custom hooks
│   │       ├── stores/     # Zustand state
│   │       ├── lib/        # Utilities
│   │       ├── i18n/       # Internationalization
│   │       └── types/      # TypeScript types
│   ├── mobile/             # React Native (Expo)
│   └── desktop/            # Electron app
│
├── backend/                 # Python API
│   ├── api.py              # FastAPI entry point
│   ├── auth/               # Authentication
│   ├── core/               # Domain logic
│   │   ├── agents/         # Agent management
│   │   ├── threads/        # Conversation threads
│   │   ├── billing/        # Stripe billing
│   │   ├── sandbox/        # Code execution
│   │   ├── tools/          # Agent tools
│   │   ├── services/       # Shared services
│   │   ├── admin/          # Admin APIs
│   │   └── mcp_module/     # MCP protocol
│   ├── evals/              # AI evaluations
│   ├── tests/              # Pytest tests
│   └── supabase/           # DB migrations
│
├── packages/                # Shared packages
│   └── shared/             # Cross-app utilities
│
├── sdk/                     # Python SDK
│   └── kidpen/             # SDK package
│
├── infra/                   # Infrastructure configs
├── docs/                    # Documentation
├── setup/                   # Setup scripts
├── scripts/                 # Utility scripts
│
├── package.json            # Root pnpm config
├── pnpm-workspace.yaml     # Workspace definition
├── Makefile                # Build commands
├── docker-compose.yaml     # Local services
└── start.py                # Dev orchestrator
```

## Naming Conventions
- **Python**: snake_case (files, functions, variables)
- **TypeScript**: camelCase (variables), PascalCase (components)
- **Directories**: kebab-case or snake_case
- **API Routes**: kebab-case paths

## Key Locations
- Entry point: `backend/api.py`
- Frontend pages: `apps/frontend/src/app/`
- Agent logic: `backend/core/agents/`
- Database: `backend/supabase/migrations/`
