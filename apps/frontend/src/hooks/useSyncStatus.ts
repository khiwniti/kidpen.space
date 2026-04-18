'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SyncResult, SyncStatus } from '@kidpen/shared/storage/types';

export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';

export interface UseSyncStatusReturn {
  state: SyncState;
  lastSyncTime: Date | null;
  lastSyncResult: SyncResult | null;
  pendingChanges: number;
  error: Error | null;
  isOnline: boolean;
  sync: () => Promise<SyncResult | null>;
  clearError: () => void;
}

export function useSyncStatus(): UseSyncStatusReturn {
  const [state, setState] = useState<SyncState>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

  // Online/offline detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      if (state === 'offline') {
        setState('idle');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (state !== 'error') {
        setState('offline');
      }
    };

    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state]);

  // Periodic sync
  useEffect(() => {
    if (!isOnline) return;

    syncIntervalRef.current = setInterval(() => {
      sync();
    }, SYNC_INTERVAL_MS);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline]);

  const sync = useCallback(async (): Promise<SyncResult | null> => {
    if (!isOnline) {
      setState('offline');
      return null;
    }

    setState('syncing');
    setError(null);

    try {
      // Import dynamically to avoid circular dependencies
      const { getStorageProvider, getLocalStorageProvider } = await import('../lib/storage/factory');
      
      const cloudProvider = getStorageProvider();
      const localProvider = getLocalStorageProvider();
      
      if (!cloudProvider || !(await cloudProvider.isAvailable())) {
        setState('idle');
        return null;
      }

      // Perform sync
      const localChanges = await localProvider.getPendingChanges?.() || [];
      setPendingChanges(localChanges.length);

      if (localChanges.length === 0) {
        const result: SyncResult = {
          success: true,
          filesUploaded: 0,
          filesDownloaded: 0,
          conflicts: [],
          errors: [],
          duration: 0,
          timestamp: Date.now(),
        };
        setLastSyncResult(result);
        setLastSyncTime(new Date());
        setState('idle');
        return result;
      }

      // Upload local changes to cloud
      let filesUploaded = 0;
      let filesDownloaded = 0;
      const errors: SyncResult['errors'] = [];

      for (const change of localChanges) {
        try {
          if (change.type === 'delete') {
            await cloudProvider.deleteFile(change.path);
            filesUploaded++;
          } else {
            const data = await localProvider.readFile(change.path);
            if (data) {
              await cloudProvider.saveFile(change.path, data);
              filesUploaded++;
            }
          }
        } catch (err) {
          errors.push({
            path: change.path,
            code: 'SYNC_UPLOAD_ERROR',
            message: err instanceof Error ? err.message : 'Upload failed',
            retryable: true,
          });
        }
      }

      // Download remote changes
      try {
        const remoteFiles = await cloudProvider.listFiles();
        for (const remoteFile of remoteFiles) {
          const localData = await localProvider.readFile(remoteFile.path);
          if (!localData) {
            const remoteData = await cloudProvider.readFile(remoteFile.path);
            if (remoteData) {
              await localProvider.saveFile(remoteFile.path, remoteData);
              filesDownloaded++;
            }
          }
        }
      } catch (err) {
        errors.push({
          path: '',
          code: 'SYNC_DOWNLOAD_ERROR',
          message: err instanceof Error ? err.message : 'Download failed',
          retryable: true,
        });
      }

      const result: SyncResult = {
        success: errors.length === 0,
        filesUploaded,
        filesDownloaded,
        conflicts: [],
        errors,
        duration: 0,
        timestamp: Date.now(),
      };

      setLastSyncResult(result);
      setLastSyncTime(new Date());
      setPendingChanges(0);
      setState(errors.length > 0 ? 'error' : 'idle');

      if (errors.length > 0) {
        setError(new Error(`${errors.length} sync errors occurred`));
      }

      return result;
    } catch (err) {
      const syncError = err instanceof Error ? err : new Error('Sync failed');
      setError(syncError);
      setState('error');
      return null;
    }
  }, [isOnline]);

  const clearError = useCallback(() => {
    setError(null);
    if (isOnline) {
      setState('idle');
    } else {
      setState('offline');
    }
  }, [isOnline]);

  return {
    state,
    lastSyncTime,
    lastSyncResult,
    pendingChanges,
    error,
    isOnline,
    sync,
    clearError,
  };
}

export function useSyncStatusSimple(): {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncNow: () => Promise<void>;
} {
  const { state, lastSyncTime, sync } = useSyncStatus();

  return {
    isSyncing: state === 'syncing',
    lastSyncTime,
    syncNow: async () => {
      await sync();
    },
  };
}