# Source Audit Report — kidpen.space Merge

**Date**: 2026-04-26
**Auditor**: AI Agent (OpenHands) on behalf of khiwniti
**Purpose**: Pre-merge audit of production repository and prototype source tree.
## Secret Scan Results

### Production Repository (`kidpen.space`)

**Method**: Pattern-based grep for `api.?key`, `secret`, `token`, `password`, `credential`, `private.?key`, `access.?key` followed by assignment operators and string values >= 8 characters. Excluded: `.git`, `node_modules`, `.next`, `.venv`, `.gradle`, `__pycache__`, image files, lock files, `.pyc`.

| File | Finding | Severity |
|------|---------|----------|
| `sdk/README.md` | `api_key="your-api-key"` — example code, placeholder | **None** |
| `setup/tests/test_validators/test_database.py` | `password="mypassword"`, `password="p@ss:word/"` — test fixtures | **None** |

**Additional checks**:
- Environment files (`.env*`): All found files are `.env.example` templates. No real `.env` files with actual secrets committed.
- Git remote: Token-based HTTPS URL detected. **FINDING**: GitHub personal access token (PAT) embedded in git remote URL. While PATs in remotes are common for CI/CD, this is a security concern if the token has broad scopes. Recommend rotating and using git credential helper instead.
- No hardcoded API keys, private keys, or database credentials found in production source code.

### Prototype Repository (`kidpen-space`)

| File | Finding | Severity |
|------|---------|----------|
| `skills/xlsx/scenes/advanced.md` | `ws.protection.password = 'mypassword'` — example code | **None** |
| `.env` | `DATABASE_URL=file:/home/z/my-project/db/custom.db` — local SQLite path | **Info** |

**Additional checks**:
- No `.env` files beyond the local SQLite one.
- No API keys, tokens, or credentials found in source code.
- The `.env` file contains only a local database path. No production secrets.

### Overall Secret Scan Assessment

**Risk Level**: LOW
- No production secrets, API keys, or credentials found in source code of either repository.
- Git remote PAT is a minor concern — recommend rotating and using git credential helper.
- All findings are test fixtures, example placeholders, or documentation samples.
- Both codebases are safe for merge from a secret-leakage perspective.

---

## Production Repository: `/workspace/project/kidpen.space`

### Git Status

| Attribute | Value |
|-----------|-------|
| **Branch** | `main` |
| **HEAD commit** | `fd2a986` — "Add Phase 2.01 summary and update STATE with device detection completion" |
| **Remote (origin)** | `https://github.com/khiwniti/kidpen.space.git` |
| **Untracked files** | 10 (specs/, setup caches, .DS_Store) |
| **Working tree** | Clean (no uncommitted modifications) |
| **Last 5 commits** | Phase planning/summary, Google OAuth, codebase mapping, gap-closure plans, execution summary |

### File Inventory

| Category | Count |
|----------|-------|
| Tracked files (total) | 3,216 |
| Python files | 497 |
| TypeScript/TSX files | 1,369 |
| SQL migrations | 244 |
| Repository size (excl. node_modules/.next) | ~470 MB |

### Key Existing Education Infrastructure

- **Supabase migration** `20260330120000_kidpen_education_schema.sql`: Schools, user_profiles, knowledge_components, student_kc_mastery, student_interactions, courses, course_enrollments, consent_records, ai_safety_log — all with RLS policies.
- **Supabase migration** `20260412_phase1_pdpa_tables.sql`: users table with google_id/consent_status, parental_consents table.
- **Backend core**: agentpress framework, thread/run management, billing, admin APIs, sandbox pooling. No education-specific Python modules yet (T006-T017 not yet implemented).
- **Frontend**: Next.js/React app under `apps/frontend/` with existing agent platform UI. No education-specific UI yet.
- **SDK**: Python SDK at `sdk/kidpen/` for agent platform.

## Prototype Source: `/workspace/project/tmp_extract/kidpen-space`

### Source Overview

| Attribute | Value |
|-----------|-------|
| **Origin** | `kidpen-space.zip.gz` (148 MB compressed, ~155 MB extracted) |
| **Framework** | Next.js (App Router), Tailwind CSS v4, Prisma (SQLite) |
| **Language** | Thai-first UI with English fallback |

### File Inventory

| Category | Count |
|----------|-------|
| Source files (excl. images/screenshots) | 319 |
| TypeScript/TSX files (under `src/`) | 83 |
| API route handlers | 25 |
| Prisma models | 17 |
| CSS files | 1 (`globals.css`, 78,743 lines) |
| Main page component | `page.tsx` (29,348 lines) |

### Development History

58 recorded work sessions spanning from initial platform build (Task ID 1) through comprehensive QA audits, UI polish, and bug fixes (Task ID 58).

## Diff Summary: Production vs. Prototype

### What Production Has That Prototype Doesn't

- Multi-tenant agent platform backend (agentpress, thread/run management)
- Production Supabase auth (RLS, Google OAuth)
- Billing/credit system
- Desktop (Electron) and mobile (Expo) app shells
- Infrastructure-as-code (Azure, Pulumi)
- CI/CD pipelines (GitHub Actions)
- 244 Supabase migrations covering platform operations
- Admin dashboards, analytics, retention tracking

### What Prototype Has That Production Doesn't

- Complete education UI: 14 view types (dashboard, chat, explorer, formulas, progress, notes, planner, achievements, teacher, safety, settings, roles, profile, landing)
- Thai Socratic tutoring API (`/api/chat/route.ts`) with IPST curriculum alignment
- Student mastery tracking (BKT-like) with XP/streak/level systems
- Multi-role simulation: student, teacher, parent, admin views
- PDPA consent flows (UI + backend)
- 86 dashboard widgets with "Spark of Joy v2.0" design system
- Subject-specific learning paths and suggested questions
- Formula reference cards, study planner, notes, achievements
- Mobile-responsive design with bottom navigation
- 1,011 CSS @keyframes for micro-interactions
- Reduced-motion accessibility support

### Overlap / Conflict Areas

| Area | Status |
|------|--------|
| **Users/Auth** | Prototype has own RBAC (User, Role, Permission, UserRoleAssignment). Production uses Supabase auth + user_profiles. Need to reconcile. |
| **Database** | Prototype uses SQLite/Prisma. Production uses PostgreSQL/Supabase. Schema migration needed. |
| **Subjects** | Prototype: math, physics, chemistry, biology, cs. Production knowledge_components: math, science, physics, coding. Need to align. |
| **Mastery** | Prototype: StudentMastery (Prisma). Production: student_kc_mastery (Supabase). Similar but different schemas. |
| **Interactions** | Prototype: StudentInteraction. Production: student_interactions. Different column sets. |
| **Threads** | Prototype: ChatThread/ChatMessage (custom). Production: threads (agentpress). Must bridge or migrate. |