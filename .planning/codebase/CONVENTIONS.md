# Codebase Conventions Analysis

## Overview
This document outlines the coding conventions, patterns, and practices observed in the Kidpen codebase.

## Language & Framework Usage
- **Frontend**: React 18 with Next.js 15+, TypeScript
- **Backend**: Python with FastAPI (inferred from test patterns)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand, React Query (TanStack)
- **UI Components**: Radix UI primitives, Tiptap for rich text
- **Build Tools**: pnpm workspace, Turbopack

## Code Style & Formatting
### TypeScript/JavaScript
- **Formatter**: Prettier with configuration:
  - Semi-colons: true
  - Single quotes: true
  - Trailing comma: all
  - Tab width: 2
  - Print width: 80
- **Linting**: ESLint with Next.js core-web-vitals and typescript presets
- **Type Checking**: TypeScript in strict mode (tsc --noEmit for shared package)
- **Imports**: 
  - Absolute imports with `@/*` alias pointing to `./src/*`
  - Relative imports for local files
  - Named imports preferred over namespace imports

### Python
- **Testing Framework**: pytest
- **Async Patterns**: Heavy use of `async/await` with `httpx.AsyncClient`
- **Test Markers**: `@pytest.mark.asyncio` for async tests
- **Assertions**: Standard `assert` statements with descriptive messages

## Naming Conventions
### TypeScript/JavaScript
- **Files**: 
  - Component files: PascalCase (e.g., `GoogleSignIn.tsx`)
  - Utility files: camelCase (e.g., `file-utils.ts`)
  - Test files: Not observed (minimal testing in frontend)
- **Variables & Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types & Interfaces**: PascalCase (e.g., `HealthCheckResponse`)
- **React Components**: PascalCase
- **Hooks**: camelCase with `use` prefix (e.g., `useTranslations`)
- **API Routes**: snake_case in route paths (e.g., `/api/agents`)

### Python
- **Files**: snake_case (e.g., `test_agents.py`)
- **Classes**: PascalCase
- **Functions & Variables**: snake_case
- **Constants**: UPPER_SNAKE_CASE
- **Test Functions**: snake_case prefixed with `test_`

## Project Structure
### Frontend (`apps/frontend/`)
```
src/
├── app/                    # Next.js app router
├── components/             # Reusable UI components
├── lib/                    # Utilities, API clients, configs
│   ├── api/                # API service clients
│   ├── supabase/           # Supabase integration
│   ├── storage/            # File storage abstractions
│   ├── streaming/          # Real-time streaming utilities
│   └── utils/              # General purpose utilities
├── hooks/                  # Custom React hooks
└── styles/                 # CSS/Tailwind configurations
```

### Backend (`backend/`)
```
tests/                      # Test suite
├── api/                    # API endpoint tests
├── core/                   # Core business logic tests
└── conftest.py             # pytest configuration
```

### Shared Packages (`packages/`)
```
shared/                     # Cross-platform shared code
├── src/
│   ├── errors/             # Shared error classes
│   ├── tools/              # Shared tool definitions
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utilities
```

## Error Handling Patterns
### Frontend (TypeScript)
- **API Clients**: Custom wrapper that returns `{ data, error }` objects
- **Error Boundaries**: Global error component (`global-error.tsx`)
- **Toast Notifications**: User-facing errors via `toast.error()`
- **Logging**: `console.error()` for development
- **Custom Errors**: Shared error classes in `@agentpress/shared/errors`
- **Error Propagation**: Throwing errors in async functions with try/catch

### Backend (Python)
- **HTTP Exceptions**: FastAPI HTTPException for API errors
- **Logging**: Standard library logging
- **Test Skipping**: Conditional test skipping based on environment setup
- **Assertions**: Detailed assert messages for test clarity

## Key Patterns Observed
### React Patterns
- **Custom Hooks**: Encapsulation of side effects and state logic
- **Context Providers**: For global state (AuthProvider, etc.)
- **Server Components**: Heavy use of Next.js app router with server components
- **Client Components**: Marked with `'use client'` directive for interactivity
- **Optimistic Updates**: React Query for server state management

### Backend Patterns
- **Dependency Injection**: Test clients passed as parameters
- **Async First**: Heavy reliance on async/await patterns
- **Modular Design**: Separation of concerns (API, core, utils)
- **Configuration Management**: Environment-based configuration

## Documentation Patterns
- **JSDoc**: Used for TypeScript functions and interfaces
- **Docstrings**: Python functions and classes have descriptive docstrings
- **Inline Comments**: Explaining non-obvious logic
- **README Files**: Present in major directories

## Areas for Improvement
1. **Testing**: Minimal frontend testing observed; backend tests appear basic
2. **TypeScript Strictness**: `strict: false` in frontend tsconfig reduces type safety
3. **Consistent Error Handling**: Varied approaches across codebase
4. **Documentation**: Some complex logic lacks explanatory comments