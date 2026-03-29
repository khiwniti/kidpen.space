# 🎯 Complete Rebranding Plan: Kidpen AI → Kidpen AI

## Executive Summary

Complete migration and rebranding of the Suna platform from "Kidpen AI" to "Kidpen AI", including all text references, design system updates, asset replacements, configuration changes, and documentation updates.

---

## 📊 Analysis Summary

### Current Branding Elements Found

| Category | Count | Priority |
|----------|-------|----------|
| **Text References ("Kidpen")** | 500+ instances | 🔴 Critical |
| **Logo/Brand Assets** | 30+ files | 🔴 Critical |
| **Package.json Names** | 4 files | 🔴 Critical |
| **Configuration Files** | 15+ files | 🔴 Critical |
| **Translation Files** | 8 languages | 🟡 High |
| **Infrastructure/URLs** | 10+ files | 🟡 High |
| **SDK/API References** | 10+ files | 🟡 High |
| **Documentation** | 15+ files | 🟢 Medium |

### Key Domains to Replace

```
kidpen.space → kidpen.ai (or kidpen.com)
api.kidpen.space → api.kidpen.ai
staging.kidpen.space → staging.kidpen.ai
github.com/kidpen-ai/suna → TBD
x.com/kidpen → TBD
hey@kidpen.space → TBD
```

---

## 🏗️ Phase Structure

### Phase 1: Core Configuration & Package Names
**Goal**: Update all fundamental package identifiers and build configurations

### Phase 2: Frontend Branding & Metadata
**Goal**: Update all user-facing text, SEO metadata, and site configuration

### Phase 3: Design System & CSS Classes
**Goal**: Rename CSS classes and design tokens from kidpen-* to kidpen-*

### Phase 4: Brand Assets Replacement
**Goal**: Replace all logo files, favicons, and visual assets

### Phase 5: Mobile & Desktop Apps
**Goal**: Update app.json, bundle identifiers, and app configurations

### Phase 6: Backend & SDK
**Goal**: Update Python packages, API configurations, and SDK branding

### Phase 7: Infrastructure & Deployment
**Goal**: Update Pulumi configs, Docker, and deployment scripts

### Phase 8: Translations & Documentation
**Goal**: Update all 8 language files and documentation

### Phase 9: Verification & Cleanup
**Goal**: Comprehensive verification and removal of any remaining references

---

## 📋 Detailed Task Breakdown

### Phase 1: Core Configuration & Package Names

#### Task 1.1: Root Package.json
**File**: `/package.json`
- Change filter name `Kidpen` → `Kidpen`
- Update any script references

#### Task 1.2: Frontend Package.json
**File**: `/apps/frontend/package.json`
- Change `"name": "Kidpen"` → `"name": "Kidpen"`

#### Task 1.3: Mobile Package.json
**File**: `/apps/mobile/package.json`
- Change `"name": "kidpen"` → `"name": "kidpen"`
- Update emulator name

#### Task 1.4: Desktop Package.json
**File**: `/apps/desktop/package.json`
- Change `"name": "kidpen-desktop"` → `"name": "kidpen-desktop"`
- Update `"productName"`, `"author"`, `"appId"`, `"email"`

#### Task 1.5: Backend pyproject.toml
**File**: `/backend/pyproject.toml`
- Change `name = "kidpen"` → `name = "kidpen"`
- Update homepage and repository URLs

#### Task 1.6: SDK pyproject.toml
**File**: `/sdk/pyproject.toml`
- Change `name = "kidpen"` → `name = "kidpen"`
- Update description

---

### Phase 2: Frontend Branding & Metadata

#### Task 2.1: Site Metadata
**File**: `/apps/frontend/src/lib/site-metadata.ts`
```typescript
// Replace:
name: 'Kidpen' → 'Kidpen'
title: 'Kidpen: Your Autonomous AI Worker' → 'Kidpen: Your Autonomous AI Worker'
keywords: 'Kidpen, ...' → 'Kidpen, ...'
url: 'kidpen.space' → 'kidpen.ai'
```

#### Task 2.2: Site Config
**File**: `/apps/frontend/src/lib/site-config.ts`
- Update hero description
- Update footer links
- Update all email addresses and URLs

#### Task 2.3: Layout.tsx SEO
**File**: `/apps/frontend/src/app/layout.tsx`
- Update all meta tags
- Update Schema.org JSON-LD
- Update Twitter handles
- Update canonical URLs
- Update iOS Smart App Banner

#### Task 2.4: Manifest.json
**File**: `/apps/frontend/public/manifest.json`
- Update `name`, `short_name`
- Update any app store links

#### Task 2.5: Robots.txt
**File**: `/apps/frontend/public/robots.txt`
- Update sitemap URL

---

### Phase 3: Design System & CSS Classes

#### Task 3.1: Global CSS Classes
**File**: `/apps/frontend/src/app/globals.css`
- Rename `.kidpen-markdown` → `.kidpen-markdown`
- Update any comments referencing Kidpen

#### Task 3.2: Spreadsheet Styles
**File**: `/apps/frontend/src/components/thread/tool-views/spreadsheet/kidpen-spreadsheet-styles.css`
- Rename file to `kidpen-spreadsheet-styles.css`
- Update all class prefixes

#### Task 3.3: Logo Component
**File**: `/apps/frontend/src/components/sidebar/kidpen-logo.tsx`
- Rename file to `kidpen-logo.tsx`
- Update component name `KidpenLogo` → `KidpenLogo`
- Update all internal references

#### Task 3.4: Update All Logo Component Imports
- Search for all imports of `kidpen-logo`
- Update to `kidpen-logo`

---

### Phase 4: Brand Assets Replacement

#### Task 4.1: Frontend Public Assets (Rename)
```
kidpen-symbol.svg → kidpen-symbol.svg
kidpen-logomark-white.svg → kidpen-logomark-white.svg
kidpen-brandmark-bg.svg → kidpen-brandmark-bg.svg
kidpen-brandmark-effect.svg → kidpen-brandmark-effect.svg
kidpen-brandmark-effect-full.svg → kidpen-brandmark-effect-full.svg
kidpen-computer-black.svg → kidpen-computer-black.svg
kidpen-computer-white.svg → kidpen-computer-white.svg
```

#### Task 4.2: Update All Asset References
- Search for all references to `kidpen-*.svg`
- Update to `kidpen-*.svg`

#### Task 4.3: Mobile Assets (Rename)
```
assets/brand/kidpen-*.svg → assets/brand/kidpen-*.svg
```

#### Task 4.4: Update Asset Import Paths
- Update all `import` and `src` attributes

**Note**: New logo/brand artwork must be provided by user. The rename tasks prepare for asset replacement.

---

### Phase 5: Mobile & Desktop Apps

#### Task 5.1: Mobile app.json
**File**: `/apps/mobile/app.json`
- Update `name`: "Kidpen" → "Kidpen"
- Update `slug`: "kidpen" → "kidpen"
- Update `scheme`: "kidpen" → "kidpen"
- Update `bundleIdentifier`: "com.kidpen.app" → "com.kidpen.app"
- Update `associatedDomains`
- Update all permission descriptions mentioning "Kidpen"
- Update `owner`

#### Task 5.2: Mobile eas.json
**File**: `/apps/mobile/eas.json`
- Update all URLs (staging-api.kidpen.space, etc.)

#### Task 5.3: Mobile Locales
**Files**: `/apps/mobile/locales/*.json`
- Update all "Kidpen" text references

#### Task 5.4: iOS Native Files
**Directory**: `/apps/mobile/ios/Kidpen/`
- Rename directory to `Kidpen`
- Update xcodeproj references
- Update entitlements file name

#### Task 5.5: Android Package
**Directory**: `/apps/mobile/android/app/src/main/java/com/kidpen/`
- Rename to `com/kidpen/`
- Update package declarations

#### Task 5.6: Desktop Package
**File**: `/apps/desktop/package.json`
- Already covered in Phase 1

---

### Phase 6: Backend & SDK

#### Task 6.1: Backend Config
**File**: `/backend/core/config/suna_config.py`
- Update `name`, `description`, `model` references

#### Task 6.2: SDK Module Rename
**Directory**: `/sdk/kidpen/`
- Rename to `/sdk/kidpen/`
- Update all Python imports
- Update class names: `Kidpen` → `Kidpen`, `KidpenAgent` → `KidpenAgent`, etc.

#### Task 6.3: SDK __init__.py
**File**: `/sdk/__init__.py`
- Update documentation strings
- Update exports

#### Task 6.4: Backend Suna Service
**File**: `/backend/core/utils/suna_default_agent_service.py`
- Check for Kidpen references (if any)

#### Task 6.5: Docker Compose
**File**: `/backend/docker-compose.yml`
- Update image references

---

### Phase 7: Infrastructure & Deployment

#### Task 7.1: Pulumi Configs (Dev/Staging/Prod)
**Files**:
- `/infra/environments/dev/Pulumi.yaml`
- `/infra/environments/staging/Pulumi.yaml`
- `/infra/environments/prod/Pulumi.yaml`
- Update project names
- Update descriptions

#### Task 7.2: Infrastructure Index Files
**Files**: `/infra/environments/*/index.ts`
- Update API endpoint references

#### Task 7.3: Root Docker Compose
**File**: `/docker-compose.yaml`
- Update comments and any references

#### Task 7.4: Setup Scripts
**Files**:
- `/setup.py`, `/start.py`
- `/setup/**/*.py`
- Update banner text, descriptions, class names

#### Task 7.5: GitHub Scripts
**File**: `/scripts/setup-github-secrets.sh`
- Update REPO variable

---

### Phase 8: Translations & Documentation

#### Task 8.1: English Translations
**File**: `/apps/frontend/translations/en.json`
- Replace all "Kidpen" → "Kidpen" (50+ instances)

#### Task 8.2: Other Language Translations
**Files**:
- `/apps/frontend/translations/de.json` (German)
- `/apps/frontend/translations/es.json` (Spanish)
- `/apps/frontend/translations/fr.json` (French)
- `/apps/frontend/translations/it.json` (Italian)
- `/apps/frontend/translations/ja.json` (Japanese)
- `/apps/frontend/translations/pt.json` (Portuguese)
- `/apps/frontend/translations/zh.json` (Chinese)

#### Task 8.3: README Files
**Files**:
- `/README.md`
- `/apps/frontend/README.md`
- `/apps/mobile/README.md`
- `/apps/desktop/README.md`
- `/backend/README.md`
- `/sdk/README.md`
- `/infra/README.md`

#### Task 8.4: LICENSE
**File**: `/LICENSE`
- Update company name and URLs

#### Task 8.5: .claude Documentation
**Files**: `/.claude/*.md`
- Check for any Kidpen references

---

### Phase 9: Verification & Cleanup

#### Task 9.1: Global Search Verification
```bash
grep -ri "kidpen" --include="*.{ts,tsx,js,jsx,json,py,md,yaml,yml,toml,css,html,svg}"
```

#### Task 9.2: Build Verification
- Run `pnpm build:frontend`
- Verify no build errors

#### Task 9.3: Lint Check
- Run linters to ensure no broken imports

#### Task 9.4: Asset Reference Check
- Verify all renamed assets are properly referenced

#### Task 9.5: Final Documentation
- Create migration summary document

---

## 🎨 Theme/Design System Changes

### Color Palette (No Changes Required)
The current color system uses neutral OKLCH values that are brand-agnostic. No color changes needed unless you want a new theme.

### CSS Variables (Current)
```css
:root {
  --background: oklch(0.9741 0 129.63);
  --foreground: oklch(0.2277 0.0034 67.65);
  --primary: oklch(0.205 0 0);
  --secondary: oklch(54.65% 0.246 262.87);
  /* ... etc */
}
```

### Class Renames Required
- `.kidpen-markdown` → `.kidpen-markdown`
- Any other `.kidpen-*` classes found

---

## 📁 Files Summary

### Critical Files (Must Update)
1. `/package.json`
2. `/apps/frontend/package.json`
3. `/apps/frontend/src/lib/site-metadata.ts`
4. `/apps/frontend/src/lib/site-config.ts`
5. `/apps/frontend/src/app/layout.tsx`
6. `/apps/mobile/app.json`
7. `/apps/desktop/package.json`
8. `/backend/pyproject.toml`
9. `/sdk/pyproject.toml`

### High Impact Files
1. All translation files (8 languages)
2. All logo/asset files (30+ files)
3. All README files (7+ files)
4. Infrastructure configs (6+ files)

### Directories to Rename
1. `/sdk/kidpen/` → `/sdk/kidpen/`
2. `/apps/mobile/ios/Kidpen/` → `/apps/mobile/ios/Kidpen/`
3. `/apps/mobile/android/.../com/kidpen/` → `/apps/mobile/android/.../com/kidpen/`

---

## ⚠️ Questions for User

Before execution, please confirm:

1. **New Domain**: What is the new domain?
   - `kidpen.ai` or `kidpen.com`?

2. **Email Addresses**: What are the new contact emails?
   - Support email?
   - Contact email?

3. **Social Media**: What are the new social handles?
   - Twitter/X handle?
   - LinkedIn company page?
   - Discord (keep existing or new)?

4. **GitHub Repository**: Will the repository be renamed/moved?
   - New URL if changing?

5. **Logo Assets**: Will you provide new logo files?
   - Or should I just rename existing files?

6. **App Store**: New app store links/identifiers?
   - iOS App ID?
   - Android package?

---

## 🚀 Execution Strategy

### Recommended Approach: Systematic Phase Execution

1. **Checkpoint**: Create git branch `feature/rebranding-kidpen-to-kidpen`
2. **Execute**: Phase by phase with validation
3. **Commit**: After each phase completion
4. **Verify**: Build and lint after critical phases
5. **Test**: Manual verification of key user flows

### Estimated Timeline
- Phase 1-3: ~2 hours (Core configs and frontend)
- Phase 4-5: ~1 hour (Assets and mobile/desktop)
- Phase 6-7: ~1 hour (Backend and infrastructure)
- Phase 8: ~1 hour (Translations and docs)
- Phase 9: ~30 minutes (Verification)

**Total Estimated Time**: 5-6 hours

---

## 🔧 Tools Required

- **Serena MCP**: For semantic symbol operations
- **Sequential Thinking**: For complex dependency analysis
- **Context7**: For framework documentation
- **Morphllm**: For bulk text replacements
- **Playwright**: For E2E verification (optional)

---

## Success Criteria

✅ Zero instances of "kidpen" (case-insensitive) in codebase
✅ All builds pass successfully
✅ All linting passes
✅ All asset files properly renamed/replaced
✅ All import paths updated
✅ Documentation reflects new branding
✅ Mobile/Desktop app configurations updated
