# Kidpen Space Code Conventions

## Overview
This document outlines the coding conventions, patterns, and best practices used in the Kidpen Space codebase.

## Frontend Conventions (Next.js/React/TypeScript)

### Code Style & Formatting
- **Formatter**: Prettier with configuration:
  - `semi: true`
  - `singleQuote: true`
  - `trailingComma: "all"`
  - `tabWidth: 2`
  - `printWidth: 80`
- **Linter**: ESLint with Next.js configuration:
  - Extends: `next/core-web-vitals`, `next/typescript`
  - Custom rules in `eslint.config.mjs`:
    - `@typescript-eslint/no-unused-vars`: off
    - `@typescript-eslint/no-explicit-any`: off
    - `react/no-unescaped-entities`: off
    - `react-hooks/exhaustive-deps`: warn
    - `@next/next/no-img-element`: warn
    - `@typescript-eslint/no-empty-object-type`: off
    - `prefer-const`: warn
- **Type Checking**: TypeScript ^5 with strict mode implied
- **CSS Framework**: Tailwind CSS ^4 with custom utilities

### Naming Conventions
- **Components**: PascalCase (e.g., `ThemeProvider`, `AuthProvider`)
- **Functions & Variables**: camelCase (e.g., `createClient`, `normalizedEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_THEME`)
- **Files**: 
  - Components: PascalCase.tsx (e.g., `PostHogIdentify.tsx`)
  - Utilities/functions: camelCase.ts (e.g., `getBackendUrl.ts`)
  - Tests: `[name].test.ts` or `[name].spec.ts` pattern (though limited tests observed)
- **Routes**: Next.js 13 App Router convention:
  - Route segments: lowercase with hyphens (e.g., `/auth/password/`)
  - Server Components: default export
  - Client Components: `"use client"` directive at top

### Import Organization
- **Order**:
  1. External libraries (React, Next.js, etc.)
  2. Internal packages (@/ prefixed)
  3. Local components and utilities
  4. Types
  5. Styles/CSS
- **Aliases**: 
  - `@/` for `apps/frontend/src/`
  - `@agentpress/shared` for shared package

### Patterns & Architecture
- **State Management**: 
  - React Query for server state (`@tanstack/react-query`)
  - Zustand for client state (`zustand`)
  - Context API for theme/auth/provider patterns
- **Data Fetching**:
  - Server Components for initial data
  - React Query hooks for client-side data
  - Mutations via React Query for updates
- **Forms**: React Hook Form with Zod validation (`@hookform/resolvers`)
- **Authentication**: 
  - Supabase magic link authentication
  - Custom protocol handling for desktop/mobile (`kidpen://`)
  - Server actions for auth flows (`'use server'`)
- **Internationalization**: 
  - next-intl for translations
  - Locale detection from localStorage/cookie
  - Language-specific JSON files in `/translations/`
- **Analytics & Tracking**:
  - Vercel Analytics, PostHog, Google Tag Manager
  - Custom event tracking via Context providers
  - Lazy loading of analytics scripts
- **Error Boundaries**: 
  - React Error Boundaries implied through Next.js error handling
  - Toast notifications via Sonner (`@/components/ui/sonner`)

### Error Handling
- **Server Actions**: 
  - Return objects with `{ success: boolean, message: string }` or `{ message: string }` for errors
  - Use try/catch around Supabase calls
  - Map Supabase errors to user-friendly messages
- **Client Components**:
  - Try/catch in event handlers
  - Error states managed with React state/Zustand
  - User feedback via toast notifications
- **Validation**:
  - Zod schemas for form validation
  - Input sanitization (trimming, lowercasing emails)
  - Client-side validation before API calls
- **Logging**:
  - Limited console logging observed
  - Structured logging via PostHog for analytics

### Environment Variables
- **Prefix**: `NEXT_PUBLIC_` for client-exposed variables
- **Examples**:
  - `NEXT_PUBLIC_BACKEND_URL`
  - `NEXT_PUBLIC_GTM_ID`
  - `NEXT_PUBLIC_URL`
- **Loading**: `.env.example` for template, `.env.local` for secrets

## Backend Conventions (Python/FastAPI)

### Code Style & Formatting
- **Formatter**: Likely Black or Ruff (not explicitly configured but standard)
- **Linter**: Flake8 or Ruff implied by pre-commit setup
- **Type Hints**: Python 3.11+ with typing module
- **Import Order**: Standard library → third-party → local imports

### Naming Conventions
- **Classes**: PascalCase (e.g., `HTTPException`, `FastAPI`)
- **Functions & Variables**: snake_case (e.g., `create_client`, `normalized_email`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TOKENS`, `DEFAULT_LIMIT`)
- **Files**: snake_case (e.g., `api.py`, `conftest.py`)
- **Tests**: `test_*.py` or `*_test.py` (observed: `sandbox_timing_test.py`)

### Import Organization
- Standard library imports first
- Third-party packages (fastapi, supabase, etc.)
- Local application imports
- Relative imports for same-package modules

### Patterns & Architecture
- **Framework**: FastAPI with async route handlers
- **API Design**:
  - RESTful endpoints with versioning implied
  - Dependency injection via FastAPI Depends
  - Pydantic models for request/response validation
  - HTTP status codes per REST conventions
- **Authentication**:
  - Supabase JWT validation
  - Magic link/OAuth flows
  - Role-based access control implied
- **Data Access**:
  - Supabase client for PostgreSQL interactions
  - Direct SQL queries for complex operations
  - Connection pooling implied
- **Background Jobs**:
  - Redis for queuing (scripts like `create_sandbox_pool.py`)
  - Celery or RQ implied for task processing
- **Configuration**:
  - Pydantic Settings for environment validation
  - python-dotenv for .env loading
  - Centralized config in `pyproject.toml`
- **Logging**:
  - structlog for structured logging
  - Standard logging library as fallback
  - Log levels: INFO, DEBUG, ERROR, WARNING

### Error Handling
- **HTTP Exceptions**: FastAPI's `HTTPException` with appropriate status codes
- **Validation Errors**: Automatic 422 responses from Pydantic
- **Exception Handlers**: Custom handlers for specific exceptions
- **Logging**: Errors logged with context before raising
- **External Services**: 
  - Try/catch around Supabase, Redis, external API calls
  - Circuit breaker pattern implied for resilience
  - Fallback values or graceful degradation
- **Database**: 
  - Transaction management with Supabase
  - Constraint violation handling
  - Connection retry logic implied

### Testing Conventions (Backend)
- **Framework**: pytest with plugins:
  - pytest-asyncio for async tests
  - pytest-cov for coverage reporting
  - pytest-mock for mocking
  - pytest-xdist for parallel execution
  - pytest-timeout for test timeouts
  - pytest-randomly for random test order
  - pytest-rerunfailures for flaky test retry
- **Structure**:
  - `tests/` directory mirroring application structure
  - `conftest.py` for shared fixtures
  - Test files named `test_*.py` or `*_test.py`
  - Markers for test categorization:
    - `@pytest.mark.e2e`: End-to-end tests
    - `@pytest.mark.slow`: Tests >30s
    - `@pytest.mark.large_context`: Tests with large token contexts
- **Fixtures**:
  - Database setup/teardown
  - Mock external services
  - Authentication tokens
  - Test clients
- **Mocking**:
  - `unittest.mock` or `pytest-mock` patching
  - External service mocking (Supabase, Redis, etc.)
  - Selective mocking to test integration points
- **Assertions**:
  - Standard pytest assertions
  - JSON schema validation for API responses
  - Performance assertions for critical paths

## Cross-Cutting Conventions

### Documentation
- **README.md**: Project overview and setup instructions
- **Inline Docs**: JSDoc/TypeDoc for frontend, docstrings for backend
- **API Docs**: OpenAPI/Swagger generation from FastAPI endpoints
- **Architecture**: Decision records in `.planning/` directory

### Security
- **Input Validation**: Strict validation at entry points (forms, APIs)
- **Authentication**: Passwordless magic links, JWT validation
- **Authorization**: Role-based checks, RLS (Row Level Security) in Supabase
- **Secrets Management**: Environment variables, .gitignore protection
- **CORS**: Configured appropriately for frontend domains
- **Rate Limiting**: Implied via middleware or API gateway

### Performance
- **Frontend**:
  - Code splitting via dynamic imports (`React.lazy`)
  - Image optimization (Next.js Image component)
  - Font preloading and optimization
  - Bundle analysis implied
- **Backend**:
  - Database query optimization
  - Redis caching for frequent requests
  - Pagination for large datasets
  - Async/await for non-blocking I/O
- **Both**:
  - CDN usage for static assets
  - Compression enabled (gzip/brotli)
  - Caching headers for static resources

### Deployment
- **Containerization**: Docker Compose for local development
- **Orchestration**: Kubernetes configurations in `/infra/`
- **CI/CD**: GitHub Actions implied (`.github/` directory)
- **Environment**: Separate configs for dev/staging/prod
- **Monitoring**: Health checks, logging, metrics collection