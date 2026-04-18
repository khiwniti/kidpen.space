/**
 * Shared Storage Types for kidpen.space
 * Defines interfaces used by both frontend and shared packages
 */

export interface StorageProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  readFile<T>(path: string): Promise<T | null>;
  saveFile<T>(path: string, data: T): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listFiles(prefix?: string): Promise<FileMetadata[]>;
  getMetadata?(path: string): Promise<FileMetadata | null>;
}

export interface FileMetadata {
  path: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  modifiedAt: string;
  checksum?: string;
}

export interface StorageChange {
  path: string;
  type: 'create' | 'update' | 'delete';
  timestamp: number;
  previousChecksum?: string;
  newChecksum?: string;
  metadata?: Record<string, unknown>;
}

export interface SyncResult {
  success: boolean;
  filesUploaded: number;
  filesDownloaded: number;
  conflicts: SyncConflict[];
  errors: SyncError[];
  duration: number;
  timestamp: number;
}

export interface SyncConflict {
  path: string;
  localVersion: string;
  remoteVersion: string;
  resolution?: 'local' | 'remote' | 'merged';
}

export interface SyncError {
  path: string;
  code: string;
  message: string;
  retryable: boolean;
}

export interface StorageQuota {
  used: number;
  available: number;
  percentage: number;
}

export type StorageMode = 'guest' | 'local' | 'google-drive' | 'nextcloud';

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  grade?: number;
  school?: string;
  interests?: string[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  offlineMode: boolean;
  autoSync: boolean;
  syncIntervalMinutes: number;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  currentLesson: number;
  totalLessons: number;
  completedLessons: number[];
  quizScores: QuizScore[];
  timeSpentMinutes: number;
  masteryLevel: number;
  lastAccessedAt: string;
  startedAt: string;
}

export interface QuizScore {
  quizId: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

export interface SyncEngineConfig {
  conflictStrategy: ConflictStrategy;
  onSyncStart?: () => void;
  onSyncComplete?: (result: SyncResult) => void;
  onSyncError?: (error: Error) => void;
  onConflict?: (conflict: SyncConflict) => void;
}

export type ConflictStrategy = 'local' | 'remote' | 'merge' | 'ask';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  isAutoSyncEnabled: boolean;
  errors: SyncError[];
}