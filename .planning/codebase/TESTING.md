# Kidpen Space Testing Patterns

## Overview
This document outlines the testing strategies, frameworks, and patterns used in the Kidpen Space codebase.

## Backend Testing (Python)

### Test Framework
- **Primary**: pytest with extensive plugin ecosystem
- **Configuration**: Defined in `pyproject.toml` under `[tool.pytest.ini_options]`
- **Test Discovery**: Automatic discovery of `test_*.py` and `*_test.py` files

### Key Dependencies
From `pyproject.toml` dependencies:
- `pytest==8.3.4` - Core testing framework
- `pytest-asyncio==0.24.0` - Async test support
- `pytest-cov==6.0.0` - Coverage reporting
- `pytest-env==1.1.5` - Environment variable management
- `pytest-mock==3.14.0` - Mocking capabilities
- `pytest-xdist==3.3.0` - Parallel test execution
- `pytest-timeout==2.3.1` - Test timeout enforcement
- `pytest-randomly==3.12.0` - Random test ordering
- `pytest-rerunfailures==10.2.0` - Automatic retry of flaky tests

### Test Structure
```
backend/tests/
├── api/                  # API endpoint tests
├── core/                 # Core business logic tests
├── e2e/                  # End-to-end tests
├── conftest.py          # Shared fixtures
├── config.py            # Test configuration
└── requirements-e2e.txt # E2E specific dependencies
```

### Test Markers (from pyproject.toml)
- `e2e`: Full end-to-end tests
- `slow`: Tests taking >30 seconds
- `large_context`: Tests with large token contexts (200k+)

### Filterwarnings (from pyproject.toml)
- Ignores DeprecationWarning
- Ignores specific Pydantic shadow warnings

### Testing Patterns Observed

#### Fixtures (`conftest.py`)
- Standalone file (doesn't import backend to minimize dependencies)
- Sets up logging, environment variables
- Provides HTTP client (`httpx.AsyncClient`)
- JWT token generation utilities
- User/test data generation helpers
- Custom marker registration

#### API Tests (`tests/api/`)
- Test actual FastAPI endpoints
- Use test client to make HTTP requests
- Validate response status codes, headers, and JSON bodies
- Test both success and error cases
- Authentication flow testing (magic links, OAuth)

#### Core Logic Tests (`tests/core/`)
- Unit tests for business logic
- Mock external dependencies (Supabase, Redis, etc.)
- Test edge cases and error conditions
- Validation logic testing

#### E2E Tests (`tests/e2e/`)
- Full user journey tests
- Requires separate environment setup
- Uses `requirements-e2e.txt` for additional dependencies
- Tests real API interactions with test accounts

### Mocking Strategies
- **External Services**: Mock Supabase, Redis, external APIs
- **Selective Mocking**: Mock at service boundary, not internal functions
- **Tools**: `unittest.mock` via `pytest-mock` plugin
- **Patterns**:
  - Patch external calls at import level
  - Use side_effect for dynamic return values
  - Assert call counts and arguments

### Assertions & Validation
- Standard pytest assertions (`assert`)
- JSON schema validation for API responses
- Status code verification
- Header validation
- Response time assertions (for performance)
- Database state verification

### Coverage
- Configured via `pytest-cov`
- Targets likely 80%+ based on plugin inclusion
- Coverage reports generated in HTML/XML formats

### Test Execution
- Local: `pytest` or `python -m pytest`
- Parallel: `pytest -n auto` (via pytest-xdist)
- With coverage: `pytest --cov=backend`
- Specific markers: `pytest -m e2e`
- Timeout enforcement: Built-in via pytest-timeout

## Frontend Testing (Next.js/React)

### Current State
Limited observable testing infrastructure in frontend:
- No explicit test files found in standard locations (`__tests__`, `*.test.*`, `*.spec.*`)
- No test scripts in `package.json`
- No testing frameworks explicitly listed in devDependencies

### Testing Frameworks Likely Used (based on Next.js ecosystem)
- **Jest**: Most common for React unit/testing
- **React Testing Library**: For component testing
- **Cypress/Playwright**: For end-to-end testing
- **Vitest**: Alternative to Jest (faster, ESM-native)

### Expected Testing Patterns
Based on code structure and imports:

#### Component Testing
- Test UI components in isolation
- Mock data fetching (React Query, SWR)
- Test user interactions and state changes
- Test accessibility (axe-core implied)

#### Hook Testing
- Custom hooks testing (useSWR, useQuery equivalents)
- Test loading, error, and success states
- Test cleanup and race conditions

#### Integration Testing
- Test component interactions
- Test React Query cache behavior
- Test form validation and submission

#### E2E Testing
- Test critical user flows (auth, project creation, agent interaction)
- Test across different viewport sizes
- Test internationalization

### Potential Test Structure (Inferred)
```
apps/frontend/
├── __tests__/              # or tests/
│   ├── components/         # Component tests
│   ├── hooks/              # Custom hook tests
│   ├── pages/              # Page tests
│   └── integration/        # Integration tests
├── cypress/                # or playwright/
│   ├── e2e/
│   ├── fixtures/
│   └── support/
└── jest.config.ts          # or vitest.config.ts
```

### Mocking Strategies (Expected)
- **API Mocking**: Mock Supabase/client calls
- **React Query Mocking**: Mock query clients and cache
- **Date Mocking**: For time-sensitive tests
- **Local Storage/Cookie Mocking**: For persistence tests
- **Router Mocking**: For navigation tests

### Assertions & Validation
- DOM assertions (React Testing Library)
- Async assertions (waitFor, findBy*)
- Visual regression testing (implied by design system focus)
- Performance assertions (Lighthouse CI implied)

## Cross-Testing Conventions

### Test Data Management
- **Factories**: Likely using factory_boy (Python) or equivalent (JS)
- **Fixtures**: Pre-defined test datasets
- **Factories over fixtures**: Preferred for flexibility
- **Seeding**: Deterministic test data generation

### Environment & Configuration
- **Test Environments**: Separate config for test runs
- **Environment Variables**: `.env.test` or similar
- **Service Mocking**: External services mocked in test environment
- **Database**: Test database migrations/rollback

### CI/CD Integration
- **GitHub Actions**: Likely configured (`.github/workflows/`)
- **Test Stages**: Unit → Integration → E2E
- **Coverage Thresholds**: Minimum coverage requirements
- **Parallel Execution**: Speed up test suites
- **Artifacts**: Test reports, coverage reports, screenshots

### Performance Testing
- **Load Testing**: k6 or locust implied for backend
- **Bundle Analysis**: Frontend bundle size monitoring
- **Lighthouse CI**: Performance, accessibility, SEO scores
- **Benchmark Tests**: Critical path performance tracking

### Security Testing
- **Dependency Scanning**: npm audit, pyup, safety
- **Static Analysis**: SonarQube, CodeQL, or similar
- **Pen Testing**: Scheduled security assessments
- **Secrets Detection**: git-secrets, truffleHog

## Recommendations for Improvement

### Backend
1. **Increase Test Coverage**: Current reliance on pytest plugins suggests room for growth
2. **Add Property-Based Testing**: Hypothesis for edge case discovery
3. **Contract Testing**: Pact or similar for service agreements
4. **Performance Test Suite**: Dedicated load/stress tests

### Frontend
1. **Establish Testing Infrastructure**: Add Jest/Vitest and React Testing Library
2. **Add Test Scripts**: To package.json (`test`, `test:watch`, `test:cov`)
3. **Component Testing**: Start with shared components and hooks
4. **E2E Setup**: Cypress or Playwright for critical user flows
5. **Visual Testing**: Storybook with Chromatic for UI regression

### Both
1. **Test Templates**: Standard boilerplate for new test files
2. **Mock Libraries**: Standardized mocking helpers
3. **Test Documentation**: Guidelines for writing effective tests
4. **Flake Detection**: Automated flaky test identification