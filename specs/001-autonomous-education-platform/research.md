# Research: Kidpen Autonomous Education Platform

## Decision: Canonical repository is `/Users/khiwn/kidpen/kidpen.space`

**Rationale**: This repo already contains production-grade SaaS and autonomous-agent capabilities: FastAPI backend, Supabase/Postgres, Redis streaming, AgentPress, production agent pipeline, sandbox/computer-use, billing/credits, auth/RLS, mobile, infra, tests, and evals.

**Alternatives considered**:

- Use `/Users/khiwn/kidpen-space` as canonical and import production runtime: rejected because it is prototype-grade and would require rebuilding production SaaS foundations.
- Create a new repository: rejected because it delays value and duplicates existing runtime.

## Decision: Treat `/Users/khiwn/kidpen-space` as product/UX reference

**Rationale**: The prototype contains strong Thai-first education product intent, polished dashboard UX, role demos, Socratic prompt, and learning model ideas. However, it uses SQLite, simplified auth, Next.js API routes, demo passwords, and monolithic page/CSS files.

**Alternatives considered**:

- Copy prototype files directly: rejected because it would import demo architecture and create maintenance/security risks.
- Ignore prototype and redesign from scratch: rejected because it would waste validated product direction and QA history.

## Decision: First implementation slice is the student Thai Socratic tutor loop

**Rationale**: This is the smallest complete learning loop proving the merge architecture: auth/consent, Thai dashboard, tutor chat, production agent streaming, interaction logging, mastery update, progress display.

**Alternatives considered**:

- Start with teacher dashboard: rejected because teacher insights depend on student learning data.
- Start with computer-use lab: rejected because it has higher child-safety risk and depends on policy/audit foundations.
- Migrate all widgets first: rejected due to scope and maintainability risk.

## Decision: Production chat must use autonomous agent runs, not direct completion calls

**Rationale**: The target product is an autonomous agent platform. Production runs provide lifecycle, streaming, cancellation, tracing, billing, tool access, retries, and eval integration. Direct LLM calls from prototype routes cannot satisfy operability or safety requirements.

**Alternatives considered**:

- Keep direct LLM calls for speed: rejected for production paths; may be acceptable only in isolated dev mocks.
- Build separate education-only LLM route: rejected unless it wraps the existing agent runtime and observability.

## Decision: Homework guidance requires explicit policy/evals

**Rationale**: Homework help is valuable but risky. The platform must teach, hint, check, and scaffold rather than silently complete student work. This behavior must be testable with Thai and mixed-language eval prompts.

**Alternatives considered**:

- Prompt-only rule: rejected because prompt-only safety is insufficient.
- Block all homework content: rejected because it removes a core learning use case.

## Decision: Student computer-use is disabled until policy/audit enforcement exists

**Rationale**: The production sandbox can operate browser, files, shell, and system tools. Student access must be constrained by role, age/grade, tenant, assignment, allowed resources, and consent, with audit logs for every allowed and denied action.

**Alternatives considered**:

- Full unrestricted sandbox for students: rejected as unsafe.
- No computer-use ever: rejected because controlled labs are a major platform differentiator.

## Decision: Supabase/Postgres is the source of truth for education data

**Rationale**: Production auth/RLS, billing, analytics, and multi-tenant behavior are already Supabase/Postgres-oriented. Prototype Prisma/SQLite schema should be mapped conceptually, not migrated directly.

**Alternatives considered**:

- Keep SQLite for education module: rejected for production, multi-user, RLS, and deployment needs.
- Use separate database: rejected unless a later scale requirement proves isolation is needed.

## Decision: RLS/authorization tests are mandatory for every student-data path

**Rationale**: Student data involves minors, parents, teachers, tenant boundaries, and consent. Role leaks are high-impact. Tests must cover student, teacher, parent, admin, super admin, and unauthenticated cases.

**Alternatives considered**:

- UI-only role filtering: rejected because backend authorization is required.
- Manual-only privacy QA: rejected because regressions are likely.

## Decision: Extract design system, not CSS bulk copy

**Rationale**: Prototype CSS is large and polished but monolithic. Production should convert brand colors, fonts, subject color worlds, animation principles, dark mode, reduced-motion, and mobile patterns into maintainable tokens/components.

**Alternatives considered**:

- Copy `globals.css`: rejected for maintainability and collision risk.
- Redesign visually from scratch: rejected because the prototype already defines a strong product identity.

## Decision: Mobile compatibility is designed early but implemented after web slice

**Rationale**: Production repo has Expo mobile infrastructure. Core APIs and shared types should avoid web-only assumptions, but web implementation is faster for validating the first learning loop.

**Alternatives considered**:

- Mobile-first implementation: rejected because backend/product integration risk should be reduced on web first.
- Ignore mobile: rejected because education usage likely includes phones/tablets.
