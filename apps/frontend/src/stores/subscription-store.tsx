'use client';
import { create } from 'zustand';
import React from 'react';

interface SubscriptionState {
  data: { status: string } | null;
}

export const useSharedSubscription = create<SubscriptionState>(() => ({
  data: { status: 'active' },
}));

export function SubscriptionStoreSync({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
