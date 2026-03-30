# Phase 1 Research: Fork & Foundation
## Suna Codebase Analysis for kidpen.space Migration

**Research Date**: 2026-03-30
**Source Repository**: kortix-ai/suna
**Target Phase**: Phase 1 - Fork & Foundation (Weeks 1-6)

---

## 1. Suna Repository Structure

### Root Layout (pnpm Monorepo)
```
kortix-ai/suna/
├── apps/                    # Frontend applications (TypeScript)
├── backend/                 # Python backend services
├── packages/                # Shared TypeScript packages
├── docs/                    # Documentation
├── infra/                   # Infrastructure configurations
├── docker-compose.yaml      # Container orchestration
├── pnpm-workspace.yaml      # Monorepo workspace config
└── ...
```

### Backend Structure
```
backend/
├── api.py                   # Main API entry point
├── auth/                    # Authentication module
├── core/                    # Core business logic
├── supabase/                # Supabase integration
├── tests/                   # Test suite
├── pyproject.toml           # Python dependencies (uv)
└── uv.lock                  # Lock file
```

### Key Technical Findings

| Component | Technology | kidpen.space Impact |
|-----------|-----------|---------------------|
| Package Manager | pnpm | Keep - efficient monorepo management |
| Python Backend | uv package manager | Keep - modern Python tooling |
| Database | Supabase (existing) | Migrate to Singapore region |
| Frontend | TypeScript in apps/ | Extend with Thai UI shell |
| Auth | backend/auth/ | Extend for Google OAuth + Thai localization |

---

## 2. Migration Requirements

### 2.1 Infrastructure Changes

**Supabase Migration**:
- Current: Unknown region (Suna default)
- Target: Singapore (ap-southeast-1) for PDPA compliance
- Action: Create new Supabase project, migrate schema

**Database Schema Extensions**:
```sql
-- New tables for kidpen.space (PDPA-compliant)
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

-- Indexes for performance
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_consents_user_id ON parental_consents(user_id);
```

### 2.2 Authentication Extension

**Google OAuth Configuration**:
- Scope: `openid email profile`
- Thai locale: `hl=th` parameter
- Redirect: `kidpen.space/auth/callback`

**Age Verification Flow**:
1. Google OAuth sign-in
2. Birth year collection (grade_level inference)
3. Minor detection (< 20 years under Thai PDPA)
4. Dual consent trigger if minor

### 2.3 Thai UI Shell Requirements

**Typography Stack**:
```css
/* Primary: Sarabun (Thai + Latin support) */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

:root {
  --font-thai: 'Sarabun', 'Noto Sans Thai', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

**Localization Structure**:
```
apps/
└── web/
    └── locales/
        └── th/
            ├── common.json      # UI strings
            ├── auth.json        # Auth flow strings
            └── consent.json     # PDPA consent strings
```

---

## 3. Phase 1 Deliverables Mapping

| Deliverable | Source (Suna) | Action | Priority |
|-------------|--------------|--------|----------|
| Fork repository | kortix-ai/suna | Fork to kidpen/kidpen.space | P0 |
| Rebrand assets | apps/web/public/ | Replace logos, colors | P0 |
| Supabase project | backend/supabase/ | New Singapore project | P0 |
| Google OAuth | backend/auth/ | Extend for Thai locale | P0 |
| Thai UI shell | apps/web/ | Add localization framework | P1 |
| PDPA tables | N/A (new) | Add users, parental_consents | P1 |
| Dev environment | docker-compose.yaml | Configure for local dev | P2 |

---

## 4. Technical Risks & Mitigations

### Risk 1: Suna Schema Conflicts
- **Risk**: Existing Suna tables may conflict with kidpen.space requirements
- **Mitigation**: Create kidpen-specific schema namespace, prefix tables with `kp_`

### Risk 2: Auth Module Coupling
- **Risk**: Suna auth may be tightly coupled to Suna-specific flows
- **Mitigation**: Review backend/auth/ structure, extend rather than replace

### Risk 3: pnpm Version Compatibility
- **Risk**: pnpm workspace config may require specific versions
- **Mitigation**: Lock pnpm version in package.json engines field

---

## 5. Dependencies & Prerequisites

### External Dependencies
- [ ] Kortix AI fork permission (public repo, MIT license expected)
- [ ] Supabase project creation (Singapore region)
- [ ] Google Cloud Console credentials
- [ ] Domain: kidpen.space DNS configuration

### Technical Prerequisites
- [ ] Node.js 18+ (for pnpm workspace)
- [ ] Python 3.11+ (for uv backend)
- [ ] Docker (for local development)
- [ ] pnpm 8+ (monorepo management)

---

## 6. Recommended Phase 1 Task Sequence

### Week 1-2: Fork & Infrastructure
1. Fork kortix-ai/suna → kidpen/kidpen.space
2. Create Supabase project (Singapore)
3. Set up Google Cloud OAuth credentials
4. Configure environment variables

### Week 3-4: Database & Auth
1. Add PDPA-compliant tables (users, parental_consents)
2. Extend auth module for Google OAuth
3. Implement Thai locale for auth flow
4. Add age verification gate

### Week 5-6: Thai UI Shell
1. Add Sarabun font stack
2. Set up i18n framework (next-intl or react-i18next)
3. Create Thai localization files
4. Rebrand UI assets (logo, colors, favicon)
5. Add consent UI components

---

## Sources

- GitHub API: kortix-ai/suna repository structure
- REQUIREMENTS.md: REQ-ARCH-001 through REQ-FE-002
- PDPA_COMPLIANCE.md: Consent flow requirements
- THAI_EDTECH.md: Target user demographics
- ROADMAP.md: Phase 1 deliverables specification
