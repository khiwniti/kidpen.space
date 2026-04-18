/**
 * Device Detection Utility for kidpen.space
 * Detects device capabilities to enable adaptive inference tier selection
 */

import type { DeviceCapabilities } from '../types/device';

export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  const [
    memoryInfo,
    storageInfo,
    hasWebGPU,
    hasIndexedDB,
    hasServiceWorker,
    cpuCores,
    isMobile,
  ] = await Promise.all([
    detectMemory(),
    detectStorage(),
    detectWebGPU(),
    detectIndexedDB(),
    detectServiceWorker(),
    detectCPUCores(),
    detectIsMobile(),
  ]);

  const hasWebLLM = hasWebGPU && memoryInfo >= 2048;

  return {
    memoryMB: memoryInfo,
    storageMB: storageInfo,
    hasWebGPU,
    hasIndexedDB,
    hasServiceWorker,
    cpuCores,
    isMobile,
    isLowPower: isMobile && memoryInfo < 4096,
    supportsWebLLM: hasWebLLM,
  };
}

async function detectMemory(): Promise<number> {
  if ('deviceMemory' in navigator) {
    return (navigator as Navigator & { deviceMemory: number }).deviceMemory * 1024;
  }

  if ('memory' in performance) {
    const memInfo = (performance as Performance & { memory?: { jsHeapSizeLimit: number } }).memory;
    if (memInfo) {
      return Math.round(memInfo.jsHeapSizeLimit / (1024 * 1024));
    }
  }

  return 2048;
}

async function detectStorage(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const totalBytes = estimate.quota || 0;
      return Math.round(totalBytes / (1024 * 1024));
    } catch {
      return 512;
    }
  }
  return 512;
}

async function detectWebGPU(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return false;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (renderer.includes('SwiftShader') || renderer.includes('llvmpipe')) {
        return false;
      }
    }

    if ('gpu' in navigator) {
      const gpu = (navigator as Navigator & { gpu: { requestAdapter: () => Promise<unknown> } }).gpu;
      const adapter = await gpu.requestAdapter();
      return adapter !== null;
    }

    return true;
  } catch {
    return false;
  }
}

async function detectIndexedDB(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;

  try {
    const testDB = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('__test_db__');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('test')) {
          db.createObjectStore('test');
        }
      };
    });

    testDB.close();

    await new Promise<void>((resolve, reject) => {
      const deleteReq = indexedDB.deleteDatabase('__test_db__');
      deleteReq.onsuccess = () => resolve();
      deleteReq.onerror = () => reject(deleteReq.error);
    });

    return true;
  } catch {
    return false;
  }
}

async function detectServiceWorker(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  return 'serviceWorker' in navigator;
}

function detectCPUCores(): number {
  if (navigator.hardwareConcurrency) {
    return navigator.hardwareConcurrency;
  }
  return 4;
}

function detectIsMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  const mobileKeywords = ['Android', 'iPhone', 'iPad', 'iPod', 'Mobile', 'webOS', 'BlackBerry', 'Windows Phone'];
  
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return isMobileUA || isSmallScreen;
}

export function detectFeatureSupport(): Record<string, boolean> {
  return {
    webgpu: typeof navigator !== 'undefined' && 'gpu' in navigator,
    webassembly: typeof WebAssembly !== 'undefined',
    indexeddb: typeof indexedDB !== 'undefined',
    serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    webllm: typeof navigator !== 'undefined' && 'gpu' in navigator,
    pushNotifications: typeof Notification !== 'undefined',
    bluetooth: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
  };
}