# External Integrations

## Databases
- **Supabase** (PostgreSQL-based) - Primary database and auth
  - Client libraries: @supabase/supabase-js, @supabase/ssr (frontend), supabase (backend)
  - ORM: Prisma (TypeScript) and SQLAlchemy (Python alternatives)
  - Direct PostgreSQL access via psycopg[binary]
  - Migration management via Supabase CLI
  - Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

- **Redis** & **Upstash Redis** - Caching layer
  - Used for session storage, rate limiting, temporary data
  - Environment variables: REDIS_URL, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

## Authentication Providers
- **Supabase Auth** - Primary authentication system
  - Email/password, magic links, social logins
  - JWT-based session management
  - Integration via Supabase client libraries

- **FastAPI-SSO** - Additional social login support
  - Google, GitHub, Azure AD, etc. (configurable)
  - Package: fastapi-sso>=0.9.0

## Payment Providers
- **Stripe** - Payment processing and billing
  - Frontend: @stripe/stripe-js, @stripe/react-stripe-js
  - Backend: stripe==11.6.0
  - Features: Subscriptions, checkout sessions, webhooks, customer portal
  - Database tracking: stripe_subscription_id, stripe_subscription_status, stripe_event_id
  - Environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID

## AI/LLM Providers
- **OpenAI** - GPT series models
  - Package: openai>=1.99.5
  - Access via direct API or LiteLLM abstraction
  - Environment variable: OPENAI_API_KEY

- **Anthropic** - Claude series models
  - Package: anthropic>=0.69.0
  - Access via direct API or LiteLLM abstraction
  - Environment variable: ANTHROPIC_API_KEY

- **Google** - Gemini models (Vertex AI)
  - Packages: google-api-python-client>=2.120.0, google-auth, google-auth-oauthlib, google-auth-httplib2
  - Environment variable: GOOGLE_API_KEY or service account credentials

- **OpenRouter** - LLM aggregator
  - Accesses multiple providers (OpenAI, Anthropic, etc.) via single API
  - Environment variable: OPENROUTER_API_KEY
  - Used for model fallback and cost optimization

- **AWS Bedrock** - Amazon's LLM service
  - Access to models like Claude, Titan, Jurassic-2
  - Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BEARER_TOKEN_BEDROCK

- **xAI** - Grok models
  - Environment variable: XAI_API_KEY

- **Minimax** - Chinese LLM provider
  - Environment variable: MINIMAX_API_KEY

- **Replicate** - Open-source model hosting
  - Package: replicate>=0.25.0
  - Environment variable: REPLICATE_API_KEY
  - Used for running Llama, Mistral, Stable Diffusion, etc.

- **Hugging Face** - Model and dataset hosting
  - Packages: huggingface-hub>=0.34.4, datasets>=4.4.2
  - Environment variable: HF_TOKEN
  - Used for accessing open-source models and training data

## Analytics & Monitoring
- **PostHog** - Product analytics and feature flags
  - Frontend: posthog-js
  - Backend: posthog-node
  - Environment variables: POSTHOG_PERSONAL_API_KEY, POSTHOG_HOST

- **Vercel Analytics** - Web vitals and performance monitoring
  - Package: @vercel/analytics, @vercel/speed-insights
  - Environment variables: VERCEL_ANALYTICS_ID, VERCEL_SPEED_INSIGHTS_TOKEN

- **Langfuse** - LLM observability and tracing
  - Package: langfuse==2.60.5
  - Tracks LLM calls, token usage, latency, costs
  - Environment variables: LANGFUSE_SECRET_KEY, LANGFUSE_PUBLIC_KEY, LANGFUSE_HOST

- **Prometheus** - Metrics collection and alerting
  - Package: prometheus-client==0.21.1
  - Exposes metrics endpoint for scraping

- **Watchtower** - AWS CloudWatch Logs integration
  - Package: watchtower>=3.0.0
  - Sends application logs to CloudWatch
  - Requires AWS credentials

## Communication & Notifications
- **Novu** - Notification infrastructure
  - Frontend: @novu/nextjs, @novu/notification-center
  - Backend: novu-py>=3.11.0
  - Supports email, SMS, push, in-app, chat notifications
  - Environment variables: NOVU_API_KEY

- **Cal.com** - Scheduling and booking system
  - Package: @calcom/embed-react
  - Embeddable scheduling widget
  - Environment variables: CAL_COM_API_KEY

## File Storage & Processing
- **AWS S3** - Object storage for file uploads
  - Package: boto3>=1.40.74
  - Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME, AWS_S3_REGION_NAME

## Development & Deployment
- **Docker** - Containerization platform
  - Used for consistent development, testing, and production environments
  - Configuration: Dockerfiles, docker-compose.yaml

- **GitHub** - Version control and CI/CD
  - Hosts source code repository
  - GitHub Actions workflows in .github/workflows/
  - Environment variable: GITHUB_TOKEN (for API access)

- **Vercel** - Frontend hosting platform (likely deployment target)
  - Optimized for Next.js applications
  - Environment variables: VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_GIT_COMMIT_SHA

## Code Execution & Sandboxing
- **Daytona** - Secure code execution sandbox
  - Packages: daytona-sdk>=0.115.0, daytona-api-client, daytona>=0.21.6
  - Used for executing untrusted code in agent sandbox
  - Environment variables: DAYTONA_API_KEY, DAYTONA_SERVER_URL

- **E2B** - Code interpretation service
  - Package: e2b-code-interpreter==1.2.0
  - Alternative code execution environment
  - Environment variable: E2B_API_KEY

## Miscellaneous Services
- **Apify** - Web scraping and automation
  - Package: apify-client==2.3.0
  - Environment variable: APIFY_TOKEN
  - Used for extracting data from websites for agent training

- **Reality Defender** - Deepfake and AI-generated content detection
  - Package: realitydefender>=0.1.10
  - Environment variable: REALITY_DEFENDER_API_KEY
  - Used for content safety and moderation

- **Braintrust** & **Autoevals** - LLM evaluation and experimentation
  - Packages: braintrust>=0.3.15, autoevals>=0.0.130
  - Used for evaluating LLM outputs, prompt engineering, regression testing

- **Chunkr AI** - Document processing and chunking
  - Package: chunkr-ai>=0.3.7
  - Used for preparing documents for Retrieval-Augmented Generation (RAG)

- **VTracer** - Raster-to-vector graphics conversion
  - Package: vtracer>=0.6.0
  - Converts PNG/JPG images to SVG format

- **SVGLib** - SVG parsing and manipulation
  - Package: svglib==1.5.1
  - Used for processing SVG files

- **CSSUtils** - CSS parsing and manipulation
  - Package: cssutils>=2.9.0
  - Used for parsing, modifying, and generating CSS

- **Google Analytics Data** - GA4 analytics access
  - Package: google-analytics-data>=0.18.0
  - Environment variable: GOOGLE_APPLICATION_CREDENTIALS

- **PDF Processing** - Document generation and manipulation
  - Packages: weasyprint>=63.0, PyPDF2==3.0.1, reportlab>=4.0.0
  - Used for PDF generation, text extraction, and manipulation

- **Document Processing** - Office file handling
  - Packages: python-docx==1.1.0, openpyxl==3.1.2
  - Used for Word and Excel file manipulation

- **Image Processing** - Image manipulation and analysis
  - Packages: Pillow>=10.4.0 (PIL fork)
  - Used for image resizing, filtering, format conversion

- **OCR** - Optical Character Recognition
  - Package: pytesseract==0.3.13
  - Used for extracting text from images

- **Mermaid** - Diagram generation
  - Package: mermaid^11.12.0
  - Used for creating flowcharts, sequence diagrams, etc. from text

- **Email Handling** - Email sending and validation
  - Packages: mailtrap==2.0.1 (testing), email-validator==2.0.0
  - Mailtrap for development/testing, validator for email format checking

- **Phone Number Handling** - Phone number parsing and validation
  - Package: libphonenumber-js^1.12.10
  - Used for international phone number formatting and validation

- **WebSocket Connections** - Real-time communication
  - Implied by Supabase real-time subscriptions and yjs/y-indexeddb packages
  - Used for live collaboration features

## Configuration Methods
- Environment variables (.env files)
- Docker Compose for service orchestration
- Supabase CLI for database management
- GitHub Actions for CI/CD workflows
- Makefile for development commands