# Phase 1: Fork & Foundation
## kidpen.space Implementation Plan

**Phase Duration**: Weeks 1-6
**Start Date**: TBD
**Generated**: 2026-03-30

---

## Phase Goal Statement

**Objective**: Establish kidpen.space as a functional fork of Suna with Thai branding, Google OAuth authentication, and PDPA-compliant database infrastructure.

### Success Criteria
- [ ] Suna fork deployed at kidpen.space domain (or staging URL)
- [ ] Google OAuth working with Thai locale (`hl=th`)
- [ ] Basic Thai UI shell with Sarabun typography
- [ ] Supabase Singapore region configured with PDPA tables
- [ ] CI/CD pipeline operational (GitHub Actions)
- [ ] i18n framework with Thai localization files

---

## Task Breakdown

### Category: Repository (Week 1)

| Task ID | Description | Acceptance Criteria | Dependencies | Effort |
|---------|-------------|---------------------|--------------|--------|
| P1-T01 | Fork kortix-ai/suna → kidpen/kidpen.space | Repository exists at kidpen/kidpen.space | None | 1h |
| P1-T02 | Rename project references | All `suna` references → `kidpen` in package.json, configs | P1-T01 | 2h |
| P1-T03 | Update pnpm-workspace.yaml | Workspace config validated, `pnpm install` succeeds | P1-T02 | 1h |
| P1-T04 | Configure .env structure | `.env.example` with all required variables documented | P1-T02 | 2h |
| P1-T05 | Set up GitHub Actions CI | Lint + typecheck passing on push to main | P1-T03 | 4h |
| P1-T06 | Update README.md | kidpen.space branding, setup instructions | P1-T02 | 2h |

### Category: Infrastructure (Week 2)

| Task ID | Description | Acceptance Criteria | Dependencies | Effort |
|---------|-------------|---------------------|--------------|--------|
| P1-T07 | Create Supabase project (Singapore) | Project created in `ap-southeast-1` region | None | 1h |
| P1-T08 | Configure Supabase environment | Connection strings in `.env`, local dev working | P1-T07 | 2h |
| P1-T09 | Set up Vercel project | Staging deployment at `kidpen-staging.vercel.app` | P1-T05 | 3h |
| P1-T10 | Configure environment variables | Vercel env vars synced with `.env.example` | P1-T09 | 1h |
| P1-T11 | Verify deployment pipeline | Push → build → deploy working E2E | P1-T09, P1-T10 | 2h |

### Category: Database (Week 2-3)

| Task ID | Description | Acceptance Criteria | Dependencies | Effort |
|---------|-------------|---------------------|--------------|--------|
| P1-T12 | Create `users` table | Schema per RESEARCH.md, migration file created | P1-T07 | 2h |
| P1-T13 | Create `parental_consents` table | Schema per RESEARCH.md, FK to users | P1-T12 | 2h |
| P1-T14 | Add performance indexes | `idx_users_google_id`, `idx_consents_user_id` created | P1-T12, P1-T13 | 1h |
| P1-T15 | Configure RLS policies | Row-level security enabled, users can only access own data | P1-T12, P1-T13 | 3h |
| P1-T16 | Create migration scripts | Up/down migrations in `backend/supabase/migrations/` | P1-T12-T15 | 2h |

**Database Schema Reference**:
```sql
-- backend/supabase/migrations/001_pdpa_tables.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(100),
    grade_level SMALLINT CHECK (grade_level BETWEEN 1 AND 6),
    birth_year SMALLINT,
    consent_status JSONB,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE parental_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_email VARCHAR(255),
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP,
    consent_method VARCHAR(50),
    ip_address VARCHAR(45),
    withdrawn_date TIMESTAMP
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_consents_user_id ON parental_consents(user_id);
```

### Category: Authentication (Week 3-4)

| Task ID | Description | Acceptance Criteria | Dependencies | Effort |
|---------|-------------|---------------------|--------------|--------|
| P1-T17 | Create Google Cloud OAuth credentials | Client ID/Secret generated, redirect URIs configured | None | 2h |
| P1-T18 | Configure Supabase Google provider | OAuth flow works with Supabase Auth | P1-T17, P1-T08 | 3h |
| P1-T19 | Add Thai locale to OAuth | `hl=th` parameter in auth redirect | P1-T18 | 1h |
| P1-T20 | Implement age verification | Birth year collection, minor detection (< 20 years) | P1-T18 | 4h |
| P1-T21 | Add grade level selection | ม.1-ม.6 selector in registration flow | P1-T20 | 3h |
| P1-T22 | Create auth callback handler | `apps/web/app/auth/callback/` route handling | P1-T18 | 3h |
| P1-T23 | Implement session management | JWT refresh, session persistence | P1-T22 | 4h |
| P1-T24 | Add auth state context | React context for auth state in `apps/web/` | P1-T23 | 3h |

### Category: Frontend (Week 5-6)

| Task ID | Description | Acceptance Criteria | Dependencies | Effort |
|---------|-------------|---------------------|--------------|--------|
| P1-T25 | Replace Suna branding assets | Logo, favicon, colors updated in `apps/web/public/` | P1-T01 | 3h |
| P1-T26 | Add Sarabun font stack | Font loaded via Google Fonts, CSS variables configured | P1-T25 | 2h |
| P1-T27 | Set up i18n framework | `next-intl` or `react-i18next` configured | P1-T01 | 4h |
| P1-T28 | Create Thai locale files | `apps/web/locales/th/common.json` created | P1-T27 | 3h |
| P1-T29 | Create auth locale files | `apps/web/locales/th/auth.json` created | P1-T27 | 2h |
| P1-T30 | Create consent locale files | `apps/web/locales/th/consent.json` created | P1-T27 | 2h |
| P1-T31 | Build Thai navigation shell | Header, sidebar, footer with Thai labels | P1-T26, P1-T28 | 6h |
| P1-T32 | Implement responsive layout | 320px-1920px viewport support | P1-T31 | 4h |
| P1-T33 | Create basic subject selection UI | Math, Physics, Chemistry, Biology selectors | P1-T31 | 4h |
| P1-T34 | Create ChatDashboard container | `apps/web/components/chat/dashboard/` with Thai labels | P1-T31, P1-T28 | 3h |
| P1-T35 | Create MasteryOverview component | Overall mastery %, scaffold level indicator, active subject display | P1-T34 | 4h |
| P1-T36 | Create SubjectCard component | Subject mastery cards (คณิตศาสตร์, วิทยาการคำนวณ, ฟิสิกส์, ชีววิทยา) | P1-T34 | 3h |
| P1-T37 | Integrate ChatDashboard into chat UI | Render dashboard below agent chat interface | P1-T34, P1-T35, P1-T36 | 2h |

**Typography Stack Reference**:
```css
/* apps/web/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

:root {
  --font-thai: 'Sarabun', 'Noto Sans Thai', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

**Localization Structure**:
```
apps/web/locales/
└── th/
    ├── common.json      # UI strings (navigation, buttons)
    ├── auth.json        # Auth flow strings
    ├── consent.json     # PDPA consent strings
    └── dashboard.json   # Dashboard UI strings
```

### Category: Documentation (Week 6)

| Task ID | Description | Acceptance Criteria | Dependencies | Effort |
|---------|-------------|---------------------|--------------|--------|
| P1-T38 | Update setup guide | Local dev setup documented in README | P1-T01-T16 | 2h |
| P1-T39 | Document environment variables | All env vars documented with examples | P1-T04 | 1h |
| P1-T40 | Create architecture decision record | ADR for Phase 1 decisions in `.planning/` | All | 2h |

---

## Week-by-Week Schedule

### Week 1: Repository Setup
| Day | Tasks | Deliverable |
|-----|-------|-------------|
| Mon | P1-T01, P1-T02 | Forked and renamed repo |
| Tue | P1-T03, P1-T04 | Workspace and env configured |
| Wed-Thu | P1-T05 | CI/CD pipeline |
| Fri | P1-T06 | README updated |

### Week 2: Infrastructure
| Day | Tasks | Deliverable |
|-----|-------|-------------|
| Mon | P1-T07, P1-T08 | Supabase Singapore project |
| Tue-Wed | P1-T09, P1-T10, P1-T11 | Vercel deployment |
| Thu-Fri | P1-T12, P1-T13 | PDPA tables created |

### Week 3: Database & Auth Start
| Day | Tasks | Deliverable |
|-----|-------|-------------|
| Mon | P1-T14, P1-T15 | Indexes and RLS |
| Tue | P1-T16 | Migration scripts |
| Wed | P1-T17 | Google OAuth credentials |
| Thu-Fri | P1-T18, P1-T19 | Supabase OAuth with Thai locale |

### Week 4: Authentication Complete
| Day | Tasks | Deliverable |
|-----|-------|-------------|
| Mon-Tue | P1-T20, P1-T21 | Age + grade verification |
| Wed | P1-T22 | Auth callback handler |
| Thu | P1-T23 | Session management |
| Fri | P1-T24 | Auth state context |

### Week 5: Thai UI Foundation
| Day | Tasks | Deliverable |
|-----|-------|-------------|
| Mon | P1-T25, P1-T26 | Branding + Sarabun font |
| Tue-Wed | P1-T27 | i18n framework setup |
| Thu-Fri | P1-T28, P1-T29, P1-T30 | Thai locale files |

### Week 6: UI Completion & Docs
| Day | Tasks | Deliverable |
|-----|-------|-------------|
| Mon-Tue | P1-T31 | Thai navigation shell |
| Wed | P1-T32, P1-T33 | Responsive layout + Subject selection UI |
| Thu | P1-T34, P1-T35, P1-T36 | ChatDashboard + MasteryOverview + SubjectCard |
| Fri | P1-T37, P1-T38, P1-T39, P1-T40 | Dashboard integration + Documentation |

---

## Risk Mitigation

### Risk 1: Suna Schema Conflicts
- **Risk**: Existing Suna tables may conflict with kidpen.space requirements
- **Probability**: Medium
- **Mitigation**:
  - Create kidpen-specific schema namespace
  - Prefix tables with `kp_` if conflicts arise
  - Review `backend/supabase/` structure before migration
- **Owner**: Backend engineer
- **Detection**: Week 2 during P1-T12

### Risk 2: Auth Module Coupling
- **Risk**: Suna auth may be tightly coupled to Suna-specific flows
- **Probability**: Medium
- **Mitigation**:
  - Review `backend/auth/` structure in Week 3
  - Extend rather than replace auth module
  - Create separate `kidpen_auth.py` if needed
- **Owner**: Backend engineer
- **Detection**: Week 3 during P1-T18

### Risk 3: pnpm Version Compatibility
- **Risk**: pnpm workspace config may require specific versions
- **Probability**: Low
- **Mitigation**:
  - Lock pnpm version in `package.json` engines field
  - Use exact version from Suna lockfile
  - Document required Node.js + pnpm versions
- **Owner**: DevOps
- **Detection**: Week 1 during P1-T03

### Risk 4: Google OAuth Approval Delay
- **Risk**: OAuth consent screen verification may take time
- **Probability**: Low
- **Mitigation**:
  - Use "testing" mode initially (100 users)
  - Submit for verification early
  - Internal OAuth client sufficient for Phase 1
- **Owner**: Project lead
- **Detection**: Week 3 during P1-T17

### Risk 5: Supabase Region Availability
- **Risk**: Singapore region may have service limitations
- **Probability**: Low
- **Mitigation**:
  - Verify all required features available in `ap-southeast-1`
  - Fallback to Hong Kong if needed (still APEC)
- **Owner**: Infrastructure
- **Detection**: Week 2 during P1-T07

---

## Verification Checklist

### Phase 1 Completion Criteria

#### Repository & CI/CD
- [ ] Repository exists at `github.com/kidpen/kidpen.space`
- [ ] `pnpm install` succeeds without errors
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] GitHub Actions CI runs on push
- [ ] README.md has kidpen.space branding

#### Infrastructure
- [ ] Supabase project in Singapore region (`ap-southeast-1`)
- [ ] Vercel deployment accessible at staging URL
- [ ] Environment variables configured in Vercel
- [ ] Deployment pipeline: push → build → deploy works

#### Database
- [ ] `users` table exists with all required columns
- [ ] `parental_consents` table exists with FK to users
- [ ] Indexes created: `idx_users_google_id`, `idx_consents_user_id`
- [ ] RLS policies enabled and tested
- [ ] Migration scripts in `backend/supabase/migrations/`

#### Authentication
- [ ] Google OAuth login works
- [ ] Thai locale (`hl=th`) displayed in OAuth flow
- [ ] Birth year collection functional
- [ ] Grade level selection (ม.1-ม.6) functional
- [ ] Session persists across page refreshes
- [ ] Logout works correctly

#### Frontend
- [ ] kidpen.space logo and favicon displayed
- [ ] Sarabun font loaded and applied
- [ ] Thai navigation labels visible
- [ ] Responsive layout works 320px-1920px
- [ ] Subject selection UI renders
- [ ] i18n framework configured
- [ ] Thai locale files exist: `common.json`, `auth.json`, `consent.json`

#### Documentation
- [ ] Local development setup documented
- [ ] Environment variables documented
- [ ] Phase 1 ADR created

---

## File Paths Reference

### Key Files to Modify
```
apps/web/
├── app/
│   └── auth/callback/          # P1-T22: Auth callback
├── public/
│   ├── logo.svg                # P1-T25: Rebrand
│   └── favicon.ico             # P1-T25: Rebrand
├── locales/
│   └── th/
│       ├── common.json         # P1-T28: Thai UI strings
│       ├── auth.json           # P1-T29: Auth strings
│       └── consent.json        # P1-T30: Consent strings
└── styles/
    └── globals.css             # P1-T26: Sarabun font

backend/
├── auth/                       # P1-T18-T24: Auth extension
└── supabase/
    └── migrations/
        └── 001_pdpa_tables.sql # P1-T12-T16: PDPA schema

Root:
├── package.json                # P1-T02: Rename
├── pnpm-workspace.yaml         # P1-T03: Workspace config
├── .env.example                # P1-T04: Environment template
├── README.md                   # P1-T06: Documentation
└── .github/workflows/ci.yml    # P1-T05: CI/CD
```

---

## Dependencies Summary

### External Dependencies (Pre-Phase 1)
- [x] Kortix AI fork permission (public repo, MIT license)
- [ ] Supabase account with Singapore region access
- [ ] Google Cloud Console access
- [ ] Vercel account
- [ ] Domain: kidpen.space DNS (can defer to staging URL)

### Technical Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (for local development)
- pnpm 8+

---

## Next Steps After Phase 1

1. **Phase 2 Kickoff**: Device capability detection and hybrid inference
2. **Validate**: Ensure all Phase 1 acceptance criteria met
3. **Retrospective**: Document learnings in `.planning/phases/phase-1/RETRO.md`

---

*Generated from RESEARCH.md, REQUIREMENTS.md, ROADMAP.md*
*Architecture: Hybrid Tiered (Research-Validated)*
