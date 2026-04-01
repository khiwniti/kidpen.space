/**
 * Kidpen Storage React Hooks
 *
 * React hooks for storage operations with TypeScript support.
 * Provides reactive state management for storage, sync, and offline status.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  StorageProvider,
  StorageMode,
  CourseProgress,
  UserProfile,
  FileMetadata,
  SyncResult,
} from './types';
import {
  getStorageProvider,
  initializeStorage,
  getStorageMode,
  isCloudConnected,
  getLocalStorageProvider,
} from './factory';
import { SyncEngine, type ConflictStrategy } from '../sync/sync-engine';

/**
 * Hook for accessing storage provider
 */
export function useStorage() {
  const [provider, setProvider] = useState<StorageProvider | null>(null);
  const [mode, setMode] = useState<StorageMode>('guest');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const currentProvider = getStorageProvider();
        const currentMode = getStorageMode();
        const available = await currentProvider.isAvailable();

        if (available) {
          setProvider(currentProvider);
          setMode(currentMode);
          setIsReady(true);
        } else {
          throw new Error('Storage not available');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Storage initialization failed'));
        setIsReady(false);
      }
    };

    initialize();
  }, []);

  const switchMode = useCallback(
    async (newMode: StorageMode, config?: Parameters<typeof initializeStorage>[1]) => {
      try {
        setIsReady(false);
        const newProvider = initializeStorage(newMode, config);
        const available = await newProvider.isAvailable();

        if (available) {
          setProvider(newProvider);
          setMode(newMode);
          setIsReady(true);
          setError(null);
        } else {
          throw new Error(`${newMode} storage not available`);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Mode switch failed'));
        setIsReady(false);
      }
    },
    []
  );

  return {
    provider,
    mode,
    isReady,
    error,
    isCloudConnected: isCloudConnected(),
    switchMode,
  };
}

/**
 * Hook for reading and writing specific data
 */
export function useStorageData<T extends object>(path: string) {
  const { provider, isReady } = useStorage();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!provider || !isReady) return;

      try {
        setIsLoading(true);
        const result = await provider.readFile<T>(path);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [provider, path, isReady]);

  // Save data
  const save = useCallback(
    async (newData: T) => {
      if (!provider) {
        throw new Error('Storage not ready');
      }

      try {
        setIsSaving(true);
        await provider.saveFile(path, newData);
        setData(newData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save data'));
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [provider, path]
  );

  // Delete data
  const remove = useCallback(async () => {
    if (!provider) {
      throw new Error('Storage not ready');
    }

    try {
      setIsSaving(true);
      await provider.deleteFile(path);
      setData(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete data'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [provider, path]);

  // Update partial data
  const update = useCallback(
    async (updates: Partial<T>) => {
      const newData = { ...data, ...updates } as T;
      await save(newData);
    },
    [data, save]
  );

  return {
    data,
    isLoading,
    error,
    isSaving,
    save,
    update,
    remove,
    refresh: useCallback(async () => {
      if (!provider) return;
      const result = await provider.readFile<T>(path);
      setData(result);
    }, [provider, path]),
  };
}

/**
 * Hook for user profile management
 */
export function useUserProfile() {
  return useStorageData<UserProfile>('profile/user.json');
}

/**
 * Hook for course progress management
 */
export function useCourseProgress(courseId: string) {
  return useStorageData<CourseProgress>(`progress/${courseId}.json`);
}

/**
 * Hook for sync engine management
 */
export function useSync(options?: {
  autoSync?: boolean;
  syncInterval?: number;
  conflictStrategy?: ConflictStrategy;
  onSyncComplete?: (result: SyncResult) => void;
  onSyncError?: (error: Error) => void;
}) {
  const { provider, mode, isReady } = useStorage();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const syncEngineRef = useRef<SyncEngine | null>(null);

  // Initialize sync engine
  useEffect(() => {
    if (!isReady) return;

    const localStorage = getLocalStorageProvider();
    const conflictStrategy = options?.conflictStrategy || 'merge';
    const autoSync = options?.autoSync;
    const syncInterval = options?.syncInterval;
    const onSyncCompleteCallback = options?.onSyncComplete;
    const onSyncErrorCallback = options?.onSyncError;

    localStorage.init().then(() => {
      syncEngineRef.current = new SyncEngine(localStorage, {
        conflictStrategy,
        onSyncStart: () => {
          setIsSyncing(true);
          setSyncError(null);
        },
        onSyncComplete: (result) => {
          setIsSyncing(false);
          setLastSyncTime(new Date());
          if (result.success) {
            onSyncCompleteCallback?.(result);
          }
          // Update pending changes count
          localStorage.getPendingChanges().then((changes) => {
            setPendingChanges(changes.length);
          });
        },
        onSyncError: (error) => {
          setIsSyncing(false);
          setSyncError(error);
          onSyncErrorCallback?.(error);
        },
      });

      // Set cloud storage if connected
      if (mode === 'google-drive' && provider) {
        syncEngineRef.current.setCloudStorage(provider);
      }

      // Start auto-sync if enabled
      if (autoSync) {
        syncEngineRef.current.startAutoSync(syncInterval || 30000);
      }

      // Get initial pending changes count
      localStorage.getPendingChanges().then((changes) => {
        setPendingChanges(changes.length);
      });
    });

    return () => {
      syncEngineRef.current?.stopAutoSync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, provider, mode]);

  // Manual sync trigger
  const sync = useCallback(async (): Promise<SyncResult | null> => {
    if (!syncEngineRef.current) {
      setSyncError(new Error('Sync engine not initialized'));
      return null;
    }

    return syncEngineRef.current.triggerSync();
  }, []);

  // Start/stop auto sync
  const startAutoSync = useCallback((interval?: number) => {
    syncEngineRef.current?.startAutoSync(interval);
  }, []);

  const stopAutoSync = useCallback(() => {
    syncEngineRef.current?.stopAutoSync();
  }, []);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    pendingChanges,
    hasPendingChanges: pendingChanges > 0,
    sync,
    startAutoSync,
    stopAutoSync,
    isAutoSyncEnabled: syncEngineRef.current?.getSyncStatus().isAutoSyncEnabled ?? false,
  };
}

/**
 * Hook for offline status detection
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger reconnection logic
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    connectionStatus: isOnline ? 'online' : 'offline',
  };
}

/**
 * Hook for file listing with search and filter
 */
export function useFileList(prefix?: string) {
  const { provider, isReady } = useStorage();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!provider || !isReady) return;

    try {
      setIsLoading(true);
      const fileList = await provider.listFiles(prefix);
      setFiles(fileList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to list files'));
    } finally {
      setIsLoading(false);
    }
  }, [provider, isReady, prefix]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    files,
    isLoading,
    error,
    refresh,
    fileCount: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
  };
}

/**
 * Hook for storage quota and usage
 */
export function useStorageQuota() {
  const [quota, setQuota] = useState<{
    used: number;
    available: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const checkQuota = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const used = estimate.usage || 0;
          const available = estimate.quota || 0;
          const percentage = available > 0 ? (used / available) * 100 : 0;

          setQuota({ used, available, percentage });
        } catch {
          // Quota API not supported or failed
          setQuota(null);
        }
      }
    };

    checkQuota();
  }, []);

  return {
    quota,
    usedMB: quota ? (quota.used / 1024 / 1024).toFixed(2) : null,
    availableMB: quota ? (quota.available / 1024 / 1024).toFixed(2) : null,
    isNearLimit: quota ? quota.percentage > 90 : false,
  };
}

/**
 * Combined storage context hook
 */
export function useKidpenStorage() {
  const storage = useStorage();
  const profile = useUserProfile();
  const offline = useOfflineStatus();
  const sync = useSync({
    autoSync: storage.isCloudConnected,
    conflictStrategy: 'merge',
  });
  const quota = useStorageQuota();

  return {
    // Storage state
    mode: storage.mode,
    isReady: storage.isReady,
    isCloudConnected: storage.isCloudConnected,
    switchMode: storage.switchMode,

    // User profile
    profile: profile.data,
    isProfileLoading: profile.isLoading,
    updateProfile: profile.update,

    // Offline status
    isOnline: offline.isOnline,
    connectionStatus: offline.connectionStatus,

    // Sync status
    isSyncing: sync.isSyncing,
    lastSyncTime: sync.lastSyncTime,
    pendingChanges: sync.pendingChanges,
    triggerSync: sync.sync,

    // Quota
    storageQuota: quota.quota,
    isNearStorageLimit: quota.isNearLimit,
  };
}
