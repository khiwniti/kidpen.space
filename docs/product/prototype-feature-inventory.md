# Prototype Feature Inventory: kidpen.space (คิดเป็น)

**Source**: `/workspace/project/tmp_extract/kidpen-space`
**Date**: 2026-04-26
**Extracted from**: `src/app/page.tsx`, `src/lib/types.ts`, `src/app/api/*`, `worklog.md`

## Views (14 total)

All views exist as single-file components within `page.tsx` (29,348 lines):

| View Key | Thai Label | English Label | Description |
|----------|-----------|---------------|-------------|
| `landing` | หน้าแรก | Home | Landing/marketing page with hero, stats, testimonials |
| `dashboard` | แดชบอร์ด | Dashboard | Student home with 86 widgets, XP, streak, level, time-based greeting |
| `chat` | ถามครู AI | AI Tutor | Socratic tutoring chat with streaming, markdown, KaTeX, code blocks, subject context |
| `explorer` | สำรวจวิชา | Subject Explorer | Subject browsing with learning paths, suggested questions |
| `formulas` | สูตรสำคัญ | Formula Cards | Reference cards with LaTeX formulas by subject |
| `progress` | ความก้าวหน้า | Progress | Mastery radar charts, XP progress, session history |
| `notes` | บันทึก | Notes | Student notes/journal with tags, pinning, subject association |
| `planner` | ตารางเรียน | Planner | Study planner/schedule with Pomodoro timer |
| `achievements` | เหรียญรางวัล | Achievements | Badges/achievements display |
| `teacher` | ครู | Teacher | Teacher dashboard: assignments, student progress, class insights |
| `safety` | ความปลอดภัย | Safety | AI safety configuration and logs |
| `settings` | ตั้งค่า | Settings | User preferences, language toggle (TH/EN), theme (light/dark) |
| `roles` | จำลองสถานการณ์ | Role Simulation | Multi-tenant role simulation for demo/admin |
| `profile` | โปรไฟล์ | Profile | User profile with stats, quick start cards |

## API Routes (25 endpoints)

| Route | Purpose |
|-------|---------|
| `/api/admin` | Admin operations |
| `/api/admin/tenant/[id]` | Tenant management |
| `/api/analytics` | Usage analytics |
| `/api/auth` | Authentication |
| `/api/auth/session` | Session verification |
| `/api/bookmarks` | Content bookmarks |
| `/api/challenge` | Quiz challenges |
| `/api/chat` | **Socratic tutoring chat** (core feature) |
| `/api/daily-challenge` | Daily challenges |
| `/api/interactions` | Learning interaction logging |
| `/api/leaderboard` | Student leaderboard |
| `/api/mastery` | Mastery data CRUD |
| `/api/notes` | Notes CRUD |
| `/api/notifications` | User notifications |
| `/api/parent` | Parent dashboard data |
| `/api/roles` | Role management |
| `/api/stats` | Student statistics |
| `/api/student` | Student profile |
| `/api/subjects` | Subject listings |
| `/api/teacher` | Teacher operations |
| `/api/tenant` | Tenant operations |
| `/api/threads` | Chat thread management |
| `/api/users` | User management |
| `/api/voice` | Voice/ASR/TTS integration |

## Data Models (17 Prisma models)

From `prisma/schema.prisma`:

| Model | Purpose |
|-------|---------|
| `Role` | RBAC role definitions (student, teacher, parent, admin, super_admin) |
| `Permission` | Granular permission keys |
| `RolePermission` | Role-to-permission mappings |
| `User` | User accounts with auth |
| `UserSession` | Session tokens |
| `UserRoleAssignment` | User-to-role assignments with tenant scope |
| `Tenant` | Multi-tenant school/org context |
| `Student` | Learner profiles with XP, streak, grade level |
| `Teacher` | Educator profiles with subjects |
| `Assignment` | Teacher-created assignments |
| `StudentMastery` | Per-KC mastery tracking (pMastery, opportunity/correct counts) |
| `StudentInteraction` | Learning event log |
| `ChatThread` | Tutoring conversation threads |
| `ChatMessage` | Individual messages in threads |
| `ChallengeAttempt` | Quiz challenge attempts |
| `Note` | Student notes/journal |
| `Subject` | Subject metadata (key, name, icon, color, description) |

## Core Tutoring Features

### 1. Socratic Tutoring Chat (`/api/chat/route.ts`)

- **System prompt**: Thai Socratic tutor ("คิดเป็น" persona)
- **Rules**: No direct answers, always ask guiding questions, IPST curriculum alignment
- **Subject context**: 5 subjects with IPST-aligned scope descriptions
- **Streaming**: Primary (SSE), with non-streaming fallback and timeout handling (25s)
- **Message persistence**: Full thread history (last 20 messages for context)
- **Mastery integration**: Auto-updates pMastery (+0.02 per interaction), creates new KC if needed
- **XP system**: +10 XP per chat interaction
- **Interaction logging**: Records responseType, scaffoldingLevel
- **Safety**: Mental health resources (1323 hotline), "ฉันเป็น AI" disclaimer
- **Fallback handling**: Student migration from local IDs, graceful LLM error handling

### 2. Mastery & XP System

- **BKT-like mastery**: pMastery (0-1), opportunity count, correct count
- **XP & Levels**: 500 XP per level, level-up celebrations
- **Streak tracking**: Daily streak counter
- **86 dashboard widgets**: All working with Spark of Joy design

### 3. Learning Content

- **Learning paths**: Structured topic trees per subject (e.g., math: เลขคณิตพื้นฐาน → พีชคณิต → เรขาคณิต → ฟังก์ชัน → สถิติ)
- **Suggested questions**: 6 Thai questions per subject in 5 subjects (30 total)
- **Formula cards**: LaTeX-rendered formula reference
- **Quick Quiz**: 25 questions across 5 subjects
- **Daily challenges**: Rotating challenge system

### 4. Teacher/Parent Features

- **Teacher dashboard**: Assignment creation, class progress, misconceptions
- **Parent dashboard**: Progress summaries, safety views, consent management
- **Multi-tenant simulation**: Role switching for demo purposes

### 5. PDPA & Safety

- **Consent records**: guardian_name, relationship, consent_type, granted/revoked
- **AI safety log**: flag_type, severity, action_taken (blocked/warned/logged/escalated)
- **Parental consent flows**: Parent email, consent method, withdrawal tracking

## Design System

See `docs/design/kidpen-spark-of-joy-design-system.md` for full extraction.

## Mobile Patterns

- **Bottom navigation**: 6-tab mobile nav with active indicators
- **Safe area support**: `env(safe-area-inset-*)` for notch/home indicator
- **Touch targets**: 44px minimum
- **Mobile drawers**: Sidebar and "More" menu as bottom sheets
- **Responsive breakpoints**: 480px, 640px, 768px, 1024px
- **iOS zoom prevention**: 16px input font-size on mobile

## Development Metrics

| Metric | Value |
|--------|-------|
| Work sessions | 58 |
| `page.tsx` size | 29,348 lines |
| `globals.css` size | 78,743 lines |
| CSS @keyframes | 1,011 |
| Dashboard widgets | 86 |
| ESLint status | 0 errors, 0 warnings |

## Feature Gaps for Production Merge

1. **LLM integration**: Prototype uses `z-ai-web-dev-sdk`. Production uses LiteLLM/agentpress. Need to replace or adapt.
2. **Database**: SQLite/Prisma → PostgreSQL/Supabase migrations needed.
3. **Auth**: Custom RBAC → Supabase Auth + RLS.
4. **Thread management**: Custom ChatThread → agentpress thread/run system.
5. **Streaming**: Simple SSE → agentpress streaming patterns.
6. **Tool use**: No tool-use in prototype. Production has rich tool ecosystem to expose for labs.
7. **Billing**: No billing in prototype. Production has credit/tier system.
8. **Monolithic page**: 29K-line single component needs decomposition into feature modules.