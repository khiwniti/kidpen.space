/**
 * Local Storage Provider (IndexedDB)
 *
 * Offline-first storage using IndexedDB.
 * Data persists in the browser but is lost if user clears browser data.
 *
 * Use cases:
 * - Users without Google accounts
 * - Offline mode before sync
 * - Fallback when Google Drive is unavailable
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type {
  StorageProvider,
  StorageMode,
  FileMetadata,
  SyncQueueItem,
} from './types';
import { generateSyncId } from '../crypto/encryption';

const DB_NAME = 'kidpen-storage';
const DB_VERSION = 1;

interface KidpenDBSchema extends DBSchema {
  files: {
    key: string;
    value: {
      path: string;
      data: object;
      mimeType: string;
      size: number;
      createdAt: string;
      modifiedTime: string;
      localVersion: number;
      remoteVersion: number;
      syncId: string;
      isDirty: boolean;
    };
    indexes: { byModifiedTime: string; byDirty: number };
  };
  syncQueue: {
    key: number;
    value: SyncQueueItem;
    indexes: { byTimestamp: number };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: string | number | boolean;
    };
  };
}

export class LocalStorageProvider implements StorageProvider {
  readonly mode: StorageMode = 'local-only';

  private db: IDBPDatabase<KidpenDBSchema> | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initDatabase();
    return this.initPromise;
  }

  private async initDatabase(): Promise<void> {
    this.db = await openDB<KidpenDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Files store
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'path' });
          filesStore.createIndex('byModifiedTime', 'modifiedTime');
          filesStore.createIndex('byDirty', 'isDirty');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('byTimestamp', 'timestamp');
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });
  }

  private async ensureDb(): Promise<IDBPDatabase<KidpenDBSchema>> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Save a file to IndexedDB
   */
  async saveFile(path: string, content: object): Promise<string> {
    const db = await this.ensureDb();
    const existing = await db.get('files', path);

    const now = new Date().toISOString();
    const jsonContent = JSON.stringify(content);

    const record = {
      path,
      data: content,
      mimeType: 'application/json',
      size: jsonContent.length,
      createdAt: existing?.createdAt || now,
      modifiedTime: now,
      localVersion: (existing?.localVersion || 0) + 1,
      remoteVersion: existing?.remoteVersion || 0,
      syncId: generateSyncId(),
      isDirty: true,
    };

    await db.put('files', record);

    // Add to sync queue
    await db.add('syncQueue', {
      operation: existing ? 'update' : 'create',
      path,
      data: content,
      timestamp: Date.now(),
      baseSyncId: existing?.syncId,
      retryCount: 0,
    });

    return path;
  }

  /**
   * Read a file from IndexedDB
   */
  async readFile<T>(path: string): Promise<T | null> {
    const db = await this.ensureDb();
    const record = await db.get('files', path);
    return (record?.data as T) || null;
  }

  /**
   * Delete a file from IndexedDB
   */
  async deleteFile(path: string): Promise<void> {
    const db = await this.ensureDb();
    const existing = await db.get('files', path);

    if (existing) {
      await db.delete('files', path);

      // Add to sync queue
      await db.add('syncQueue', {
        operation: 'delete',
        path,
        timestamp: Date.now(),
        baseSyncId: existing.syncId,
        retryCount: 0,
      });
    }
  }

  /**
   * List all files
   */
  async listFiles(prefix?: string): Promise<FileMetadata[]> {
    const db = await this.ensureDb();
    const allFiles = await db.getAll('files');

    const filtered = prefix
      ? allFiles.filter((f) => f.path.startsWith(prefix))
      : allFiles;

    return filtered.map((file) => ({
      id: file.path,
      path: file.path,
      name: file.path.split('/').pop() || file.path,
      mimeType: file.mimeType,
      size: file.size,
      modifiedTime: file.modifiedTime,
      version: file.localVersion,
      syncId: file.syncId,
    }));
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<FileMetadata | null> {
    const db = await this.ensureDb();
    const record = await db.get('files', path);

    if (!record) return null;

    return {
      id: record.path,
      path: record.path,
      name: record.path.split('/').pop() || record.path,
      mimeType: record.mimeType,
      size: record.size,
      modifiedTime: record.modifiedTime,
      version: record.localVersion,
      syncId: record.syncId,
    };
  }

  /**
   * Check if storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.init();
      return this.db !== null;
    } catch {
      return false;
    }
  }

  // Additional methods for sync engine

  /**
   * Get all dirty (unsynced) files
   */
  async getDirtyFiles(): Promise<FileMetadata[]> {
    const db = await this.ensureDb();
    const dirtyFiles = await db.getAllFromIndex('files', 'byDirty', 1);

    return dirtyFiles.map((file) => ({
      id: file.path,
      path: file.path,
      name: file.path.split('/').pop() || file.path,
      mimeType: file.mimeType,
      size: file.size,
      modifiedTime: file.modifiedTime,
      version: file.localVersion,
      syncId: file.syncId,
    }));
  }

  /**
   * Get pending sync queue items
   */
  async getPendingChanges(): Promise<SyncQueueItem[]> {
    const db = await this.ensureDb();
    return db.getAllFromIndex('syncQueue', 'byTimestamp');
  }

  /**
   * Clear a sync queue item after successful sync
   */
  async clearSyncItem(id: number): Promise<void> {
    const db = await this.ensureDb();
    await db.delete('syncQueue', id);
  }

  /**
   * Mark a file as synced
   */
  async markSynced(path: string, remoteVersion: number, syncId: string): Promise<void> {
    const db = await this.ensureDb();
    const record = await db.get('files', path);

    if (record) {
      await db.put('files', {
        ...record,
        remoteVersion,
        syncId,
        isDirty: false,
      });
    }
  }

  /**
   * Update file from remote (during sync)
   */
  async setDataFromRemote(path: string, data: object, remoteVersion: number): Promise<void> {
    const db = await this.ensureDb();
    const existing = await db.get('files', path);

    const now = new Date().toISOString();
    const jsonContent = JSON.stringify(data);

    await db.put('files', {
      path,
      data,
      mimeType: 'application/json',
      size: jsonContent.length,
      createdAt: existing?.createdAt || now,
      modifiedTime: now,
      localVersion: existing?.localVersion || 1,
      remoteVersion,
      syncId: generateSyncId(),
      isDirty: false,
    });
  }

  /**
   * Get all files (for export)
   */
  async getAllData(): Promise<Record<string, object>> {
    const db = await this.ensureDb();
    const allFiles = await db.getAll('files');

    const result: Record<string, object> = {};
    for (const file of allFiles) {
      result[file.path] = file.data;
    }

    return result;
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDb();
    await db.clear('files');
    await db.clear('syncQueue');
    await db.clear('metadata');
  }

  /**
   * Get metadata value
   */
  async getMetadata<T = string>(key: string): Promise<T | null> {
    const db = await this.ensureDb();
    const record = await db.get('metadata', key);
    return (record?.value as T) || null;
  }

  /**
   * Set metadata value
   */
  async setMetadata(key: string, value: string | number | boolean): Promise<void> {
    const db = await this.ensureDb();
    await db.put('metadata', { key, value });
  }
}

// Singleton instance for app-wide use
export const localStorageProvider = new LocalStorageProvider();
