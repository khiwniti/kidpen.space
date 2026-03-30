# External Integrations

## AI/LLM Providers
- **LiteLLM**: Multi-provider abstraction (OpenAI, Anthropic, etc.)
- **Anthropic**: Claude models via `anthropic>=0.69.0`
- **OpenAI**: GPT models via `openai>=1.99.5`
- **Langfuse**: LLM observability and tracing

## Code Execution Sandboxes
- **E2B**: `e2b-code-interpreter==1.2.0` - Cloud sandboxes
- **Daytona**: `daytona-sdk>=0.115.0` - Dev environments
- **Composio**: `composio>=0.8.0` - Tool integrations

## Database & Storage
- **Supabase**: Auth, Postgres, Realtime (`supabase==2.17.0`)
- **Prisma**: ORM for database access
- **Redis/Upstash**: Caching and session state
- **PostgreSQL**: Primary database (via `psycopg`, `sqlalchemy`)
- **AWS S3**: File storage via `boto3`

## Payments & Billing
- **Stripe**: `stripe==11.6.0` - Subscriptions, payments
- Billing API in `backend/core/billing/`

## Communication
- **Mailtrap**: Email service (`mailtrap==2.0.1`)
- **Novu**: Notifications (`novu-py>=3.11.0`)

## Search & Research
- **Tavily**: Web search (`tavily-python==0.5.4`)
- **Apify**: Web scraping (`apify-client==2.3.0`)

## Analytics & Monitoring
- **Google Analytics**: `google-analytics-data>=0.18.0`
- **Prometheus**: Metrics (`prometheus-client==0.21.1`)
- **CloudWatch**: AWS logging (`watchtower>=3.0.0`)
- **Braintrust**: AI evals (`braintrust>=0.3.15`)

## Document Processing
- **Chunkr**: Document parsing (`chunkr-ai>=0.3.7`)
- **PyPDF2**, **python-docx**, **openpyxl**: Office formats
- **WeasyPrint**: PDF generation

## AI Safety
- **Reality Defender**: `realitydefender>=0.1.10` - Content moderation

## MCP (Model Context Protocol)
- `mcp==1.9.4` - Tool/resource protocol
- Located in `backend/core/mcp_module/`
