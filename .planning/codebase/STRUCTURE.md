# Kidpen Codebase Structure

## Root Directory Overview

```
/Users/khiwn/kidpen/kidpen.space/
├── .claude/                    # Claude configuration
├── .github/                    # GitHub workflows and templates
├── .planning/                  # Planning documents (this directory)
├── .setup_progress             # Setup wizard progress tracking
├── .venv/                      # Python virtual environment
├── apps/                       # User-facing applications
│   ├── desktop/                # Desktop application (Tauri/Rust)
│   ├── frontend/               # Next.js/React web dashboard
│   └── mobile/                 # React Native mobile applications
├── backend/                    # Python/FastAPI backend services
├── bash_events/                # Bash event logging
├── conversations/              # Conversation history storage
├── design_system.html          # Design system documentation
├── docs/                       # Documentation files
├── infra/                      # Infrastructure as code
│   ├── azure/                  # Azure deployment configurations
│   ├── eks/                    # EKS/Kubernetes configurations
│   ├── environments/           # Environment-specific configs (dev/staging/prod)
│   ├── modules/                # Reusable infrastructure modules
│   └── scripts/                # Infrastructure deployment scripts
├── landing_page.html           # Marketing landing page
├── node_modules/               # JavaScript/TypeScript dependencies
├── packages/                   # Shared npm packages
├── project/                    # Legacy project files
├── scripts/                    # Utility scripts
├── sdk/                        # Software Development Kits
├── setup/                      # Setup wizard and configuration
├── supabase/                   # Supabase database configurations
└── venv/                       # Alternative virtual environment
```

## Key Application Directories

### Apps Structure
```
apps/
├── desktop/
│   ├── src/                    # Tauri/Rust source code
│   └── tauri.conf.json         # Tauri configuration
├── frontend/
│   ├── app/                    # Next.js 13+ app router
│   │   ├── (home)/             # Home route group
│   │   ├── auth/               # Authentication routes
│   │   ├── api/                # API routes
│   │   └── ...                 # Other route groups
│   ├── components/             # React components
│   ├── lib/                    # Utility functions and hooks
│   ├── public/                 # Static assets
│   ├── styles/                 # CSS and styling
│   └── next.config.js          # Next.js configuration
└── mobile/
    ├── android/                # Android native code
    ├── ios/                    # iOS native code
    ├── lib/                    # Shared React Native code
    │   ├── agents/             # Agent-related components
    │   ├── api/                # API service layer
    │   ├── components/         # Reusable components
    │   ├── hooks/              # Custom React hooks
    │   ├── navigation/         # Navigation configuration
    │   ├── screens/            # Screen components
    │   ├── store/              # State management (Redux/Zustand)
    │   ├── themes/             # Theme configurations
    │   └── utils/              # Utility functions
    └── assets/                 # Images, fonts, icons
```

### Backend Structure
```
backend/
├── api.py                      # Main FastAPI application entry point
├── docker-compose.yml          # Backend-specific Docker compose
├── Dockerfile                  # Containerization configuration
├── pyproject.toml              # Python project configuration
├── uv.lock                     # Dependency lock file
├── core/                       # Core business logic and services
│   ├── admin/                  # Administrative APIs and dashboards
│   ├── agentpress/             # Agent communication and thread management
│   │   └── thread_manager/     # Thread and message handling services
│   ├── agents/                 # Agent CRUD, tools, and configuration
│   │   ├── api/                # Agent-related REST endpoints
│   │   ├── agent_crud/         # Agent creation, reading, updating, deletion
│   │   ├── agent_tools/        # Tool execution and management
│   │   ├── agent_json/         # JSON-based agent configuration
│   │   └── agent_setup/        # Agent setup wizards
│   ├── ai_models/              # AI model abstractions and providers
│   ├── analytics/              # Analytics tracking and reporting
│   ├── api_models/             # Pydantic models for API requests/responses
│   ├── auth/                   # Authentication and authorization
│   ├── cache/                  # Caching mechanisms
│   ├── categorization/         # Content categorization services
│   ├── config/                 # Configuration management
│   ├── composio_integration/   # Third-party tool integrations
│   ├── credentials/            # Credential storage and management
│   ├── endpoints/              # API endpoint definitions
│   ├── files/                  # File handling and storage
│   ├── google/                 # Google API integrations
│   ├── jit/                    # Just-in-time compilation services
│   ├── knowledge_base/         # Knowledge base and RAG services
│   ├── mcp_module/             # Model Context Protocol implementation
│   ├── memory/                 # Memory management and extraction
│   ├── notifications/          # Notification systems
│   ├── prompts/                # Prompt templating and management
│   ├── referrals/              # Referral system
│   ├── resources/              # Resource management
│   ├── sandbox/                # Secure code execution sandbox
│   ├── services/               # Core service implementations
│   │   ├── api_keys.py         # API key management
│   │   ├── db.py               # Database connection and operations
│   │   ├── redis.py            # Redis caching layer
│   │   ├── supabase.py         # Supabase database integration
│   │   ├── llm.py              # LLM provider abstraction
│   │   ├── orphan_cleanup.py   # Orphaned agent cleanup
│   │   └── ...                 # Other core services
│   ├── setup/                  # Backend setup procedures
│   ├── templates/              # Template rendering
│   ├── test_harness/           # Testing utilities
│   ├── threads/                # Thread management
│   ├── tools/                  # Agent tools implementation
│   │   ├── agent_builder_tools/ # Tools for agent construction
│   │   └── ...                 # Various agent tools (browser, file, etc.)
│   ├── triggers/               # Event trigger systems
│   ├── utils/                  # Utility functions
│   │   ├── logger.py           # Logging configuration
│   │   ├── config.py           # Configuration loading
│   │   ├── openapi_config.py   # OpenAPI/Swagger configuration
│   │   └── ...                 # Other utilities
│   └── versioning/             # API versioning
├── evals/                      # Evaluation and testing scripts
├── scripts/                    # Backend utility scripts
├── services/                   # External service integrations
├── supabase/                   # Supabase migration and schema files
└── tests/                      # Backend test suite
```

### Infrastructure Structure
```
infra/
├── azure/                      # Azure cloud deployment
│   ├── main.tf                 # Terraform configuration
│   └── variables.tf            # Terraform variables
├── eks/                        # Amazon EKS Kubernetes
│   ├── clusters/               # Cluster configurations
│   └── addons/                 # Kubernetes addons
├── environments/               # Environment-specific configs
│   ├── dev/                    # Development environment
│   ├── staging/                # Staging environment
│   └── prod/                   # Production environment
├── modules/                    # Reusable Terraform modules
│   ├── kubernetes/             # Kubernetes module
│   ├── monitoring/             # Monitoring stack module
│   └── lightsail/              # AWS Lightsail module
├── scripts/                    # Deployment and management scripts
└── docs/                       # Infrastructure documentation
```

### Setup Structure
```
setup/
├── ui/                         # Setup wizard interface
│   ├── __pycache__/            # Python cache
│   ├── config/                 # Configuration modules
│   ├── steps/                  # Setup wizard steps
│   ├── validators/             # Input validation
│   └── utils/                  # Utility functions
├── config/                     # Configuration loading
├── tests/                      # Setup wizard tests
│   ├── test_config/            # Configuration tests
│   ├── test_steps/             # Step tests
│   └── test_validators/        # Validator tests
└── utils/                      # Utility functions
```

## Naming Conventions

### File Naming
- **Python files**: snake_case (e.g., `thread_manager.py`, `api_keys.py`)
- **TypeScript/JavaScript files**: camelCase (e.g., `page.tsx`, `api.ts`)
- **Configuration files**: snake_case or kebab-case (e.g., `docker-compose.yaml`, `.env`)
- **Template files**: snake_case with appropriate extensions (e.g., `email_template.html`)
- **Test files**: prefixed with `test_` or suffixed with `_test.py`/`.test.ts`

### Directory Naming
- **All directories**: snake_case
- **Feature groups**: plural nouns (e.g., `agents`, `tools`, `services`)
- **Configuration**: `config` or `conf`
- **Utilities**: `utils` or `helpers`
- **APIs**: `api` or `endpoints`
- **Implementations**: `impl` or service-specific names

### Class and Function Naming
- **Python classes**: PascalCase (e.g., `ThreadManager`, `DBConnection`)
- **Python functions**: snake_case (e.g., `create_agent`, `get_thread_messages`)
- **TypeScript interfaces**: PascalCase with `I` prefix optional (e.g., `IAgentConfig`)
- **TypeScript functions**: camelCase (e.g., `createAgent`, `updateThread`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_THREAD_LENGTH`, `DEFAULT_MODEL`)

### Import Conventions
- **Python**: 
  - Standard library imports first
  - Third-party imports second
  - Local application imports third
  - Relative imports using dots (`.`, `..`)
- **TypeScript/JavaScript**:
  - Absolute imports using `@/` alias for frontend/src
  - Relative imports for local components
  - Named imports preferred over default when multiple exports

## Technology Stack Indicators

### Backend
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **Authentication**: Supabase Auth + FastAPI-SSO
- **LLM Providers**: LiteLLM abstraction for multiple providers
- **Containerization**: Docker
- **Orchestration**: Docker Compose, Terraform (infra)

### Frontend
- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context/Zustand
- **Authentication**: Supabase Auth helpers
- **Realtime**: Supabase Realtime
- **UI Components**: Custom + Radix UI primitives

### Mobile
- **Framework**: React Native
- **Language**: TypeScript/JavaScript
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit/Zustand
- **Authentication**: Supabase Auth
- **Expo**: Bare workflow for custom native modules

### Infrastructure
- **IaC**: Terraform
- **Cloud Providers**: AWS (primary), Azure (alternative)
- **Containers**: Docker
- **Orchestration**: Docker Compose (dev), Kubernetes/EKS (prod)
- **Monitoring**: Prometheus, Langfuse, PostHog
- **Logging**: Structured logging with transfer to cloud services