'use client';

import { useModelStore } from '@/stores/model-store';
import { useCallback } from 'react';

export interface ModelOption {
  id: string;
  label: string;
  requiresSubscription: boolean;
  description?: string;
  priority?: number;
  recommended?: boolean;
  capabilities?: string[];
  contextWindow?: number;
}

// All models are always accessible — the platform is free
const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'kidpen/basic',
    label: 'Basic',
    requiresSubscription: false,
    priority: 1,
    recommended: false,
    capabilities: [],
    contextWindow: 128000,
  },
  {
    id: 'kidpen/power',
    label: 'Power',
    requiresSubscription: false,
    priority: 2,
    recommended: true,
    capabilities: [],
    contextWindow: 128000,
  },
];

export const useModelSelection = () => {
  const { selectedModel, setSelectedModel } = useModelStore();

  const handleModelChange = useCallback((modelId: string) => {
    if (AVAILABLE_MODELS.some(m => m.id === modelId)) {
      setSelectedModel(modelId);
    }
  }, [setSelectedModel]);

  const canAccessModel = useCallback((_modelId: string) => true, []);
  const isSubscriptionRequired = useCallback((_modelId: string) => false, []);
  const getActualModelId = useCallback((modelId: string) => modelId, []);
  const refreshCustomModels = useCallback(() => {}, []);
  const addCustomModel = useCallback((_model: any) => {}, []);
  const updateCustomModel = useCallback((_id: string, _model: any) => {}, []);
  const removeCustomModel = useCallback((_id: string) => {}, []);

  return {
    selectedModel: selectedModel || AVAILABLE_MODELS[0].id,
    setSelectedModel: handleModelChange,
    availableModels: AVAILABLE_MODELS,
    allModels: AVAILABLE_MODELS,
    isLoading: false,
    modelsData: undefined,
    subscriptionStatus: 'active' as const,
    canAccessModel,
    isSubscriptionRequired,
    handleModelChange,
    customModels: [] as any[],
    addCustomModel,
    updateCustomModel,
    removeCustomModel,
    getActualModelId,
    refreshCustomModels,
  };
};

