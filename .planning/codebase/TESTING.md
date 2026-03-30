# Testing Infrastructure

## Backend Testing

### Framework
- **pytest** with plugins:
  - `pytest-asyncio==0.24.0` - Async test support
  - `pytest-cov==6.0.0` - Coverage
  - `pytest-mock==3.14.0` - Mocking
  - `pytest-xdist==3.3.0` - Parallel execution
  - `pytest-timeout==2.3.1` - Test timeouts
  - `pytest-rerunfailures==10.2.0` - Flaky test retry

### Configuration (`pyproject.toml`)
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
markers = [
    "e2e: Full end-to-end tests",
    "slow: Tests taking >30s",
    "large_context: Tests with large token contexts (200k+)",
]
```

### Test Location
- `backend/tests/` - Main test directory
- `backend/evals/` - AI evaluation tests

### Running Tests
```bash
cd backend
pytest                    # All tests
pytest -m e2e            # E2E only
pytest -m "not slow"     # Skip slow tests
pytest -x --tb=short     # Fast fail mode
```

## Frontend Testing

### Location
- `apps/frontend/` - Component tests alongside source
- E2E via Playwright (if configured)

### Running
```bash
pnpm test               # Unit tests
pnpm test:e2e          # E2E tests
```

## AI/LLM Evaluation

### Braintrust Integration
- `braintrust>=0.3.15` - Eval framework
- `autoevals>=0.0.130` - Auto scoring
- Located in `backend/evals/`

### Test Harness
- `backend/core/test_harness/` - Custom testing utilities
- `backend/test_llm.py` - LLM integration tests

## Coverage
- pytest-cov for backend coverage
- Reports generated via CI/CD
