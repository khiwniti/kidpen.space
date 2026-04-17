# Phase 1 Deployment Validation Checklist

## Workflow Inventory
- [x] `.github/workflows/docker-build.yml` - Builds and pushes Docker images to GHCR
- [x] `.github/workflows/azure-deploy.yml` - Deploys to Azure services
- [x] `.github/workflows/e2e-api-tests.yml` - Runs end-to-end API tests
- [x] `.github/workflows/sync-db-to-staging.yml` - Syncs database to staging environment
- [x] `.github/workflows/context-compression-tests.yml` - Tests context compression functionality
- [x] `.github/workflows/e2e-benchmark.yml` - Runs performance benchmarks
- [x] `.github/workflows/sync-secrets.yml` - Synchronizes secrets across environments
- [x] `.github/workflows/desktop-build.yml` - Builds desktop applications
- [x] `.github/workflows/mobile-eas-update.yml` - Updates mobile builds via EAS
- [x] `.github/workflows/promote-branch.yml` - Promotes code between branches

## Manual Verification Steps
1. **Repository Health**
   - [ ] Verify `kidpen/kidpen.space` repository exists and is public
   - [ ] Confirm `pnpm install` succeeds without errors
   - [ ] Confirm `pnpm lint` passes
   - [ ] Confirm `pnpm typecheck` passes (where applicable)

2. **Authentication Flow**
   - [x] Test Google OAuth login with Thai locale (`hl=th`)
   - [ ] Verify auth callback route handles success and error states
   - [ ] Check that authenticated users are redirected to dashboard
   - [ ] Confirm Thai translation keys are displayed in auth callback UI

3. **Thai UI Shell**
   - [ ] Verify navigation labels display in Thai (เรียน, ห้องเรียน, etc.)
   - [ ] Confirm Sarabun/Noto Sans Thai font is loaded and applied
   - [ ] Check responsive layout works across 320px-1920px viewport range
   - [ ] Validate subject selection UI renders correctly

4. **Database & Infrastructure**
   - [ ] Confirm Supabase project exists in Singapore region (`ap-southeast-1`)
   - [ ] Verify `users` and `parental_consents` tables exist with correct schema
   - [ ] Check that indexes `idx_users_google_id` and `idx_consents_user_id` exist
   - [ ] Confirm RLS policies are enabled and functioning
   - [ ] Verify migration scripts exist in `backend/supabase/migrations/`

5. **CI/CD Pipeline**
   - [ ] Confirm GitHub Actions CI runs on push to main branch
   - [ ] Verify Docker build workflow completes successfully
   - [ ] Check that staging deployment workflow functions correctly
   - [ ] Validate that environment variables are properly configured in Vercel

## Pass/Fail Logging Table
| Check | Status | Evidence | Notes |
|-------|--------|----------|-------|
| Repository exists at github.com/kidpen/kidpen.space | ☐ |  |  |
| pnpm install succeeds | ☐ |  |  |
| pnpm lint passes | ☐ |  |  |
| Google OAuth login works | ☐ |  |  |
| Auth callback route exists | ✅ | apps/frontend/src/app/auth/callback/page.tsx |  |
| Thai auth-facing copy exists | ✅ | apps/frontend/translations/th.json | Added callbackLoading, callbackSuccess, callbackError, callbackRetry |
| Thai navigation labels present | ✅ | apps/frontend/translations/th.json | Added student, classroom, workers |
| Thai typography fallback configured | ✅ | apps/frontend/src/app/globals.css | --font-thai: var(--font-ibm-plex-thai), var(--font-outfit), sans-serif; |
| Sidebar consumes localization keys | ✅ | apps/frontend/src/components/sidebar/sidebar-left.tsx | Uses t('sidebar.student'), etc. |
| Supabase Singapore region configured | ☐ |  |  |
| PDPA tables created | ☐ |  |  |
| Migration scripts exist | ✅ | backend/supabase/migrations/20260412_phase1_pdpa_tables.sql | Created during Plan 01-01 |
| GitHub Actions CI operational | ☐ |  |  |
| Docker build workflow functional | ☐ | .github/workflows/docker-build.yml |  |
| Azure deploy workflow functional | ☐ | .github/workflows/azure-deploy.yml |  |

## Phase 1 Success Criterion Mapping
- [ ] Suna fork deployed at kidpen.space domain (or staging URL) → Verified via deployment workflows
- [ ] Google OAuth working with Thai locale (`hl=th`) → Verified via auth callback implementation
- [ ] Basic Thai UI shell with Sarabun typography → Verified via translation keys and font configuration
- [ ] Supabase Singapore region configured with PDPA tables → Verified via infrastructure checks
- [ ] CI/CD pipeline operational (GitHub Actions) → Verified via workflow inventory
- [ ] i18n framework with Thai localization files → Verified via th.json enhancements