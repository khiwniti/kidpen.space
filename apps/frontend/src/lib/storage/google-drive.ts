/**
 * Google Drive Storage Provider
 *
 * Stores user data in the Google Drive appDataFolder.
 * This is a hidden folder only accessible by the Kidpen app.
 *
 * Features:
 * - Zero cost (uses user's own Google Drive storage)
 * - User owns their data
 * - Automatic versioning (up to 200 revisions)
 * - Real-time change notifications
 *
 * Required OAuth Scope: https://www.googleapis.com/auth/drive.appdata
 */

import type {
  StorageProvider,
  StorageMode,
  FileMetadata,
  StorageChange,
} from './types';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

export interface GoogleDriveConfig {
  accessToken: string;
  refreshToken?: string;
  onTokenRefresh?: (newToken: string) => void;
}

export class GoogleDriveProvider implements StorageProvider {
  readonly mode: StorageMode = 'google-drive';

  private accessToken: string;
  private refreshToken?: string;
  private onTokenRefresh?: (newToken: string) => void;
  private fileCache: Map<string, { id: string; modifiedTime: string }> = new Map();

  constructor(config: GoogleDriveConfig) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.onTokenRefresh = config.onTokenRefresh;
  }

  /**
   * Update access token (after refresh)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Save a file to Google Drive appDataFolder
   */
  async saveFile(path: string, content: object): Promise<string> {
    const fileName = this.pathToFileName(path);
    const existingFile = await this.findFile(fileName);

    if (existingFile) {
      // Update existing file
      await this.updateFile(existingFile.id, content);
      return existingFile.id;
    }

    // Create new file
    return this.createFile(fileName, content);
  }

  /**
   * Read a file from Google Drive
   */
  async readFile<T>(path: string): Promise<T | null> {
    const fileName = this.pathToFileName(path);
    const file = await this.findFile(fileName);

    if (!file) {
      return null;
    }

    const response = await this.fetch(`${DRIVE_API_BASE}/files/${file.id}?alt=media`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to read file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(path: string): Promise<void> {
    const fileName = this.pathToFileName(path);
    const file = await this.findFile(fileName);

    if (!file) {
      return; // Already deleted
    }

    const response = await this.fetch(`${DRIVE_API_BASE}/files/${file.id}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    this.fileCache.delete(fileName);
  }

  /**
   * List all files in appDataFolder
   */
  async listFiles(prefix?: string): Promise<FileMetadata[]> {
    let query = "spaces = 'appDataFolder'";
    if (prefix) {
      query += ` and name contains '${this.pathToFileName(prefix)}'`;
    }

    const response = await this.fetch(
      `${DRIVE_API_BASE}/files?` +
        new URLSearchParams({
          spaces: 'appDataFolder',
          q: query,
          fields: 'files(id,name,mimeType,size,modifiedTime)',
          pageSize: '100',
        })
    );

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const data = await response.json();

    return (data.files || []).map((file: any) => ({
      id: file.id,
      path: this.fileNameToPath(file.name),
      name: file.name,
      mimeType: file.mimeType,
      size: parseInt(file.size || '0', 10),
      modifiedTime: file.modifiedTime,
    }));
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<FileMetadata | null> {
    const fileName = this.pathToFileName(path);
    const file = await this.findFile(fileName);

    if (!file) {
      return null;
    }

    const response = await this.fetch(
      `${DRIVE_API_BASE}/files/${file.id}?fields=id,name,mimeType,size,modifiedTime`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      path: this.fileNameToPath(data.name),
      name: data.name,
      mimeType: data.mimeType,
      size: parseInt(data.size || '0', 10),
      modifiedTime: data.modifiedTime,
    };
  }

  /**
   * Watch for changes (using Changes API)
   */
  watchChanges(callback: (changes: StorageChange[]) => void): () => void {
    let isRunning = true;
    let startPageToken: string | null = null;

    const pollChanges = async () => {
      if (!isRunning) return;

      try {
        // Get start page token if we don't have one
        if (!startPageToken) {
          const tokenResponse = await this.fetch(
            `${DRIVE_API_BASE}/changes/startPageToken?spaces=appDataFolder`
          );
          if (tokenResponse.ok) {
            const data = await tokenResponse.json();
            startPageToken = data.startPageToken;
          }
        }

        if (startPageToken) {
          const changesResponse = await this.fetch(
            `${DRIVE_API_BASE}/changes?` +
              new URLSearchParams({
                pageToken: startPageToken,
                spaces: 'appDataFolder',
                fields: 'newStartPageToken,changes(fileId,removed,file(name,modifiedTime))',
              })
          );

          if (changesResponse.ok) {
            const data = await changesResponse.json();

            if (data.changes && data.changes.length > 0) {
              const storageChanges: StorageChange[] = data.changes.map((change: any) => ({
                type: change.removed
                  ? 'deleted'
                  : this.fileCache.has(change.file?.name)
                    ? 'modified'
                    : 'created',
                path: this.fileNameToPath(change.file?.name || ''),
                fileId: change.fileId,
                timestamp: new Date(change.file?.modifiedTime || Date.now()).getTime(),
              }));

              callback(storageChanges);
            }

            if (data.newStartPageToken) {
              startPageToken = data.newStartPageToken;
            }
          }
        }
      } catch (error) {
        console.error('Error polling for changes:', error);
      }

      // Poll every 30 seconds
      if (isRunning) {
        setTimeout(pollChanges, 30000);
      }
    };

    // Start polling
    pollChanges();

    // Return cleanup function
    return () => {
      isRunning = false;
    };
  }

  /**
   * Check if Google Drive is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.fetch(`${DRIVE_API_BASE}/about?fields=user`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Private methods

  private async findFile(
    fileName: string
  ): Promise<{ id: string; modifiedTime: string } | null> {
    // Check cache first
    const cached = this.fileCache.get(fileName);
    if (cached) {
      return cached;
    }

    const response = await this.fetch(
      `${DRIVE_API_BASE}/files?` +
        new URLSearchParams({
          spaces: 'appDataFolder',
          q: `name = '${fileName}'`,
          fields: 'files(id,modifiedTime)',
          pageSize: '1',
        })
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const file = data.files?.[0];

    if (file) {
      this.fileCache.set(fileName, { id: file.id, modifiedTime: file.modifiedTime });
      return file;
    }

    return null;
  }

  private async createFile(fileName: string, content: object): Promise<string> {
    const metadata = {
      name: fileName,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append(
      'file',
      new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    );

    const response = await fetch(`${UPLOAD_API_BASE}/files?uploadType=multipart&fields=id`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Failed to create file: ${response.statusText}`);
    }

    const data = await response.json();

    this.fileCache.set(fileName, { id: data.id, modifiedTime: new Date().toISOString() });

    return data.id;
  }

  private async updateFile(fileId: string, content: object): Promise<void> {
    const response = await fetch(
      `${UPLOAD_API_BASE}/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content, null, 2),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.statusText}`);
    }
  }

  private async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    // Handle token refresh if needed
    if (response.status === 401 && this.refreshToken && this.onTokenRefresh) {
      // Token refresh would be handled here
      // For now, just throw an error
      throw new Error('Access token expired. Please re-authenticate.');
    }

    return response;
  }

  /**
   * Convert path (e.g., "progress/course-001.json") to file name
   * Replaces "/" with "_" to create flat file names in appDataFolder
   */
  private pathToFileName(path: string): string {
    return `kidpen_${path.replace(/\//g, '_')}`;
  }

  /**
   * Convert file name back to path
   */
  private fileNameToPath(fileName: string): string {
    return fileName.replace(/^kidpen_/, '').replace(/_/g, '/');
  }
}
