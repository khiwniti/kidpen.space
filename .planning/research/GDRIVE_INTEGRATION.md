# Google Drive API Integration Research

## Executive Summary

Google Drive API is **viable** for kidpen.space at 4.4M user scale with proper architecture. Key findings:
- **No per-API-call costs** - included with Google Cloud project
- **Rate limits manageable** with offline-first + batch operations
- **PDPA compliance** achieved by storing data in student's own Drive
- **Google Workspace for Education** offers superior quotas if school partnership secured

---

## 1. Google Drive API Rate Limits & Quotas

### Standard Quotas (Consumer Google Accounts)

| Quota Type | Limit | Notes |
|------------|-------|-------|
| **Queries per day** | 1,000,000,000 | Per project, effectively unlimited |
| **Queries per 100 seconds per user** | 1,000 | Key constraint for real-time sync |
| **Queries per 100 seconds per project** | 20,000 | Shared across all users |
| **Upload bandwidth** | 750 GB/day per user | Not a concern for JSON data |
| **Download bandwidth** | 10 TB/day per project | Adequate for learning data |

### Workspace for Education Quotas

| Quota Type | Limit | Notes |
|------------|-------|-------|
| **Queries per 100 seconds per user** | 1,500 | 50% higher than consumer |
| **Queries per 100 seconds per project** | 30,000 | Better for scale |
| **Storage per user** | Pooled (100TB base + 20GB/license) | School-managed |

### Scaling Analysis for 4.4M Users

**Worst-case scenario** (all users syncing simultaneously):
- 4.4M users × 1 sync request = 4.4M requests
- At 20,000 req/100sec project limit = 22,000 seconds = 6.1 hours to process

**Realistic scenario** (distributed usage patterns):
- Peak hour: ~10% active = 440K users
- Typical sync: 2-3 API calls (read, write, metadata)
- 440K × 3 = 1.32M calls/hour = 366 calls/second
- Well within 20,000/100sec (200/sec) project limit

**Recommendation**: Offline-first with periodic sync (every 15-30 min) eliminates rate limit concerns entirely.

---

## 2. Cost Analysis

### Google Drive API Pricing

| Component | Cost |
|-----------|------|
| **API calls** | **FREE** - included with Google Cloud project |
| **Storage** | User's own quota (15GB free, or school-provided) |
| **Bandwidth** | No charge for API operations |
| **Cloud project** | Free tier sufficient for API-only usage |

### kidpen.space Storage Requirements

| Data Type | Estimated Size | Frequency |
|-----------|---------------|-----------|
| Student profile | 1-2 KB | Rarely updated |
| Mastery state (pyBKT) | 10-50 KB | Per session |
| Learning history | 100-500 KB | Grows over time |
| AI conversation cache | 1-5 MB | Compressed, rotated |
| **Total per student** | **~5-10 MB/year** | Well within 15GB free |

### Cost Comparison

| Approach | Monthly Cost (4.4M users) |
|----------|--------------------------|
| Supabase/Firebase storage | $10,000-50,000+ |
| AWS S3 + DynamoDB | $5,000-20,000+ |
| **Google Drive (user storage)** | **$0** |

---

## 3. Offline-First Sync Architecture

### Recommended Pattern: CRDT + Periodic Sync

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
├─────────────────────────────────────────────────────────┤
│  IndexedDB (Primary)  ←→  Sync Engine  ←→  Google Drive │
│  - Instant read/write     - Conflict     - Backup       │
│  - Offline capable        - Batching     - Cross-device │
│  - 50MB+ capacity         - Debouncing   - Data ownership│
└─────────────────────────────────────────────────────────┘
```

### Sync Strategy

```typescript
interface SyncStrategy {
  // Local-first: all operations hit IndexedDB immediately
  localFirst: true;

  // Batch changes before Drive sync
  batchInterval: 30_000; // 30 seconds

  // Sync triggers
  triggers: [
    'session_end',      // User closes app
    'mastery_update',   // After quiz completion
    'periodic',         // Every 15 minutes if active
    'network_restore'   // Coming back online
  ];

  // Conflict resolution
  conflictStrategy: 'last-write-wins' | 'merge-crdt';
}
```

### Data Flow

1. **Write Path**:
   - User action → IndexedDB (sync) → Queue change → Batch → Drive API

2. **Read Path**:
   - IndexedDB first → If stale, fetch Drive → Merge → Update IndexedDB

3. **Conflict Resolution**:
   - Use vector clocks or timestamps
   - Mastery data: merge (take highest mastery level)
   - History: append-only, no conflicts
   - Profile: last-write-wins

### Libraries Recommended

| Library | Purpose | Size |
|---------|---------|------|
| **Dexie.js** | IndexedDB wrapper | 25KB |
| **Y.js** or **Automerge** | CRDT for conflict-free sync | 50-80KB |
| **@googleapis/drive** | Drive API client | 30KB |
| **Workbox** | Service worker/offline | 20KB |

---

## 4. Data Schema for Learning Analytics

### Primary Storage Structure (in Google Drive)

```
kidpen-space/
├── profile.json          # Student identity & preferences
├── mastery/
│   ├── math.json         # pyBKT state per subject
│   ├── physics.json
│   ├── chemistry.json
│   └── biology.json
├── history/
│   ├── 2025-03.jsonl     # Monthly learning logs (append-only)
│   └── 2025-04.jsonl
├── cache/
│   └── ai-responses.json # Compressed AI cache (rotating)
└── sync-meta.json        # Last sync timestamps, version
```

### pyBKT Mastery Schema

```json
{
  "subject": "math",
  "grade": "ม.3",
  "lastUpdated": "2025-03-30T10:00:00Z",
  "version": 12,
  "skills": {
    "algebra-linear-equations": {
      "p_know": 0.72,
      "p_learn": 0.15,
      "p_guess": 0.20,
      "p_slip": 0.10,
      "attempts": 45,
      "lastAttempt": "2025-03-30T09:45:00Z",
      "history": [0.3, 0.45, 0.52, 0.65, 0.72]
    },
    "geometry-triangles": {
      "p_know": 0.45,
      "p_learn": 0.12,
      "p_guess": 0.25,
      "p_slip": 0.08,
      "attempts": 23,
      "lastAttempt": "2025-03-29T14:20:00Z",
      "history": [0.2, 0.35, 0.45]
    }
  },
  "aggregates": {
    "overallMastery": 0.58,
    "totalAttempts": 234,
    "studyTimeMinutes": 1250,
    "streakDays": 12
  }
}
```

### Learning History Schema (JSONL - append-only)

```jsonl
{"ts":"2025-03-30T09:30:00Z","type":"session_start","device":"chromebook"}
{"ts":"2025-03-30T09:31:00Z","type":"problem","skill":"algebra-linear-equations","correct":true,"timeMs":45000}
{"ts":"2025-03-30T09:33:00Z","type":"problem","skill":"algebra-linear-equations","correct":false,"timeMs":62000}
{"ts":"2025-03-30T09:35:00Z","type":"ai_hint","skill":"algebra-linear-equations","tokens":150}
{"ts":"2025-03-30T09:45:00Z","type":"session_end","duration":900}
```

### IndexedDB Schema (Local)

```typescript
interface LocalDB {
  // Mirrors Drive structure for offline access
  profile: StudentProfile;
  mastery: Record<Subject, MasteryState>;

  // Local-only, synced as batches
  pendingHistory: HistoryEvent[];

  // Sync metadata
  syncState: {
    lastSync: Date;
    pendingChanges: number;
    conflictQueue: Conflict[];
  };

  // AI cache (local only, optional Drive backup)
  aiCache: Map<string, CachedResponse>;
}
```

---

## 5. Authentication for Thai Minors

### Thailand PDPA Requirements

| Age Group | Requirement |
|-----------|-------------|
| **Under 10** | Full parental consent required |
| **10-17** | Parental consent OR child consent with parent notification |
| **18+** | Self-consent |

### Google OAuth for Minors

**Challenge**: Google doesn't provide age-gated OAuth. All accounts appear as regular users.

**Solutions**:

#### Option A: App-Level Age Gate (Recommended)
```typescript
// During onboarding
const ageVerification = {
  step1: "Ask birthdate in app",
  step2: "If under 18, require parent email",
  step3: "Send consent link to parent",
  step4: "Parent clicks link, verifies via their Google account",
  step5: "Store consent record, allow full access"
};
```

#### Option B: School-Managed Accounts
- Partner with schools using Google Workspace for Education
- School admin pre-approves student access
- No individual consent flow needed (school acts as guardian)

#### Option C: Family Link Integration
- Detect Family Link supervised accounts
- Auto-route consent to parent's linked account
- More complex, requires Google API integration

### Recommended Consent Flow

```
┌──────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                        │
├──────────────────────────────────────────────────────────┤
│  1. Student signs in with Google                         │
│  2. App asks: "วันเกิดของคุณ?" (birthdate)                │
│  3. If age < 18:                                         │
│     a. Show: "กรุณาให้ผู้ปกครองยืนยัน"                      │
│     b. Collect parent email                              │
│     c. Send consent link (valid 7 days)                  │
│     d. Limited access until consent received             │
│  4. Parent clicks link → Google OAuth → confirms         │
│  5. Store consent: {parent_id, student_id, timestamp}    │
│  6. Full access granted                                  │
└──────────────────────────────────────────────────────────┘
```

### Consent Data Storage

```json
{
  "studentId": "google_oauth_id",
  "birthYear": 2010,
  "consentStatus": "verified",
  "parentConsent": {
    "parentId": "parent_google_oauth_id",
    "consentDate": "2025-03-30T10:00:00Z",
    "method": "google_oauth_link",
    "ipAddress": "hashed",
    "expiresAt": null
  },
  "dataProcessingAgreement": true,
  "createdAt": "2025-03-30T09:00:00Z"
}
```

---

## 6. Google Workspace for Education Considerations

### Benefits for kidpen.space

| Feature | Benefit |
|---------|---------|
| **Higher API quotas** | 50% more requests/user |
| **Managed accounts** | School handles consent |
| **Guaranteed storage** | Pooled storage from school |
| **Domain restrictions** | Can limit to .ac.th domains |
| **Admin controls** | Teachers can view student data |

### Partnership Requirements

1. **MOE/OBEC Partnership**: Formal agreement with Ministry of Education
2. **Data Processing Agreement**: School-level DPA with kidpen.space
3. **Technical Integration**:
   - Domain allowlisting
   - Service account for admin operations
   - Classroom API integration (optional)

### API Differences

```typescript
// Consumer account
const driveScopes = [
  'https://www.googleapis.com/auth/drive.file', // App-created files only
  'https://www.googleapis.com/auth/drive.appdata' // Hidden app folder
];

// Workspace for Education (with admin consent)
const eduScopes = [
  ...driveScopes,
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly'
];
```

### Recommendation

**Phase 1-2**: Use consumer Google accounts with app-level consent
**Phase 3+**: Partner with pilot schools for Workspace integration
**Long-term**: Seek OBEC partnership for national deployment

---

## 7. API Architecture Recommendations

### Client-Side Implementation

```typescript
// drive-sync.ts
class DriveSync {
  private db: Dexie; // IndexedDB
  private drive: GoogleDriveAPI;
  private syncQueue: SyncQueue;

  async initialize(accessToken: string) {
    this.drive = new GoogleDriveAPI(accessToken);
    await this.ensureAppFolder();
    await this.pullLatest();
  }

  async saveMastery(subject: string, data: MasteryState) {
    // 1. Save to IndexedDB immediately
    await this.db.mastery.put({ subject, ...data });

    // 2. Queue for Drive sync
    this.syncQueue.enqueue({
      type: 'mastery',
      subject,
      data,
      timestamp: Date.now()
    });
  }

  async syncToDrive() {
    const pending = await this.syncQueue.drain();
    if (pending.length === 0) return;

    // Batch updates into single API call per file
    const batched = this.batchByFile(pending);

    for (const [fileId, changes] of batched) {
      await this.drive.files.update({
        fileId,
        media: { body: JSON.stringify(changes) }
      });
    }
  }
}
```

### Token Refresh Strategy

```typescript
// auth.ts
class AuthManager {
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: number;

  async getValidToken(): Promise<string> {
    if (Date.now() < this.expiresAt - 60000) {
      return this.accessToken;
    }

    // Refresh 1 minute before expiry
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    const { access_token, expires_in } = await response.json();
    this.accessToken = access_token;
    this.expiresAt = Date.now() + (expires_in * 1000);

    return this.accessToken;
  }
}
```

### Error Handling & Retry

```typescript
// retry.ts
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; backoff: 'exponential' }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (error.code === 429) { // Rate limited
        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
        continue;
      }

      if (error.code === 401) { // Token expired
        await authManager.refresh();
        continue;
      }

      throw error; // Unrecoverable
    }
  }

  throw lastError;
}
```

---

## 8. Scaling Strategies

### Strategy 1: Shard by User Cohort

```
Project A: Users 0-1M (ม.1-ม.2)
Project B: Users 1M-2.5M (ม.3-ม.4)
Project C: Users 2.5M-4.4M (ม.5-ม.6)
```

Each Google Cloud project gets its own 20,000 req/100sec quota.

### Strategy 2: Time-Based Sync Windows

```typescript
// Distribute sync times based on user ID hash
const syncWindow = getUserId().hashCode() % 60; // 0-59 minutes
const nextSync = getNextHour() + syncWindow * 60 * 1000;
```

### Strategy 3: Priority Queue

```typescript
enum SyncPriority {
  CRITICAL = 0,  // Session end, mastery update
  HIGH = 1,      // Every 5 minutes during active use
  NORMAL = 2,    // Every 15 minutes
  LOW = 3        // Background sync, cache updates
}
```

### Strategy 4: Delta Sync

Only sync changed fields, not entire files:

```typescript
// Instead of uploading full mastery.json
const delta = {
  path: "skills.algebra-linear-equations.p_know",
  value: 0.75,
  timestamp: Date.now()
};
```

---

## 9. Security Considerations

### OAuth Scopes (Principle of Least Privilege)

```typescript
// RECOMMENDED: Minimal scopes
const scopes = [
  'https://www.googleapis.com/auth/drive.appdata' // Hidden app folder
];

// This means:
// - kidpen.space can ONLY access its own app data folder
// - Cannot see user's other Drive files
// - Cannot share or modify permissions
// - Data is invisible to user in Drive UI (privacy benefit)
```

### Data Encryption

```typescript
// Encrypt sensitive data before storing
import { encrypt, decrypt } from './crypto';

async function saveMastery(data: MasteryState) {
  const encrypted = await encrypt(JSON.stringify(data), userKey);
  await drive.files.update({
    fileId: masteryFileId,
    media: { body: encrypted }
  });
}
```

### Audit Logging

```typescript
// Log all Drive operations for PDPA compliance
interface AuditLog {
  timestamp: Date;
  userId: string;
  operation: 'read' | 'write' | 'delete';
  dataType: 'mastery' | 'history' | 'profile';
  success: boolean;
  errorCode?: string;
}
```

---

## 10. Implementation Roadmap

### Phase 1: Basic Integration (Week 1-2)
- [ ] Set up Google Cloud project
- [ ] Implement OAuth flow with minimal scopes
- [ ] Create app data folder structure
- [ ] Basic read/write operations

### Phase 2: Offline-First (Week 3-4)
- [ ] Implement IndexedDB layer with Dexie.js
- [ ] Build sync queue system
- [ ] Add conflict resolution (last-write-wins)
- [ ] Service worker for offline access

### Phase 3: Consent Flow (Week 5-6)
- [ ] Age verification UI
- [ ] Parent consent email flow
- [ ] Consent storage and verification
- [ ] PDPA audit logging

### Phase 4: Optimization (Week 7-8)
- [ ] Delta sync implementation
- [ ] Batch operations
- [ ] Error handling and retry
- [ ] Performance monitoring

### Phase 5: Education Integration (Future)
- [ ] Pilot school partnership
- [ ] Workspace for Education setup
- [ ] Classroom API integration
- [ ] Teacher dashboard data access

---

## References & Sources

- [Google Drive API Usage Limits](https://developers.google.com/drive/api/guides/limits)
- [Google Cloud API Quotas](https://cloud.google.com/apis/docs/quota)
- [Google Workspace Storage](https://support.google.com/a/answer/7576736)
- [Thailand PDPA Overview](https://www.pdpa.go.th/)
- [Dexie.js Documentation](https://dexie.org/)
- [Y.js CRDT Library](https://yjs.dev/)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-03-30 | Use `drive.appdata` scope | Minimal access, hidden from user, privacy-preserving |
| 2025-03-30 | Offline-first with IndexedDB | Eliminates rate limit concerns, better UX |
| 2025-03-30 | App-level age verification | Google OAuth doesn't provide age, PDPA requires it |
| 2025-03-30 | JSONL for history logs | Append-only, no conflicts, easy to sync |
| 2025-03-30 | Defer Workspace integration | Requires school partnerships, Phase 3+ |
