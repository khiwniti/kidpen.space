# Kidpen Codebase Architecture

## Platform Architecture Overview

Kidpen follows a modular, layered architecture designed for extensibility and scalability. The platform consists of four primary components as described in the README:

1. **Backend API** - Python/FastAPI service handling agent orchestration, thread management, and LLM integration
2. **Frontend Dashboard** - Next.js/React application for agent management and configuration
3. **Agent Runtime** - Isolated Docker execution environments for secure agent operation
4. **Database & Storage** - Supabase-powered data layer for persistence and real-time features

## Architectural Layers

### 1. Presentation Layer
- **Frontend**: Next.js 13+ App Router with React 18
  - Server Components for data fetching and initial render
  - Client Components for interactivity
  - Route groups for organization (`(home)`, `auth`, `api`)
- **Mobile**: React Native with custom native modules
- **Desktop**: Tauri/Rust application

### 2. Application Layer (Backend)
- **API Gateway**: FastAPI application (`api.py`) with middleware (CORS, logging)
- **Route Controllers**: Modular API routers organized by domain
- **Service Layer**: Business logic implementations in `core/services/`
- **Domain Models**: Pydantic models in `core/api_models/` and database models
- **Agent Press**: Core agent communication and thread management system

### 3. Domain Layer
- **Agent Core**: Agent lifecycle, configuration, and execution logic
- **Tool System**: Extensible tool framework for agent capabilities
- **Memory & Knowledge**: Context management, extraction, and retrieval systems
- **Trigger System**: Event-driven automation capabilities
- **Analytics & Monitoring**: Usage tracking and performance metrics

### 4. Infrastructure Layer
- **Data Persistence**: Supabase (PostgreSQL) with real-time subscriptions
- **Caching**: Redis for session storage and temporary data
- **File Storage**: AWS S3 integration for uploads
- **Execution Sandbox**: Docker-based isolated environments (Daytona/E2B)
- **External Integrations**: API integrations via composio and direct SDKs
- **Configuration**: Environment-based configuration management
- **Deployment**: Docker Compose (local), Terraform (cloud)

## Key Abstractions

### Agent Architecture
```
Agent
├── Configuration (agent_json/agent_setup/)
├── Thread Management (agentpress/thread_manager/)
├── Tool Execution (tools/agent_tools/)
├── Memory System (memory/extraction_service/)
├── Knowledge Base (knowledge_base/)
└── Triggers (triggers/)
```

### Thread and Message Flow
1. User sends message via frontend/WebSocket
2. Message received by backend API endpoint
3. ThreadManager processes and stores message
4. Agent processes message using LLM and tools
5. Tool execution occurs in sandboxed environment
6. Results stored and streamed back to user
7. Thread state updated in database

### Tool Execution Pipeline
```
Tool Request
├── Validation (parameters, permissions)
├── Sandbox Creation (Docker/Daytona/E2B)
├── Dependency Injection (API keys, context)
├── Execution (with timeout and resource limits)
├── Result Capture (output, errors, artifacts)
├── Sandbox Cleanup
└── Result Return to Agent
```

### Data Flow Patterns

#### 1. User Interaction Flow
```
Frontend/Web → Backend API → Thread Manager → Agent Service → 
LLM Provider → Tool Execution (Sandbox) → Result → Backend → Frontend
```

#### 2. Agent Lifecycle Flow
```
Agent Creation → Configuration Storage → Thread Initialization → 
Message Processing → Tool Usage → State Updates → Persistence → 
Completion/Cleanup
```

#### 3. Real-time Updates Flow
```
Database Change (Supabase) → Realtime Subscription → 
Backend WebSocket → Frontend Update → UI Refresh
```

## Entry Points

### Backend Entry Points
1. **Main API**: `backend/api.py` - FastAPI application factory
2. **Setup Wizard**: `setup.py` - Interactive configuration utility
3. **Service Manager**: `start.py` - Backend/frontend service orchestration
4. **Worker Scripts**: Various scripts in `backend/scripts/` and `backend/evals/`
5. **Docker Entrypoint**: `backend/Dockerfile` - Container startup

### Frontend Entry Points
1. **Next.js App**: `apps/frontend/app/layout.tsx` - Root layout
2. **Page Routes**: `apps/frontend/app/*/page.tsx` - Route handlers
3. **API Routes**: `apps/frontend/app/api/*/route.ts` - Backend proxies
4. **Component Entrypoints**: `apps/frontend/components/*` - Reusable UI

### Mobile Entry Points
1. **Android**: `apps/mobile/android/app/src/main/` - Native Android
2. **iOS**: `apps/mobile/ios/` - Native iOS
3. **JS Entry**: `apps/mobile/lib/index.ts` - React Native root

### Infrastructure Entry Points
1. **Terraform**: `infra/*/main.tf` - Infrastructure definitions
2. **Deployment Scripts**: `infra/scripts/` - Deployment automation
3. **Docker Compose**: `docker-compose.yml` - Local development
4. **Setup Wizard**: `setup/ui/` - Interactive configuration

## Communication Patterns

### Synchronous Communication
- **REST API**: Backend frontend communication via JSON over HTTP
- **GraphQL**: Limited use for specific data fetching (via Supabase)
- **gRPC**: Internal service communication where performance critical

### Asynchronous Communication
- **WebSockets**: Real-time updates via Supabase Realtime
- **Message Queues**: Background task processing (implicit in worker setup)
- **Event Streaming**: Supabase change feeds for real-time collaboration
- **Webhooks**: External service integrations (Stripe, GitHub, etc.)

### Data Storage Patterns
- **Relational Data**: Supabase PostgreSQL for structured data (users, agents, threads)
- **JSONB Fields**: Flexible schema for agent configurations and metadata
- **File Storage**: Supabase Storage/S3 for binary assets and exports
- **Caching Layer**: Redis for temporary state, sessions, and rate limiting
- **Search**: Full-text search via PostgreSQL or external services

## Cross-cutting Concerns

### Security
- **Authentication**: Supabase Auth (JWT-based) with FastAPI-SSO extension
- **Authorization**: Role-based access control (RBAC) in development
- **Input Validation**: Pydantic models for API validation
- **Sanitization**: HTML/script sanitization for user-generated content
- **Secrets Management**: Environment variables and secret managers
- **Sandboxing**: Isolated execution environments for untrusted code

### Reliability
- **Error Handling**: Structured exception handling with logging
- **Retry Logic**: Exponential backoff for external service calls
- **Circuit Breakers**: Pattern implemented for critical integrations
- **Health Checks**: Endpoints for service liveness/readiness
- **Graceful Degradation**: Fallback mechanisms for non-critical features

### Observability
- **Logging**: Structured logging with multiple backends (console, file, cloud)
- **Metrics**: Prometheus exporter for service metrics
- **Tracing**: Langfuse integration for LLM call tracing
- **Analytics**: PostHog for product analytics
- **Error Tracking**: Integrated error reporting (Sentry-like capabilities)

### Scalability
- **Horizontal Scaling**: Stateless backend services behind load balancer
- **Database Scaling**: Supabase managed PostgreSQL with read replicas
- **Caching**: Redis clustering for distributed cache
- **Async Processing**: Background workers for long-running tasks
- **Resource Limits**: Sandbox resource constraints (CPU, memory, time)

## Design Patterns Employed

### Creational Patterns
- **Factory Pattern**: Agent and tool creation factories
- **Builder Pattern**: Complex agent configuration builders
- **Dependency Injection**: Service container for testability

### Structural Patterns
- **Adapter Pattern**: Third-party service integrations (LLM providers, APIs)
- **Facade Pattern**: Simplified interfaces to complex subsystems
- **Decorator Pattern**: Middleware for cross-cutting concerns (logging, auth)

### Behavioral Patterns
- **Observer Pattern**: Event-driven architecture (triggers, realtime updates)
- **Strategy Pattern**: Pluggable LLM providers and tool implementations
- **Command Pattern**: Encapsulated tool execution requests
- **State Pattern**: Agent and thread lifecycle state management
- **Template Pattern**: Standardized workflows for agent operations

## Integration Architecture

### External Services Integration
```
Kidpen Core
├── LLM Providers (via LiteLLM abstraction)
│   ├── OpenAI
│   ├── Anthropic
│   ├── Google (Vertex AI)
│   ├── AWS Bedrock
│   └── Others (OpenRouter, Replicate, etc.)
├── Authentication Providers
│   ├── Supabase Auth (primary)
│   ├── FastAPI-SSO (social logins)
│   └── Custom JWT handling
├── Payment Processing
│   └── Stripe (subscriptions, checkout, webhooks)
├── Communication
│   ├── Novu (notifications: email, SMS, push, in-app)
│   ├── Supabase Realtime (collaboration)
│   └── WebSocket connections
├── File & Storage
│   ├── AWS S3 (object storage)
│   └── Supabase Storage (user uploads)
├── Monitoring & Analytics
│   ├── PostHog (product analytics)
│   ├── Langfuse (LLM observability)
│   ├── Prometheus (metrics)
│   └── Vercel Analytics (web vitals)
└── Development & Deployment
    ├── Docker (containerization)
    ├── GitHub (version control, CI/CD)
    └── Terraform (infrastructure as code)
```

### Internal Module Dependencies
```
api.py
├── core/services/ (database, redis, llm, etc.)
├── core/agents/ (agent CRUD, tools, setup)
├── core/agentpress/ (thread management, messaging)
├── core/utils/ (logging, config, helpers)
├── core/tools/ (specific tool implementations)
├── core/endpoints/ (API endpoint definitions)
├── core/admin/ (administrative interfaces)
└── core/notifications/ (notification systems)
```

## Evolution and Extensibility Points

### Plugin Architecture
- **Tool System**: New tools can be added via `core/tools/` following interface contracts
- **LLM Providers**: New providers added through LiteLLM abstraction
- **Authentication**: Additional providers via FastAPI-SSO configuration
- **Storage**: Alternative storage backends through abstraction layers

### Customization Mechanisms
- **Environment Variables**: Configuration via `.env` files
- **Theme Customization**: Frontend theming via CSS/Tailwind
- **Workflow Customization**: Agent configuration JSON schemas
- **Branding**: White-label capabilities through configuration

### API Extensibility
- **REST Endpoints**: Easy addition through APIRouter modules
- **WebSocket Events**: Real-time event handling extensions
- **GraphQL Schema**: Extensible through Supabase metadata
- **Webhook Receivers**: Incoming webhook handling capabilities

## Deployment Architecture

### Development Environment
```
Local Machine
├── Docker Compose (services: redis, backend, frontend, worker)
├── Local Python backend development (uv run api.py)
├── Local frontend development (pnpm run dev)
├── Local mobile development (expo/react-native run)
└── Local infrastructure (optional local services)
```

### Staging/Production Environments
```
Cloud Infrastructure
├── Load Balancer (HTTP/S termination)
├── Backend Services (auto-scaling groups/containers)
├── Frontend Services (CDN + edge hosting)
├── Worker Services (background processing queues)
├── Database (Supabase managed PostgreSQL)
├── Cache (Redis managed service)
├── Object Storage (AWS S3)
├── Monitoring Stack (Prometheus, Grafana, Langfuse)
└── Logging Infrastructure (centralized log aggregation)
```

### Container Strategy
- **Backend**: Multi-stage Docker build with production optimizations
- **Frontend**: Next.js optimized build with static/dynamic hybrid
- **Worker**: Shared backend image with different entrypoint
- **Shared Base**: Common dependencies and security patches

This architecture provides a solid foundation for building, deploying, and scaling AI agent platforms while maintaining flexibility for customization and extension.