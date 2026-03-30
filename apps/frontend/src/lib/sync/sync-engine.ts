/**
 * Kidpen Sync Engine
 *
 * Bidirectional sync between local IndexedDB and Google Drive.
 * Handles offline changes, conflict resolution, and automatic sync.
 *
 * Sync Strategy:
 * 1. Push local changes to cloud (with conflict detection)
 * 2. Pull remote changes to local
 * 3. Merge conflicts using configurable strategy
 */

import type {
  StorageProvider,
  SyncResult,
  SyncError,
  ConflictData,
  CourseProgress,
} from '../storage/types';
import { LocalStorageProvider } from '../storage/local-storage';
import { generateSyncId } from '../crypto/encryption';

export type ConflictStrategy = 'local-wins' | 'remote-wins' | 'merge' | 'ask';

export interface SyncEngineConfig {
  conflictStrategy: ConflictStrategy;
  maxRetries: number;
  onConflict?: (conflict: ConflictData) => Promise<object>;
  onSyncStart?: () => void;
  onSyncComplete?: (result: SyncResult) => void;
  onSyncError?: (error: Error) => void;
}

export class SyncEngine {
  private localStorage: LocalStorageProvider;
  private cloudStorage: StorageProvider | null = null;
  private config: SyncEngineConfig;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(
    localStorage: LocalStorageProvider,
    config: Partial<SyncEngineConfig> = {}
  ) {
    this.localStorage = localStorage;
    this.config = {
      conflictStrategy: config.conflictStrategy || 'merge',
      maxRetries: config.maxRetries || 3,
      onConflict: config.onConflict,
      onSyncStart: config.onSyncStart,
      onSyncComplete: config.onSyncComplete,
      onSyncError: config.onSyncError,
    };
  }

  /**
   * Connect cloud storage provider
   */
  setCloudStorage(provider: StorageProvider): void {
    this.cloudStorage = provider;
  }

  /**
   * Start automatic sync at regular intervals
   */
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = setInterval(() => {
      this.sync().catch(console.error);
    }, intervalMs);

    // Initial sync
    this.sync().catch(console.error);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform a full sync
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: [],
        errors: [{ path: '', operation: 'sync', message: 'Sync already in progress', retryable: true }],
        timestamp: Date.now(),
      };
    }

    if (!this.cloudStorage) {
      return {
        success: true,
        uploaded: 0,
        downloaded: 0,
        conflicts: [],
        errors: [],
        timestamp: Date.now(),
      };
    }

    this.isSyncing = true;
    this.config.onSyncStart?.();

    const result: SyncResult = {
      success: true,
      uploaded: 0,
      downloaded: 0,
      conflicts: [],
      errors: [],
      timestamp: Date.now(),
    };

    try {
      // Check if cloud storage is available
      const isAvailable = await this.cloudStorage.isAvailable();
      if (!isAvailable) {
        result.success = false;
        result.errors.push({
          path: '',
          operation: 'connect',
          message: 'Cloud storage not available',
          retryable: true,
        });
        return result;
      }

      // 1. Push local changes to cloud
      const pushResult = await this.pushChanges();
      result.uploaded = pushResult.uploaded;
      result.conflicts.push(...pushResult.conflicts);
      result.errors.push(...pushResult.errors);

      // 2. Pull remote changes to local
      const pullResult = await this.pullChanges();
      result.downloaded = pullResult.downloaded;
      result.errors.push(...pullResult.errors);

      result.success = result.errors.filter((e) => !e.retryable).length === 0;
    } catch (error) {
      result.success = false;
      result.errors.push({
        path: '',
        operation: 'sync',
        message: error instanceof Error ? error.message : 'Unknown error',
        retryable: true,
      });
      this.config.onSyncError?.(error instanceof Error ? error : new Error('Sync failed'));
    } finally {
      this.isSyncing = false;
      this.config.onSyncComplete?.(result);
    }

    return result;
  }

  /**
   * Push local changes to cloud
   */
  private async pushChanges(): Promise<{ uploaded: number; conflicts: string[]; errors: SyncError[] }> {
    const result = { uploaded: 0, conflicts: [] as string[], errors: [] as SyncError[] };

    const pendingChanges = await this.localStorage.getPendingChanges();

    for (const change of pendingChanges) {
      try {
        if (change.operation === 'delete') {
          await this.cloudStorage!.deleteFile(change.path);
          await this.localStorage.clearSyncItem(change.id!);
          result.uploaded++;
          continue;
        }

        // Check for conflicts
        const remoteData = await this.cloudStorage!.readFile<any>(change.path);

        if (remoteData && this.hasConflict(change, remoteData)) {
          // Conflict detected
          const resolved = await this.resolveConflict({
            path: change.path,
            local: change.data!,
            remote: remoteData,
            localTimestamp: change.timestamp,
            remoteTimestamp: new Date(remoteData.updatedAt || 0).getTime(),
          });

          await this.cloudStorage!.saveFile(change.path, resolved);
          await this.localStorage.setDataFromRemote(change.path, resolved, 1);
          result.conflicts.push(change.path);
        } else {
          // No conflict, push directly
          await this.cloudStorage!.saveFile(change.path, change.data!);
        }

        await this.localStorage.clearSyncItem(change.id!);
        await this.localStorage.markSynced(change.path, 1, generateSyncId());
        result.uploaded++;
      } catch (error) {
        result.errors.push({
          path: change.path,
          operation: change.operation,
          message: error instanceof Error ? error.message : 'Unknown error',
          retryable: change.retryCount < this.config.maxRetries,
        });
      }
    }

    return result;
  }

  /**
   * Pull remote changes to local
   */
  private async pullChanges(): Promise<{ downloaded: number; errors: SyncError[] }> {
    const result = { downloaded: 0, errors: [] as SyncError[] };

    try {
      const remoteFiles = await this.cloudStorage!.listFiles();
      const localFiles = await this.localStorage.listFiles();

      const localFileMap = new Map(localFiles.map((f) => [f.path, f]));

      for (const remoteFile of remoteFiles) {
        try {
          const localFile = localFileMap.get(remoteFile.path);

          // Check if we need to download
          const needsDownload =
            !localFile ||
            new Date(remoteFile.modifiedTime) > new Date(localFile.modifiedTime);

          if (needsDownload) {
            const data = await this.cloudStorage!.readFile(remoteFile.path);
            if (data) {
              await this.localStorage.setDataFromRemote(
                remoteFile.path,
                data as object,
                remoteFile.version || 1
              );
              result.downloaded++;
            }
          }
        } catch (error) {
          result.errors.push({
            path: remoteFile.path,
            operation: 'download',
            message: error instanceof Error ? error.message : 'Unknown error',
            retryable: true,
          });
        }
      }
    } catch (error) {
      result.errors.push({
        path: '',
        operation: 'list',
        message: error instanceof Error ? error.message : 'Unknown error',
        retryable: true,
      });
    }

    return result;
  }

  /**
   * Check if there's a conflict
   */
  private hasConflict(local: { baseSyncId?: string }, remote: any): boolean {
    // If remote has a syncId and it doesn't match our base, there's a conflict
    return remote.syncId && remote.syncId !== local.baseSyncId;
  }

  /**
   * Resolve a conflict using configured strategy
   */
  private async resolveConflict(conflict: ConflictData): Promise<object> {
    switch (this.config.conflictStrategy) {
      case 'local-wins':
        return { ...conflict.local, syncId: generateSyncId() };

      case 'remote-wins':
        return { ...conflict.remote, syncId: generateSyncId() };

      case 'merge':
        return this.mergeData(conflict.local, conflict.remote);

      case 'ask':
        if (this.config.onConflict) {
          return this.config.onConflict(conflict);
        }
        // Fallback to merge if no callback
        return this.mergeData(conflict.local, conflict.remote);

      default:
        return this.mergeData(conflict.local, conflict.remote);
    }
  }

  /**
   * Smart merge for Kidpen data types
   */
  private mergeData(local: any, remote: any): object {
    const merged = { ...remote };

    for (const key of Object.keys(local)) {
      // Arrays: merge unique values (e.g., completedLessons)
      if (Array.isArray(local[key]) && Array.isArray(remote[key])) {
        merged[key] = [...new Set([...local[key], ...remote[key]])];
      }
      // Quiz scores: take highest score
      else if (key === 'quizScores' && typeof local[key] === 'object') {
        merged[key] = {};
        const allQuizzes = new Set([
          ...Object.keys(local[key] || {}),
          ...Object.keys(remote[key] || {}),
        ]);
        for (const quiz of allQuizzes) {
          merged[key][quiz] = Math.max(
            local[key]?.[quiz] || 0,
            remote[key]?.[quiz] || 0
          );
        }
      }
      // Time spent: take maximum
      else if (key === 'totalTimeSpent') {
        merged[key] = Math.max(local[key] || 0, remote[key] || 0);
      }
      // XP: take maximum
      else if (key === 'totalXP') {
        merged[key] = Math.max(local[key] || 0, remote[key] || 0);
      }
      // Streak: take maximum
      else if (key === 'currentStreak' || key === 'longestStreak') {
        merged[key] = Math.max(local[key] || 0, remote[key] || 0);
      }
      // Badges: merge arrays
      else if (key === 'badges' && Array.isArray(local[key])) {
        const badgeIds = new Set(remote[key]?.map((b: any) => b.id) || []);
        merged[key] = [
          ...(remote[key] || []),
          ...local[key].filter((b: any) => !badgeIds.has(b.id)),
        ];
      }
      // Other fields: take more recent based on updatedAt
      else if (local.updatedAt > (remote.updatedAt || '')) {
        merged[key] = local[key];
      }
    }

    // Always update sync metadata
    merged.syncId = generateSyncId();
    merged.updatedAt = new Date().toISOString();

    return merged;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): { isSyncing: boolean; isAutoSyncEnabled: boolean } {
    return {
      isSyncing: this.isSyncing,
      isAutoSyncEnabled: this.syncInterval !== null,
    };
  }

  /**
   * Trigger manual sync
   */
  async triggerSync(): Promise<SyncResult> {
    return this.sync();
  }
}
