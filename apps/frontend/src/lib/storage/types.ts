/**
 * Kidpen Storage Types
 *
 * Type definitions for the storage abstraction layer.
 * Supports Google Drive, Nextcloud (WebDAV), and local storage backends.
 */

// Storage provider mode
export type StorageMode = 'google-drive' | 'nextcloud' | 'local-only' | 'guest';

// File metadata returned by storage providers
export interface FileMetadata {
  id: string;
  path: string;
  name: string;
  mimeType: string;
  size: number;
  modifiedTime: string;
  version?: number;
  syncId?: string;
}

// Change notification from cloud storage
export interface StorageChange {
  type: 'created' | 'modified' | 'deleted';
  path: string;
  fileId?: string;
  timestamp: number;
}

// Abstract storage provider interface
export interface StorageProvider {
  readonly mode: StorageMode;

  // File operations
  saveFile(path: string, content: object): Promise<string>;
  readFile<T>(path: string): Promise<T | null>;
  deleteFile(path: string): Promise<void>;
  listFiles(prefix?: string): Promise<FileMetadata[]>;

  // Sync operations
  getFileMetadata(path: string): Promise<FileMetadata | null>;
  watchChanges?(callback: (changes: StorageChange[]) => void): () => void;

  // Health check
  isAvailable(): Promise<boolean>;
}

// User profile stored in Drive
export interface UserProfile {
  version: string;
  id: string;
  displayName: string;
  email: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  syncId: string;
}

export interface UserPreferences {
  language: 'th' | 'en';
  theme: 'light' | 'dark' | 'kidpen';
  notifications: boolean;
  soundEffects: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

// Course progress stored in Drive
export interface CourseProgress {
  version: string;
  courseId: string;
  completedLessons: string[];
  currentLesson: string | null;
  quizScores: Record<string, number>;
  widgetInteractions: WidgetInteraction[];
  totalTimeSpent: number; // in seconds
  lastAccessed: string;
  syncId: string;
}

export interface WidgetInteraction {
  widgetId: string;
  widgetType: string;
  completed: boolean;
  score?: number;
  attempts: number;
  lastInteraction: string;
  data?: Record<string, unknown>;
}

// Achievement/badge data
export interface AchievementData {
  version: string;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  badges: Badge[];
  syncId: string;
}

export interface Badge {
  id: string;
  type: 'xp' | 'streak' | 'league' | 'mentor' | 'creator' | 'mastery';
  earnedAt: string;
  level?: number;
  metadata?: Record<string, unknown>;
}

// Sync queue item for offline changes
export interface SyncQueueItem {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  path: string;
  data?: object;
  timestamp: number;
  baseSyncId?: string;
  retryCount: number;
}

// Sync result summary
export interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  conflicts: string[];
  errors: SyncError[];
  timestamp: number;
}

export interface SyncError {
  path: string;
  operation: string;
  message: string;
  retryable: boolean;
}

// Conflict data for resolution
export interface ConflictData<T = object> {
  path: string;
  local: T;
  remote: T;
  localTimestamp: number;
  remoteTimestamp: number;
}

// Export data format
export interface ExportData {
  exportedAt: string;
  version: string;
  platform: 'kidpen.space';
  userData: {
    profile?: UserProfile;
    progress: Record<string, CourseProgress>;
    achievements?: AchievementData;
  };
}

// Auth tokens for Google Drive
export interface GoogleAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
}

// Storage configuration
export interface StorageConfig {
  mode: StorageMode;
  encryptionEnabled: boolean;
  autoSync: boolean;
  syncIntervalMs: number;
  maxRetries: number;
  conflictStrategy: 'local-wins' | 'remote-wins' | 'merge' | 'ask';
}

// Default storage configuration
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  mode: 'guest',
  encryptionEnabled: true,
  autoSync: true,
  syncIntervalMs: 30000, // 30 seconds
  maxRetries: 3,
  conflictStrategy: 'merge',
};
