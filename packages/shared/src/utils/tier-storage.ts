/**
 * Tier Storage Utility for kidpen.space
 * Persists and retrieves tier assignment decisions
 */

import type { InferenceTier, TierStorageData, TierAssignment } from '../types/device';

const STORAGE_KEY = 'kidpen_tier_decision';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function persistTierDecision(
  assignment: TierAssignment,
  ttlMs: number = DEFAULT_TTL_MS,
  userOverride: boolean = false
): void {
  const now = Date.now();
  
  const storageData: TierStorageData = {
    tier: assignment.tier,
    assignedAt: now,
    expiresAt: now + ttlMs,
    userOverride,
    modelConfig: assignment.modelConfig,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Failed to persist tier decision:', error);
  }
}

export function getPersistedTierDecision(): TierStorageData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: TierStorageData = JSON.parse(stored);

    if (Date.now() > data.expiresAt) {
      clearTierDecision();
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to retrieve tier decision:', error);
    return null;
  }
}

export function clearTierDecision(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear tier decision:', error);
  }
}

export function isTierDecisionValid(): boolean {
  const decision = getPersistedTierDecision();
  return decision !== null && !isExpired(decision);
}

function isExpired(data: TierStorageData): boolean {
  return Date.now() > data.expiresAt;
}

export function getRemainingTTL(): number {
  const decision = getPersistedTierDecision();
  if (!decision) return 0;
  
  const remaining = decision.expiresAt - Date.now();
  return Math.max(0, remaining);
}

export interface DiagnosticsInfo {
  hasStoredDecision: boolean;
  storedTier: InferenceTier | null;
  assignedAt: number | null;
  expiresAt: number | null;
  isExpired: boolean;
  remainingTTLMs: number;
  isUserOverride: boolean;
}

export function diagnostics(): DiagnosticsInfo {
  const decision = getPersistedTierDecision();

  if (!decision) {
    return {
      hasStoredDecision: false,
      storedTier: null,
      assignedAt: null,
      expiresAt: null,
      isExpired: true,
      remainingTTLMs: 0,
      isUserOverride: false,
    };
  }

  return {
    hasStoredDecision: true,
    storedTier: decision.tier,
    assignedAt: decision.assignedAt,
    expiresAt: decision.expiresAt,
    isExpired: isExpired(decision),
    remainingTTLMs: Math.max(0, decision.expiresAt - Date.now()),
    isUserOverride: decision.userOverride,
  };
}

export async function refreshTierDecision(): Promise<TierStorageData | null> {
  clearTierDecision();
  return getPersistedTierDecision();
}