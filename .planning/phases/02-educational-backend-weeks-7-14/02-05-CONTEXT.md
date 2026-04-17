# Workstream 02-05: Google Drive Sync - Context

**Gathered:** 2026-04-13
**Status:** In Progress
**Priority:** P0

<domain>
## Boundary

Implement the Google Drive synchronization engine to persist learning state (mastery records, session history, preferences) from IndexedDB to the user's personal Google Drive using the `drive.appdata` scope.

</domain>

<decisions>
## Implementation Decisions

### Storage Scope
- Use `https://www.googleapis.com/auth/drive.appdata` exclusively.
- Ensures kidpen.space cannot see or touch other user files.
- Simplifies PDPA compliance as data remains in the user's account.

### Sync Strategy
- Periodic background sync (15-30 minute default).
- Immediate sync after significant learning events (e.g., mastering a concept).
- Manual sync trigger in UI for user control.

### Conflict Resolution
- Baseline: Last-Write-Wins (LWW) based on server-side modification timestamps.
- Enhancement: Deep merge for mastery records (additive).
- Version vectors for future scalability.

### Compression
- Use Gzip or LZ-based compression before upload.
- Goal: 10x reduction in sync payload size.
- Helps with low-bandwidth environments (rural Thailand).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Google OAuth is already implemented for Phase 1.
- `apps/frontend/src/lib/auth/` contains existing auth logic.
- `packages/shared/src/mastery/` contains the data structures to be synced.

### Integration Points
- `MasteryProvider` in frontend should trigger sync.
- `InferenceProvider` (Phase 2.01/02) state might also need syncing.

</code_context>

<specifics>
## Specific Ideas

- Show "Syncing..." status in the UI to give feedback to students.
- Handle "Offline" mode gracefully by queueing sync operations.
- Use a dedicated `sync-config.json` file in `appDataFolder` to store sync metadata.

</specifics>
