'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  detectDeviceCapabilities,
  selectInferenceTier,
  persistTierDecision,
  getPersistedTierDecision,
  clearTierDecision,
  diagnostics,
} from '@kidpen/shared/utils';
import type { InferenceTier, DeviceCapabilities, TierAssignment, DiagnosticsInfo } from '@kidpen/shared/types/device';

export interface UseDeviceTierReturn {
  capabilities: DeviceCapabilities | null;
  assignment: TierAssignment | null;
  tier: InferenceTier | null;
  isLoading: boolean;
  error: string | null;
  diagnostics: DiagnosticsInfo;
  refresh: () => Promise<void>;
  setTier: (tier: InferenceTier) => void;
  clearTier: () => void;
}

export function useDeviceTier(): UseDeviceTierReturn {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [assignment, setAssignment] = useState<TierAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectAndAssignTier = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const persisted = getPersistedTierDecision();

      if (persisted) {
        setAssignment({
          tier: persisted.tier,
          reason: 'Restored from storage',
          confidence: 'high',
          modelConfig: persisted.modelConfig,
        });
        setCapabilities(null);
        return;
      }

      const detectedCapabilities = await detectDeviceCapabilities();
      const tierAssignment = selectInferenceTier(detectedCapabilities);

      setCapabilities(detectedCapabilities);
      setAssignment(tierAssignment);
      persistTierDecision(tierAssignment);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to detect device capabilities';
      setError(message);
      console.error('Device tier detection failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    detectAndAssignTier();
  }, [detectAndAssignTier]);

  const setTier = useCallback((tier: InferenceTier) => {
    const { INFERENCE_CONFIGS } = require('@kidpen/shared/types/device');

    const newAssignment: TierAssignment = {
      tier,
      reason: 'User override',
      confidence: 'high',
      modelConfig: INFERENCE_CONFIGS[tier],
    };

    setAssignment(newAssignment);
    persistTierDecision(newAssignment, 7 * 24 * 60 * 60 * 1000, true);
  }, []);

  const clearTier = useCallback(() => {
    clearTierDecision();
    detectAndAssignTier();
  }, [detectAndAssignTier]);

  const refresh = useCallback(async () => {
    clearTierDecision();
    await detectAndAssignTier();
  }, [detectAndAssignTier]);

  return {
    capabilities,
    assignment,
    tier: assignment?.tier ?? null,
    isLoading,
    error,
    diagnostics: diagnostics(),
    refresh,
    setTier,
    clearTier,
  };
}

export function useTierInfo(): {
  tier: InferenceTier;
  modelName: string;
  loadTimeEstimate: string;
  isEdge: boolean;
  isHybrid: boolean;
  isCloud: boolean;
} {
  const { assignment } = useDeviceTier();

  if (!assignment) {
    return {
      tier: InferenceTier.CLOUD,
      modelName: 'Loading...',
      loadTimeEstimate: 'Unknown',
      isEdge: false,
      isHybrid: false,
      isCloud: true,
    };
  }

  const { tier, modelConfig } = assignment;

  return {
    tier,
    modelName: modelConfig?.modelName ?? 'Unknown',
    loadTimeEstimate: estimateLoadTimeDisplay(tier),
    isEdge: tier === InferenceTier.EDGE,
    isHybrid: tier === InferenceTier.HYBRID,
    isCloud: tier === InferenceTier.CLOUD,
  };
}

function estimateLoadTimeDisplay(tier: InferenceTier): string {
  if (typeof navigator === 'undefined') return 'Unknown';

  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  const effectiveType = connection?.effectiveType ?? '4g';

  const estimates: Record<InferenceTier, Record<string, string>> = {
    [InferenceTier.CLOUD]: {
      'slow-2g': '5-10 seconds',
      '2g': '3-5 seconds',
      '3g': '2-3 seconds',
      '4g': '<1 second',
    },
    [InferenceTier.HYBRID]: {
      'slow-2g': '10-15 minutes',
      '2g': '5-10 minutes',
      '3g': '2-5 minutes',
      '4g': '30-60 seconds',
    },
    [InferenceTier.EDGE]: {
      'slow-2g': '30-60 minutes',
      '2g': '15-30 minutes',
      '3g': '5-10 minutes',
      '4g': '2-3 minutes',
    },
  };

  return estimates[tier][effectiveType] ?? estimates[tier]['4g'];
}