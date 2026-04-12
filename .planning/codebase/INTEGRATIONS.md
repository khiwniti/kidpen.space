# Kidpen Space External Integrations

## Overview
Kidpen Space integrates with numerous external services, APIs, and platforms to provide AI agent capabilities, data storage, authentication, payments, and extended functionality.

## Authentication & Authorization
- **Supabase Auth**: Primary authentication system (email/password, social logins, magic links)
  - Uses `@supabase/supabase-js` and `@supabase/ssr` packages
  - Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - JWT secret: `SUPABASE_JWT_SECRET`
  - Webhook secret: `SUPABASE_WEBHOOK_SECRET` (for email triggers)
- **OAuth Providers** (via Supabase):
  - Google, GitHub, Apple, Azure AD, etc.
- **Stripe Authentication**: For payment processing and customer portals
  - Environment variables: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Uses `@stripe/stripe-js` and `@stripe/react-stripe-js` frontend
  - Uses `stripe` Python package backend
- **Composio Authentication**: For tool integrations (Google Drive, Gmail, etc.)
  - Managed through Composio SDK
  - Credential profiles stored in database

## Databases & Storage
- **Supabase PostgreSQL**: Primary relational database
  - Hosted Supabase instance (cloud)
  - Connection via `DATABASE_URL` environment variable
  - Uses Prisma ORM and direct SQLAlchemy connections
  - Features: Row-level security, real-time subscriptions, pgvector extension (implied)
- **Redis**: Caching and session storage
  - Local: Redis 7-alpine via Docker Compose
  - Cloud: Upstash Redis (serverless option)
  - Environment variables: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_SSL`
  - Alternative: `REDIS_URL` environment variable
- **File Storage**:
  - **Supabase Storage**: For user uploads and agent files
  - **Google Drive API**: Alternative storage provider (OAuth integration)
  - **Nextcloud**: Self-hosted storage option
  - **Local-only**: Development/testing storage mode

## AI/ML Service Providers
- **OpenAI API**: GPT series models
  - Environment variable: `OPENAI_API_KEY`
  - Integrated via LiteLLM and direct OpenAI SDK
- **Anthropic API**: Claude series models
  - Environment variable: `ANTHROPIC_API_KEY`
  - Integrated via LiteLLM and direct Anthropic SDK
- **Google AI API**: Gemini series models
  - Environment variable: `GOOGLE_API_KEY` (implied)
  - Integrated via `google-api-python-client` and `google-auth` packages
- **Hugging Face Inference API**: Open-source models
  - Environment variable: `HUGGINGFACE_HUB_TOKEN` (implied)
  - Integrated via `huggingface-hub` and `datasets` packages
- **WebLLM**: Browser-based LLM inference
  - Enables client-side LLM execution without server roundtrips
  - Used for privacy-sensitive operations and offline capabilities
- **Replicate API**: Community model hosting
  - Environment variable: `REPLICATE_API_TOKEN` (implied)
  - Integrated via `replicate` package
- **Groq API**: Fast inference for open models
  - Environment variable: `GROQ_API_KEY` (implied)
- **Cohere API**: Embedding and generation models
  - Environment variable: `COHERE_API_KEY` (implied)

## Developer Tools & APIs
- **Tavily Search API**: AI-optimized search engine
  - Environment variable: `TAVILY_API_KEY`
  - Integrated via `tavily-python` package
  - Used for agent web search capabilities
- **Firecrawl API**: Web scraping and crawling
  - Environment variable: `FIRECRAWL_API_KEY` (implied)
- **Apify SDK**: Web scraping and automation
  - Environment variable: `APIFY_API_TOKEN` (implied)
  - Integrated via `apify-client` package
- **E2B Code Interpreter**: Secure code execution sandboxes
  - Environment variable: `E2B_API_KEY`
  - Integrated via `e2b-code-interpreter` package
- **Daytona SDK**: Secure sandbox environments
  - Environment variables: `DAYTONA_API_KEY`, `DAYTONA_SERVER_URL` (implied)
  - Integrated via `daytona-sdk`, `daytona-api-client`, and `daytona-api-client-async` packages
- **Composio Toolkit**: AI agent tool integrations
  - Environment variable: `COMPOSIO_API_KEY` (implied)
  - Provides integrations with:
    - Google Services: Gmail, Google Drive, Google Calendar, Google Docs, Google Sheets
    - GitHub: Repository management, issues, pull requests
    - Linear: Issue tracking and project management
    - Slack: Team communication and notifications
    - Notion: Knowledge base and document management
    - Twitter/X: Social media interactions
    - LinkedIn: Professional networking
    - Discord: Community platforms
    - And many others via Composio's 250+ toolkit ecosystem
- **Langfuse**: LLM observability and analytics
  - Environment variables: `LANGFUSE_SECRET_KEY`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_HOST`
  - Integrated via `langfuse` package
  - Provides tracing, monitoring, and analytics for LLM calls
- **Novu**: Notification infrastructure
  - Environment variables: `NOVU_API_KEY` (implied)
  - Integrated via `@novu/notification-center`, `@novu/nextjs`, `@novu/node` packages
  - Supports email, SMS, push, in-app, and chat notifications
- **PostHog**: Product analytics and feature flags
  - Environment variables: `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_HOST` (frontend)
  - Environment variables: `POSTHOG_API_KEY` (backend)
  - Integrated via `posthog-js` and `posthog-node` packages
- **Vercel Analytics**: Web analytics
  - Environment variables: `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` (implied)
  - Integrated via `@vercel/analytics` package
- **Vercel Speed Insights**: Performance monitoring
  - Integrated via `@vercel/speed-insights` package

## Payment & Billing
- **Stripe**: Payment processing and subscription management
  - Environment variables: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Integrated via `stripe` Python package and `@stripe/stripe-js` frontend
  - Features: One-time payments, subscriptions, customer portals, webhooks
  - Used for: Premium features, usage-based billing, enterprise plans

## Communication & Messaging
- **Email Services**:
  - **SMTP**: Generic email sending (via Mailtrap in development)
    - Environment variables: `MAILTRAP_TOKEN`, `MAILTRAP_USERNAME`, `MAILTRAP_PASSWORD`
    - Integrated via `mailtrap` package
  - **Supabase Email**: Authentication emails (magic links, confirmations)
  - **Custom Email**: Transactional emails via SendGrid/AWS SES (implied)
- **SMS Services**:
  - **Twilio**: SMS notifications and verification
    - Environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
    - Used for: Phone verification, SMS notifications
- **Push Notifications**:
  - **Novu**: Unified notification channel (includes push)
  - **Firebase Cloud Messaging**: Implied for mobile apps
- **Webhooks**:
  - **Outbound Webhooks**: For external integrations
  - **Inbound Webhooks**: Supabase webhooks for real-time database triggers
  - **Stripe Webhooks**: Payment and subscription events
  - **GitHub Webhooks**: Repository events (implied)
  - **Composio Webhooks**: Tool execution events

## Infrastructure & Deployment
- **Cloud Provider**: Microsoft Azure (primary)
  - Services used: Azure PostgreSQL, Azure Redis, Azure Storage, Azure Kubernetes Service
  - Infrastructure as Code: Azure Bicep templates
  - Monitoring: Azure Monitor (implied)
- **Container Registry**: GitHub Container Registry (ghcr.io)
  - Backend image: `ghcr.io/kidpen-ai/kidpen-backend:latest`
  - Frontend image: Built from monorepo context
- **CI/CD**: GitHub Actions (implied from .github/workflows)
- **DNS & Networking**:
  - Custom DNS: Google (8.8.8.8) and Cloudflare (1.1.1.1) for reduced latency
  - Load balancing: Implied via Azure/Azure Front Door
  - SSL/TLS: Automatic certificate management (implied)
- **Infrastructure as Code**:
  - **Pulumi**: Primary IaC tool (TypeScript/Python)
  - **Azure Bicep**: Azure-specific deployments
  - **Kubernetes Manifests**: For container orchestration
  - **Terraform**: Implied for multi-cloud support

## Monitoring & Observability
- **Logging**:
  - Structured logging via `structlog` package
  - CloudWatch Logs via `watchtower` handler
  - Application insights (Azure Monitor implied)
- **Metrics**:
  - Prometheus client for custom metrics
  - Azure Monitor metrics (implied)
  - Langfuse for LLM-specific metrics
- **Tracing**:
  - OpenTelemetry (implied via Langfuse integration)
  - Distributed tracing for agent workflows
- **Error Tracking**:
  - Sentry (implied from sentry-cli in dev dependencies)
  - Bugsnag/Rollbar (possible alternatives)
- **Health Checks**:
  - Kubernetes liveness/readiness probes
  - Docker service healthchecks (Redis, backend)
  - Custom API health endpoints

## Development & Testing
- **Package Registries**:
  - npm/jsDelivr: Frontend package distribution
  - PyPI: Python package distribution
  - GitHub Packages: Private/internal packages
- **Testing Services**:
  - Playwright Cloud: E2E testing (implied)
  - BrowserStack/Sauce Labs: Cross-browser testing (possible)
- **Code Quality**:
  - SonarQube (implied from sonarqube-scanner references)
  - CodeClimate (possible)
  - Dependabot: Automated dependency updates
- **Documentation**:
  - PostHog: Documentation analytics
  - Algolia/DocSearch: Search functionality (implied)
  - GitHub Pages/Publish: Documentation hosting

## Specialized Integrations
- **Document Processing**:
  - **Google Drive API**: File creation, editing, and management
  - **Google Docs API**: Document editing and formatting
  - **Google Slides API**: Presentation creation and manipulation
  - **Google Sheets API**: Spreadsheet operations
  - **Microsoft Graph API**: Office 365 integration (implied)
- **OCR & Text Extraction**:
  - **Tesseract OCR**: Via `pytesseract` package
  - **Google Vision API**: Implied for advanced OCR
  - **Azure Form Recognizer**: Implied for document understanding
- **Image Processing**:
  - **Stability AI API**: Image generation (implied)
  - **Midjourney API**: Image generation (implied)
  - **DALL-E API**: Image generation via OpenAI
  - **Clipdrop API**: Image editing and processing (implied)
- **Audio & Video**:
  - **Whisper API**: Speech-to-text via OpenAI
  - **ElevenLabs API**: Text-to-speech (implied)
  - **AWS Polly**: Text-to-speech (implied)
  - **Google Cloud Text-to-Speech**: TTS service (implied)
- **Web Scraping & Automation**:
  - **Browserless.io**: Headless browser automation (implied)
  - **Apify**: Web scraping and RPA
  - **Firecrawl**: AI-powered web crawling
  - **Bright Data**: Proxy and scraping infrastructure (implied)
- **Financial Data**:
  - **Plaid API**: Banking and financial data (implied)
  - **Yahoo Finance API**: Market data (implied)
  - **Alpha Vantage**: Financial market data (implied)
- **Geolocation & Mapping**:
  - **Google Maps API**: Geocoding and mapping (implied)
  - **Mapbox API**: Custom maps and visualization (implied)
  - **OpenStreetMap/Nominatim**: Free geocoding (implied)
- **Social Media**:
  - **Twitter/X API**: Social media management
  - **Facebook Graph API**: Social integration (implied)
  - **Instagram Basic Display API**: Instagram integration (implied)
  - **LinkedIn Marketing API**: B2B marketing (implied)
  - **TikTok for Business API**: Advertising and analytics (implied)

## API Gateway & Management
- **Internal API Gateway**: FastAPI routers with middleware
  - Rate limiting: Custom middleware or via Redis
  - Request/response logging: Middleware-based
  - Authentication: JWT validation middleware
  - CORS: Configured for frontend domains
  - Compression: Gzip middleware (implied)
- **External API Management**:
  - **LiteLLM**: Unified LLM API proxy and management
  - **Kong/Apigee**: Possible enterprise API management (implied)
  - **AWS API Gateway**: For serverless components (implied)
  - **Azure API Management**: For Azure-hosted services (implied)

## Data Processing & ETL
- **Message Queues**:
  - **Redis Pub/Sub**: Simple message queuing
  - **Azure Service Bus**: Enterprise queuing (implied)
  - **Amazon SQS**: Cloud queuing (implied)
  - **Apache Kafka**: Streaming platform (implied for high-scale)
- **Batch Processing**:
  - **APScheduler**: Python task scheduling
  - **Azure Functions**: Serverless batch jobs (implied)
  - **AWS Lambda**: Event-driven computing (implied)
  - **Google Cloud Functions**: Serverless computing (implied)
- **ETL Tools**:
  - **Apache Airflow**: Workflow orchestration (implied)
  - **Prefect**: Modern workflow orchestration (implied)
  - **Dagster**: Data-aware orchestration (implied)

## Security & Compliance
- **Secrets Management**:
  - **Azure Key Vault**: Primary secrets storage (implied)
  - **AWS Secrets Manager**: Multi-cloud fallback (implied)
  - **HashiCorp Vault**: Enterprise secrets management (implied)
  - **Environment Variables**: Local development and simple deployments
- **Compliance Frameworks**:
  - **GDPR**: Data protection and privacy controls
  - **SOC 2**: Security and compliance attestations (implied)
  - **HIPAA**: Healthcare compliance (implied for specific deployments)
  - **FERPA**: Educational data privacy (relevant for edtech use case)
- **Data Encryption**:
  - **At-rest encryption**: Database and storage encryption (implied)
  - **In-transit encryption**: TLS 1.3 for all external communications
  - **Field-level encryption**: Sensitive data fields (implied)
- **Identity & Access Management**:
  - **Azure Active Directory**: Primary identity provider (implied)
  - **Okta**: Enterprise SSO (implied)
  - **Auth0**: Alternative identity platform (implied)
  - **SAML 2.0**: Enterprise federation (implied)
  - **SCIM**: User provisioning (implied)
- **Security Scanning**:
  - **Dependabot**: Automated vulnerability alerts
  - **Snyk**: Security testing and monitoring
  - **GitHub Advanced Security**: Code scanning and secret detection
  - **Trivy**: Container image scanning
  - **OWASP ZAP**: Dynamic application security testing

## Legacy & Deprecated Integrations
- **Firebase**: Earlier versions may have used Firebase (migrated to Supabase)
- **MongoDB**: Earlier prototype may have used MongoDB
- **MySQL**: Earlier versions may have used MySQL
- **LocalStorage**: Browser-based storage (replaced by IndexedDB/Yjs)
- **Socket.io**: Real-time communications (replaced by Supabase Realtime)
- **WebRTC**: Peer-to-peer communications (implied for video features)
- **GraphQL**: Earlier API experiments (standardized on REST)
- **gRPC**: High-performance RPC (implied for internal services)