# Technical Concerns

## Security Considerations

### Authentication
- JWT-based auth via Supabase
- API key management in `core/services/api_keys_api.py`
- Admin routes require elevated permissions

### Secrets
- `.env` files for local development
- Environment-specific configs
- Backend `.env` contains sensitive keys (DB, API keys)

## Technical Debt

### Code Organization
- Large `api.py` file (700+ lines) - consider splitting
- Multiple admin API files could be consolidated
- Some circular import risks in core modules

### Dependencies
- Heavy dependency count (90+ packages)
- Some pinned to specific versions
- Potential for version conflicts

## Performance Considerations

### Rate Limiting
- IP-based limiting (MAX_CONCURRENT_IPS=25)
- May need per-user limits for scale

### Database
- Connection pooling via DBConnection
- WAL health check (`check_wal_health.py`)
- Orphan cleanup background task

### Memory
- Memory watchdog task in api.py
- psutil monitoring for resource usage

## Fragile Areas

### Startup Sequence
- Complex lifespan manager with many initializations
- Background tasks: metrics, cleanup, watchdog
- Graceful shutdown handling

### External Dependencies
- LLM provider availability (OpenAI, Anthropic)
- Sandbox services (E2B, Daytona)
- Third-party rate limits

## TODO Items
- Log files in root (`backend.log`, `frontend.log`) should be gitignored
- `.setup_progress` file suggests incomplete setup
- Model configuration for agents needs review

## Monitoring Gaps
- Structured logging in place (structlog)
- Prometheus metrics available
- May need enhanced distributed tracing
