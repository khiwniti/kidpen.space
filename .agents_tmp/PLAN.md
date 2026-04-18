# 1. OBJECTIVE

**Verify and correct the alignment between planning documents and actual codebase implementation.** The goal is to identify discrepancies where planning documents (STATE.md, Phase Summaries) claim implementations are complete, but actual code files are missing or incomplete.

# 2. CONTEXT SUMMARY

## Project: kidpen.space
- **Type**: Thai STEM tutoring platform transformation (Suna fork → EdTech)
- **Target**: 4.4M Thai secondary students (ม.1-ม.6)
- **Architecture**: Hybrid tiered inference (Cloud/Hybrid/Edge)

## Critical Discrepancy Found:
**Planning Documents Claim ALL 4 phases are "✅ Complete" but the codebase is MISSING critical implementation files.**

### Planning Claims vs Reality:

| Phase | STATE.md Status | Actual Implementation |
|-------|----------------|----------------------|
| Phase 1 | ✅ Complete | PARTIALLY complete (branding, Thai strings) |
| Phase 2 | ✅ Complete | MINIMALLY complete (hooks exist, core logic missing) |
| Phase 3 | ✅ Complete | PARTIALLY complete (Thai translations, basic ring) |
| Phase 4 | ✅ Complete | NOT STARTED (no consent, no PDPA) |

## Missing Critical Files:

### Phase 2.01 - Device Detection (MISSING):
- ❌ `packages/shared/src/types/device.ts`
- ❌ `packages/shared/src/utils/device-detection.ts`
- ❌ `packages/shared/src/utils/tier-assignment.ts`
- ❌ `packages/shared/src/utils/tier-storage.ts`

### Phase 2.02 - Hybrid Inference (MISSING):
- ❌ WebLLM integration
- ❌ Inference tier routing
- ❌ `apps/frontend/src/hooks/useDeviceTier.ts`

### Phase 2.03 - Socratic Tutoring (MISSING):
- ❌ Socratic prompt system
- ❌ Thai tutoring prompts

### Phase 2.04 - Mastery Tracking (PARTIAL):
- ⚠️ `apps/frontend/src/hooks/use-student-data.ts` - exists but incomplete
- ❌ pyBKT WASM implementation
- ❌ `packages/shared/src/storage/` module

### Phase 2.05 - Google Drive Sync (MISSING):
- ❌ `apps/frontend/src/lib/drive/` folder
- ❌ `apps/frontend/src/hooks/useSyncStatus.ts`

### Phase 3 - Thai UI Transform (INCOMPLETE):
- ❌ No PWA service worker
- ❌ No offline-first infrastructure

### Phase 4 - PDPA & Launch (NOT STARTED):
- ❌ No consent flow
- ❌ No parent portal
- ❌ No data export/deletion

# 3. APPROACH OVERVIEW

**Three-phase remediation approach:**

1. **Phase A: Correct Planning Documents** - Update STATE.md to reflect accurate implementation status
2. **Phase B: Implement Missing Core Components** - Prioritize Phase 2.01 (device detection) as it's foundation for other work
3. **Phase C: Validate & Complete Remaining Work** - Systematically complete remaining phases

**Rationale:** Device detection is the critical path blocker for hybrid inference, which is needed for the core tutoring experience. Without accurate planning docs, future work will be misaligned.

# 4. IMPLEMENTATION STEPS

## Step 1: Correct STATE.md Implementation Status
**Goal:** Reflect accurate project state in planning documents

**Method:** Update STATE.md phase status to match actual codebase

**Files:**
- `.planning/STATE.md` - Update "Phase Status" table

**Changes:**
```
Phase 1 → Change from ✅ Complete to 🔄 Partial (branding only)
Phase 2 → Change from ✅ Complete to 🔄 Partial (hooks only)
Phase 2.01-05 → Change from ✅ Complete to ❌ Not Implemented
Phase 3 → Change from ✅ Complete to 🔄 Partial (translations only)
Phase 4 → Change from ✅ Complete to ❌ Not Started
```

## Step 2: Implement Phase 2.01 - Device Detection
**Goal:** Create device capability detection system

**Method:** Create shared utility for detecting device capabilities and assigning inference tiers

**Files to create:**
1. `packages/shared/src/types/device.ts`
   - DeviceCapabilities, InferenceTier, TierAssignment types
   
2. `packages/shared/src/utils/device-detection.ts`
   - detectMemory(), detectWebGPU(), detectStorage(), detectFeatureSupport()
   - detectDeviceCapabilities() async function
   
3. `packages/shared/src/utils/tier-assignment.ts`
   - selectInferenceTier() function
   - INFERENCE_CONFIGS constant with cloud/hybrid/edge configs
   
4. `packages/shared/src/utils/tier-storage.ts`
   - persistTierDecision(), getPersistedTierDecision()
   - diagnostics() for debugging

**Update exports:**
- `packages/shared/src/types/index.ts` - add device types
- `packages/shared/src/utils/index.ts` - add device utilities

## Step 3: Create Frontend Device Tier Hook
**Goal:** Provide React integration for device detection

**Method:** Create useDeviceTier hook in frontend

**Files to create:**
- `apps/frontend/src/hooks/useDeviceTier.ts`
  - Detect capabilities on mount
  - Persist and validate tier decision
  - Provide tier info to components

## Step 4: Implement Phase 2.05 - Google Drive Sync
**Goal:** Complete Google Drive integration as documented

**Method:** Create Drive module with auth, sync, and scheduling

**Files to create:**
1. `apps/frontend/src/lib/drive/auth.ts`
   - Google OAuth with drive.appdata scope
   - PKCE support
   - Token refresh handling

2. `apps/frontend/src/lib/drive/api-client.ts`
   - JSON file upload/download
   - App folder management

3. `apps/frontend/src/lib/drive/sync-engine.ts`
   - Connect SyncEngine to DriveClient
   - Conflict resolution

4. `apps/frontend/src/lib/drive/sync-scheduler.ts`
   - Periodic sync (15-min default)
   - Offline/low battery constraints

5. `apps/frontend/src/hooks/useSyncStatus.ts`
   - Reactive sync status (idle/syncing/error/offline)
   - Manual trigger

## Step 5: Implement Shared Storage Module
**Goal:** Provide unified storage API for workspace

**Method:** Create shared storage types and providers

**Files to create:**
- `packages/shared/src/storage/index.ts`
  - StorageProvider interface
  - DriveClient, LocalStorageProvider exports
  - SyncEngine, Conflict exports

- `packages/shared/src/storage/types.ts`
  - StorageProvider interface
  - StorageChange, SyncResult types

## Step 6: Implement Phase 2.03 - Socratic Tutoring System
**Goal:** Create Thai Socratic tutoring prompts

**Method:** Define system prompts with Thai cultural context

**Files to create:**
- `apps/frontend/src/lib/prompts/socratic.ts`
  - Base Socratic prompt template
  - Thai-specific encouragement patterns
  - Subject-specific prompts (Math, Physics, Chemistry, Biology)

- `apps/frontend/src/lib/prompts/mastery-adapter.ts`
  - pyBKT mastery to difficulty scaling
  - Scaffold level adjustments

## Step 7: Update Phase Summaries to Reflect Reality
**Goal:** Correct all phase summary documents

**Method:** Update each SUMMARY.md to accurately reflect what was implemented vs what was claimed

**Files:**
- `.planning/phases/02-*/02-01-SUMMARY.md` through `02-05-SUMMARY.md`
- `.planning/phases/03-*/03-*-SUMMARY.md`
- `.planning/phases/04-*/04-*-SUMMARY.md`

# 5. TESTING AND VALIDATION

## Validation Criteria:

### Device Detection:
- [ ] `detectDeviceCapabilities()` returns DeviceCapabilities object
- [ ] `selectInferenceTier()` correctly assigns tiers based on memory/WebGPU
- [ ] Tier persists across page reloads
- [ ] Graceful degradation on unsupported browsers

### Google Drive Sync:
- [ ] OAuth flow completes with drive.appdata scope
- [ ] Files upload/download correctly
- [ ] Sync engine detects and resolves conflicts
- [ ] Background sync runs at configured intervals
- [ ] useSyncStatus hook reflects correct state

### Socratic Tutoring:
- [ ] System prompts follow Socratic methodology (no direct answers)
- [ ] Thai language context preserved
- [ ] Mastery-aware difficulty adjustment works

## Success Metrics:
- Planning documents accurately reflect codebase state
- Core Phase 2 components (device detection, Drive sync) implemented
- Clear path to completing remaining phases
