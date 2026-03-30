/**
 * Kidpen Client-Side Encryption
 *
 * AES-GCM encryption for sensitive user data before storing in Google Drive.
 * Uses Web Crypto API for secure, browser-native encryption.
 *
 * Security Features:
 * - PBKDF2 key derivation (100,000 iterations)
 * - AES-256-GCM authenticated encryption
 * - Random IV per encryption
 * - No key storage (derived from user password)
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  version: number;
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with AES-GCM
 */
export async function encrypt(
  data: object,
  password: string
): Promise<EncryptedData> {
  const encoder = new TextEncoder();

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Encrypt the data
  const plaintext = encoder.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    plaintext
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    version: 1,
  };
}

/**
 * Decrypt data with AES-GCM
 */
export async function decrypt<T>(
  encryptedData: EncryptedData,
  password: string
): Promise<T> {
  const decoder = new TextDecoder();

  // Decode base64 values
  const salt = base64ToArrayBuffer(encryptedData.salt);
  const iv = base64ToArrayBuffer(encryptedData.iv);
  const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);

  // Derive key from password
  const key = await deriveKey(password, new Uint8Array(salt));

  // Decrypt the data
  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: new Uint8Array(iv) },
    key,
    ciphertext
  );

  return JSON.parse(decoder.decode(plaintext));
}

/**
 * Generate a secure random encryption key (for users without password)
 */
export async function generateRandomKey(): Promise<string> {
  const keyData = crypto.getRandomValues(new Uint8Array(32));
  return arrayBufferToBase64(keyData.buffer as ArrayBuffer);
}

/**
 * Hash data using SHA-256 (for checksums)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Generate a unique sync ID
 */
export function generateSyncId(): string {
  return crypto.randomUUID();
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}

/**
 * Encryption service class for convenient usage
 */
export class EncryptionService {
  private password: string | null = null;

  /**
   * Initialize encryption with a password
   */
  setPassword(password: string): void {
    this.password = password;
  }

  /**
   * Clear the stored password
   */
  clearPassword(): void {
    this.password = null;
  }

  /**
   * Check if encryption is ready
   */
  isReady(): boolean {
    return this.password !== null && isCryptoAvailable();
  }

  /**
   * Encrypt data using the stored password
   */
  async encrypt(data: object): Promise<EncryptedData> {
    if (!this.password) {
      throw new Error('Encryption password not set');
    }
    return encrypt(data, this.password);
  }

  /**
   * Decrypt data using the stored password
   */
  async decrypt<T>(encryptedData: EncryptedData): Promise<T> {
    if (!this.password) {
      throw new Error('Encryption password not set');
    }
    return decrypt<T>(encryptedData, this.password);
  }
}

// Singleton instance
export const encryptionService = new EncryptionService();
