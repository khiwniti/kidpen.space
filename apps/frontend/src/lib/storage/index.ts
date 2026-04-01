/**
 * Kidpen Storage Module
 *
 * Unified storage interface supporting:
 * - Google Drive (user owns data, zero cost)
 * - Local IndexedDB (offline-first)
 * - Nextcloud (self-hosted alternative)
 *
 * This module provides the foundation for Kidpen's cost-free,
 * user-owned data storage architecture.
 */

// Types
export * from './types';

// Storage Providers
export { GoogleDriveProvider, type GoogleDriveConfig } from './google-drive';
export { LocalStorageProvider, localStorageProvider } from './local-storage';

// Factory function
export {
  createStorageProvider,
  getStorageProvider,
  initializeStorage,
  getLocalStorageProvider,
  getStorageMode,
  isCloudConnected,
  disconnectCloud,
  exportAllData,
  importData,
} from './factory';

// Sync Engine
export { SyncEngine, type SyncEngineConfig, type ConflictStrategy } from '../sync/sync-engine';

// React Hooks
export {
  useStorage,
  useStorageData,
  useUserProfile,
  useCourseProgress,
  useSync,
  useOfflineStatus,
  useFileList,
  useStorageQuota,
  useKidpenStorage,
} from './hooks';

// Encryption
export {
  encrypt,
  decrypt,
  deriveKey,
  generateRandomKey,
  hashData,
  generateSyncId,
  isCryptoAvailable,
  EncryptionService,
  encryptionService,
  type EncryptedData,
} from '../crypto/encryption';
