/**
 * Tier Assignment Utility for kidpen.space
 * Determines which inference tier a device should use based on capabilities
 */

import type { DeviceCapabilities, InferenceTier, TierAssignment, InferenceConfig } from '../types/device';
import { INFERENCE_CONFIGS, TIER_THRESHOLDS } from '../types/device';

export function selectInferenceTier(capabilities: DeviceCapabilities): TierAssignment {
  const { memoryMB, storageMB, cpuCores, hasWebGPU, isMobile, isLowPower, supportsWebLLM } = capabilities;

  if (isLowPower) {
    return createAssignment(InferenceTier.CLOUD, 'Low-power mobile device', 'high');
  }

  if (memoryMB >= TIER_THRESHOLDS.EDGE_MIN_MEMORY_MB &&
      storageMB >= TIER_THRESHOLDS.EDGE_MIN_STORAGE_MB &&
      cpuCores >= TIER_THRESHOLDS.EDGE_MIN_CPU_CORES &&
      hasWebGPU &&
      supportsWebLLM) {
    return createAssignment(InferenceTier.EDGE, 'High-capability device with WebGPU support', 'high');
  }

  if (memoryMB >= TIER_THRESHOLDS.HYBRID_MIN_MEMORY_MB &&
      storageMB >= TIER_THRESHOLDS.HYBRID_MIN_STORAGE_MB &&
      hasWebGPU &&
      supportsWebLLM) {
    return createAssignment(InferenceTier.HYBRID, 'Mid-range device capable of local inference with cloud fallback', 'medium');
  }

  if (isMobile) {
    return createAssignment(InferenceTier.CLOUD, 'Mobile device with limited resources', 'high');
  }

  return createAssignment(InferenceTier.CLOUD, 'Default to cloud inference for reliability', 'high');
}

function createAssignment(tier: InferenceTier, reason: string, confidence: 'low' | 'medium' | 'high'): TierAssignment {
  return {
    tier,
    reason,
    confidence,
    modelConfig: INFERENCE_CONFIGS[tier],
  };
}

export function getInferenceTierForModel(modelId: string): InferenceTier {
  if (modelId.includes('Phi-3') || modelId.includes('phi-3')) {
    return InferenceTier.EDGE;
  }
  if (modelId.includes('Qwen2.5-0.5') || modelId.includes('qwen-0.5')) {
    return InferenceTier.HYBRID;
  }
  return InferenceTier.CLOUD;
}

export function validateTierAssignment(
  assignment: TierAssignment,
  capabilities: DeviceCapabilities
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const { tier, modelConfig } = assignment;

  if (tier === InferenceTier.EDGE) {
    if (capabilities.memoryMB < TIER_THRESHOLDS.EDGE_MIN_MEMORY_MB) {
      warnings.push(`EDGE tier requires ${TIER_THRESHOLDS.EDGE_MIN_MEMORY_MB}MB memory, but only ${capabilities.memoryMB}MB detected`);
    }
    if (!capabilities.hasWebGPU) {
      warnings.push('EDGE tier requires WebGPU support which is not available');
    }
  }

  if (tier === InferenceTier.HYBRID) {
    if (capabilities.memoryMB < TIER_THRESHOLDS.HYBRID_MIN_MEMORY_MB) {
      warnings.push(`HYBRID tier requires ${TIER_THRESHOLDS.HYBRID_MIN_MEMORY_MB}MB memory, but only ${capabilities.memoryMB}MB detected`);
    }
  }

  if (!modelConfig.fallbackAvailable && tier !== InferenceTier.CLOUD) {
    warnings.push(`${tier} tier does not have cloud fallback configured`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

export function getRecommendedTierPriority(capabilities: DeviceCapabilities): InferenceTier[] {
  const tiers: InferenceTier[] = [];

  if (capabilities.isLowPower) {
    return [InferenceTier.CLOUD];
  }

  if (capabilities.memoryMB >= TIER_THRESHOLDS.EDGE_MIN_MEMORY_MB && capabilities.hasWebGPU) {
    tiers.push(InferenceTier.EDGE);
  }

  if (capabilities.memoryMB >= TIER_THRESHOLDS.HYBRID_MIN_MEMORY_MB) {
    tiers.push(InferenceTier.HYBRID);
  }

  tiers.push(InferenceTier.CLOUD);

  return tiers;
}

export function estimateLoadTime(tier: InferenceTier, networkSpeed: 'slow' | 'medium' | 'fast'): string {
  const configs: Record<InferenceTier, Record<string, string>> = {
    [InferenceTier.CLOUD]: {
      slow: '3-5 seconds',
      medium: '1-2 seconds',
      fast: '<1 second',
    },
    [InferenceTier.HYBRID]: {
      slow: '5-10 minutes',
      medium: '2-3 minutes',
      fast: '30-60 seconds',
    },
    [InferenceTier.EDGE]: {
      slow: '15-30 minutes',
      medium: '5-10 minutes',
      fast: '2-3 minutes',
    },
  };

  return configs[tier][networkSpeed];
}