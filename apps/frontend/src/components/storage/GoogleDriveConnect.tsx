/**
 * Google Drive Connection Components
 *
 * UI components for connecting Google Drive storage.
 * Handles OAuth flow, connection status, and user guidance.
 */

'use client';

import { useState, useCallback } from 'react';
import { useStorage, useSync, useOfflineStatus } from '@/lib/storage/hooks';
import type { StorageMode } from '@/lib/storage/types';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata', // App-specific folder only
  'https://www.googleapis.com/auth/userinfo.profile', // User profile info
];

interface GoogleDriveConnectProps {
  onConnect?: (accessToken: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Button to connect Google Drive
 */
export function GoogleDriveConnectButton({
  onConnect,
  onError,
  className,
}: GoogleDriveConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { switchMode, mode } = useStorage();

  const handleConnect = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID) {
      onError?.(new Error('Google OAuth not configured'));
      return;
    }

    setIsConnecting(true);

    try {
      // Initialize Google OAuth
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_OAUTH_SCOPES.join(' '),
        callback: async (response: google.accounts.oauth2.TokenResponse) => {
          if (response.error) {
            onError?.(new Error(response.error_description || 'OAuth failed'));
            setIsConnecting(false);
            return;
          }

          try {
            // Switch to Google Drive mode
            await switchMode('google-drive', {
              googleDrive: {
                accessToken: response.access_token,
              },
            });

            onConnect?.(response.access_token);
          } catch (err) {
            onError?.(err instanceof Error ? err : new Error('Connection failed'));
          } finally {
            setIsConnecting(false);
          }
        },
      });

      // Request access token
      tokenClient.requestAccessToken();
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('OAuth initialization failed'));
      setIsConnecting(false);
    }
  }, [switchMode, onConnect, onError]);

  if (mode === 'google-drive') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          เชื่อมต่อ Google Drive แล้ว
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-xl
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        hover:bg-gray-50 dark:hover:bg-gray-700
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        font-medium text-sm
        ${className}
      `}
    >
      {isConnecting ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          กำลังเชื่อมต่อ...
        </>
      ) : (
        <>
          <GoogleDriveIcon className="w-5 h-5" />
          เชื่อมต่อ Google Drive
        </>
      )}
    </button>
  );
}

/**
 * Storage onboarding component
 */
export function StorageOnboarding({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<'intro' | 'connect' | 'success'>('intro');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      {step === 'intro' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-kidpen-gold/10 rounded-full flex items-center justify-center">
            <CloudIcon className="w-8 h-8 text-kidpen-gold" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            เชื่อมต่อพื้นที่เก็บข้อมูล
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Kidpen ใช้ Google Drive ส่วนตัวของคุณเก็บข้อมูลการเรียนรู้
            ข้อมูลเป็นของคุณทั้งหมดและปลอดภัย
          </p>

          <div className="space-y-3 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <FeatureItem
              icon="🔒"
              title="ข้อมูลเป็นของคุณ"
              description="ข้อมูลเก็บใน Google Drive ของคุณ ไม่ใช่เซิร์ฟเวอร์ของเรา"
            />
            <FeatureItem
              icon="🛡️"
              title="เข้ารหัสปลอดภัย"
              description="ข้อมูลถูกเข้ารหัสก่อนส่งไป Google Drive"
            />
            <FeatureItem
              icon="📱"
              title="ใช้ได้ทุกอุปกรณ์"
              description="เข้าถึงข้อมูลการเรียนจากทุกที่"
            />
            <FeatureItem
              icon="🔄"
              title="ใช้งานออฟไลน์"
              description="เรียนต่อได้แม้ไม่มีอินเทอร์เน็ต"
            />
          </div>

          <button
            onClick={() => setStep('connect')}
            className="w-full py-3 bg-kidpen-gold hover:bg-kidpen-gold/90 text-white font-semibold rounded-xl transition-colors"
          >
            เริ่มต้นใช้งาน
          </button>
        </div>
      )}

      {step === 'connect' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <GoogleDriveIcon className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            เชื่อมต่อ Google Drive
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            อนุญาตให้ Kidpen เข้าถึงโฟลเดอร์แอปเท่านั้น
            ไม่สามารถเข้าถึงไฟล์อื่นของคุณได้
          </p>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <GoogleDriveConnectButton
              onConnect={() => setStep('success')}
              onError={(err) => setError(err.message)}
              className="w-full justify-center"
            />

            <button
              onClick={() => setStep('intro')}
              className="w-full py-2 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300"
            >
              ย้อนกลับ
            </button>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            เราใช้สิทธิ์ drive.appdata เท่านั้น ซึ่งจำกัดการเข้าถึงเฉพาะโฟลเดอร์แอป
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            เชื่อมต่อสำเร็จ! 🎉
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            พร้อมเริ่มต้นการเรียนรู้แล้ว ข้อมูลของคุณจะถูกซิงค์โดยอัตโนมัติ
          </p>

          <button
            onClick={onComplete}
            className="w-full py-3 bg-kidpen-gold hover:bg-kidpen-gold/90 text-white font-semibold rounded-xl transition-colors"
          >
            เริ่มเรียนเลย!
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Sync status indicator
 */
export function SyncStatusIndicator({ className }: { className?: string }) {
  const { isSyncing, lastSyncTime, pendingChanges, hasPendingChanges } = useSync();
  const { isOnline } = useOfflineStatus();
  const { mode } = useStorage();

  if (mode === 'guest' || mode === 'local-only') {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-gray-400 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        ออฟไลน์
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-amber-500 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        ออฟไลน์ ({pendingChanges} รายการรอซิงค์)
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-blue-500 ${className}`}>
        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        กำลังซิงค์...
      </div>
    );
  }

  if (hasPendingChanges) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-amber-500 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        {pendingChanges} รายการรอซิงค์
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs text-green-500 ${className}`}>
      <span className="w-2 h-2 rounded-full bg-green-500" />
      ซิงค์แล้ว
      {lastSyncTime && (
        <span className="text-gray-400">
          {formatRelativeTime(lastSyncTime)}
        </span>
      )}
    </div>
  );
}

/**
 * Offline mode banner
 */
export function OfflineBanner() {
  const { isOnline, wasOffline } = useOfflineStatus();
  const { pendingChanges, sync } = useSync();

  if (isOnline && !wasOffline) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm z-50">
        <span className="inline-flex items-center gap-2">
          <CloudOffIcon className="w-4 h-4" />
          คุณกำลังใช้งานออฟไลน์ - การเปลี่ยนแปลงจะถูกบันทึกในเครื่อง
        </span>
      </div>
    );
  }

  // Just came back online
  if (wasOffline && pendingChanges > 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white px-4 py-2 text-center text-sm z-50">
        <span className="inline-flex items-center gap-2">
          <CloudIcon className="w-4 h-4" />
          กลับมาออนไลน์แล้ว! มี {pendingChanges} รายการรอซิงค์
          <button
            onClick={() => sync()}
            className="underline hover:no-underline ml-2"
          >
            ซิงค์เลย
          </button>
        </span>
      </div>
    );
  }

  return null;
}

// Helper components and utilities

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} วันที่แล้ว`;
}

// Icons

function GoogleDriveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" fill="none">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0l6.6 13.85z" fill="#0066DA" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3L1.2 46.05c-.8 1.4-1.2 2.95-1.2 4.55h27.5l16.15-25.6z" fill="#00AC47" />
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.55H59.85l6.4 11.05 7.3 12.8z" fill="#EA4335" />
      <path d="M43.65 25 57.4 1.2c-1.35-.8-2.9-1.2-4.5-1.2H34.35c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D" />
      <path d="M59.8 53H27.45L13.7 76.8c1.35.8 2.9 1.2 4.5 1.2h50.9c1.6 0 3.15-.45 4.5-1.2L59.8 53z" fill="#2684FC" />
      <path d="M73.4 26.5 60.1 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28H87.3c0-1.6-.4-3.15-1.2-4.55l-12.7-21.95z" fill="#FFBA00" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

function CloudOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

// Google OAuth types declaration
declare global {
  const google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: google.accounts.oauth2.TokenResponse) => void;
        }) => {
          requestAccessToken: () => void;
        };
      };
    };
  };

  namespace google.accounts.oauth2 {
    interface TokenResponse {
      access_token: string;
      error?: string;
      error_description?: string;
      expires_in: number;
      scope: string;
      token_type: string;
    }
  }
}

export {};