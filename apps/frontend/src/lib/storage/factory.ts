/**
 * Storage Provider Factory
 *
 * Creates the appropriate storage provider based on configuration.
 * Manages singleton instances for app-wide use.
 */

import type { StorageProvider, StorageMode, StorageConfig, DEFAULT_STORAGE_CONFIG } from './types';
import { GoogleDriveProvider, type GoogleDriveConfig } from './google-drive';
import { LocalStorageProvider } from './local-storage';

// Guest provider (no persistent storage)
class GuestProvider implements StorageProvider {
  readonly mode: StorageMode = 'guest';

  private memoryStore = new Map<string, object>();

  async saveFile(path: string, content: object): Promise<string> {
    this.memoryStore.set(path, content);
    return path;
  }

  async readFile<T>(path: string): Promise<T | null> {
    return (this.memoryStore.get(path) as T) || null;
  }

  async deleteFile(path: string): Promise<void> {
    this.memoryStore.delete(path);
  }

  async listFiles(prefix?: string) {
    const files = [];
    for (const [path, data] of this.memoryStore.entries()) {
      if (!prefix || path.startsWith(prefix)) {
        files.push({
          id: path,
          path,
          name: path.split('/').pop() || path,
          mimeType: 'application/json',
          size: JSON.stringify(data).length,
          modifiedTime: new Date().toISOString(),
        });
      }
    }
    return files;
  }

  async getFileMetadata(path: string) {
    const data = this.memoryStore.get(path);
    if (!data) return null;
    return {
      id: path,
      path,
      name: path.split('/').pop() || path,
      mimeType: 'application/json',
      size: JSON.stringify(data).length,
      modifiedTime: new Date().toISOString(),
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

// Singleton instances
let currentProvider: StorageProvider | null = null;
let localProvider: LocalStorageProvider | null = null;
let currentMode: StorageMode = 'guest';

/**
 * Create a storage provider based on mode
 */
export function createStorageProvider(
  mode: StorageMode,
  config?: {
    googleDrive?: GoogleDriveConfig;
    nextcloud?: { webdavUrl: string; username: string; password: string };
  }
): StorageProvider {
  switch (mode) {
    case 'google-drive':
      if (!config?.googleDrive) {
        throw new Error('Google Drive config required');
      }
      return new GoogleDriveProvider(config.googleDrive);

    case 'nextcloud':
      // TODO: Implement NextcloudProvider with WebDAV
      throw new Error('Nextcloud support coming soon');

    case 'local-only':
      if (!localProvider) {
        localProvider = new LocalStorageProvider();
      }
      return localProvider;

    case 'guest':
    default:
      return new GuestProvider();
  }
}

/**
 * Initialize storage with a provider
 */
export function initializeStorage(
  mode: StorageMode,
  config?: Parameters<typeof createStorageProvider>[1]
): StorageProvider {
  currentMode = mode;
  currentProvider = createStorageProvider(mode, config);

  // Always initialize local provider for offline support
  if (!localProvider) {
    localProvider = new LocalStorageProvider();
    localProvider.init().catch(console.error);
  }

  return currentProvider;
}

/**
 * Get the current storage provider
 */
export function getStorageProvider(): StorageProvider {
  if (!currentProvider) {
    // Default to guest mode
    currentProvider = new GuestProvider();
    currentMode = 'guest';
  }
  return currentProvider;
}

/**
 * Get the local storage provider (for offline support)
 */
export function getLocalStorageProvider(): LocalStorageProvider {
  if (!localProvider) {
    localProvider = new LocalStorageProvider();
  }
  return localProvider;
}

/**
 * Get current storage mode
 */
export function getStorageMode(): StorageMode {
  return currentMode;
}

/**
 * Check if user is connected to cloud storage
 */
export function isCloudConnected(): boolean {
  return currentMode === 'google-drive' || currentMode === 'nextcloud';
}

/**
 * Disconnect from cloud storage (revert to local-only)
 */
export function disconnectCloud(): void {
  currentMode = 'local-only';
  currentProvider = localProvider || new LocalStorageProvider();
}

/**
 * Export all user data
 */
export async function exportAllData(): Promise<Blob> {
  const provider = getLocalStorageProvider();
  await provider.init();

  const allData = await provider.getAllData();

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    platform: 'kidpen.space' as const,
    userData: allData,
  };

  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
}

/**
 * Import user data
 */
export async function importData(blob: Blob): Promise<void> {
  const text = await blob.text();
  const data = JSON.parse(text);

  if (data.platform !== 'kidpen.space') {
    throw new Error('Invalid export file');
  }

  const provider = getLocalStorageProvider();
  await provider.init();

  for (const [path, content] of Object.entries(data.userData || {})) {
    await provider.saveFile(path, content as object);
  }
}
