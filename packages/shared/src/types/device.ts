/**
 * Device Detection Types for kidpen.space
 * Defines device capabilities and inference tier assignment
 */

export enum InferenceTier {
  CLOUD = 'cloud',
  HYBRID = 'hybrid',
  EDGE = 'edge',
}

export interface DeviceCapabilities {
  memoryMB: number;
  storageMB: number;
  hasWebGPU: boolean;
  hasIndexedDB: boolean;
  hasServiceWorker: boolean;
  cpuCores: number;
  isMobile: boolean;
  isLowPower: boolean;
  supportsWebLLM: boolean;
}

export interface TierAssignment {
  tier: InferenceTier;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  modelConfig: InferenceConfig;
}

export interface InferenceConfig {
  tier: InferenceTier;
  modelName: string;
  modelSize: string;
  quantization: string;
  maxContextLength: number;
  expectedTokensPerSecond: number;
  fallbackAvailable: boolean;
}

export interface TierStorageData {
  tier: InferenceTier;
  assignedAt: number;
  expiresAt: number;
  userOverride: boolean;
  modelConfig?: InferenceConfig;
}

export const INFERENCE_CONFIGS: Record<InferenceTier, InferenceConfig> = {
  [InferenceTier.CLOUD]: {
    tier: InferenceTier.CLOUD,
    modelName: 'Qwen2.5-7B-Instruct',
    modelSize: '~7B parameters',
    quantization: 'FP16',
    maxContextLength: 32768,
    expectedTokensPerSecond: 100,
    fallbackAvailable: false,
  },
  [InferenceTier.HYBRID]: {
    tier: InferenceTier.HYBRID,
    modelName: 'Qwen2.5-0.5B-INT4',
    modelSize: '~400MB',
    quantization: 'INT4',
    maxContextLength: 8192,
    expectedTokensPerSecond: 15,
    fallbackAvailable: true,
  },
  [InferenceTier.EDGE]: {
    tier: InferenceTier.EDGE,
    modelName: 'Phi-3-mini-INT4',
    modelSize: '~2.2GB',
    quantization: 'INT4',
    maxContextLength: 4096,
    expectedTokensPerSecond: 10,
    fallbackAvailable: true,
  },
};

export const TIER_THRESHOLDS = {
  EDGE_MIN_MEMORY_MB: 8192,
  HYBRID_MIN_MEMORY_MB: 4096,
  EDGE_MIN_STORAGE_MB: 2560,
  HYBRID_MIN_STORAGE_MB: 500,
  EDGE_MIN_CPU_CORES: 4,
} as const;