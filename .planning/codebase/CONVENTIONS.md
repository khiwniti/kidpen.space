# Code Conventions

## Python (Backend)

### Style
- Python 3.11+ with type hints
- async/await for I/O operations
- Pydantic for request/response models
- structlog for logging (`core/utils/logger.py`)

### Patterns
```python
# Router pattern
from fastapi import APIRouter
router = APIRouter()

# Dependency injection
from core.utils.auth_utils import verify_and_get_user_id_from_jwt
user_id = Depends(verify_and_get_user_id_from_jwt)

# Database access
from core.services.db import execute_one, execute_many
result = await execute_one("SELECT * FROM ...", params)
```

### Error Handling
- HTTPException for API errors
- Structured logging with context
- Graceful degradation patterns

## TypeScript (Frontend)

### Style
- Strict TypeScript
- React 18/19 with hooks
- App Router conventions

### Patterns
```typescript
// Component files: PascalCase
// Hooks: use prefix (useAgent, useThread)
// Stores: Zustand with typed state

// Path aliases
import { Button } from '@/components/ui/button'
```

### State Management
- Zustand stores in `src/stores/`
- React Query for server state
- Local state with useState/useReducer

## Testing

### Backend (`backend/tests/`)
- pytest with pytest-asyncio
- Markers: `@pytest.mark.e2e`, `@pytest.mark.slow`
- Fixtures for database, auth mocking

### Frontend
- Vitest/Jest for unit tests
- Playwright for E2E (if configured)

## Git Conventions
- Feature branches: `feature/description`
- Commits: conventional commits style
- PR reviews required
