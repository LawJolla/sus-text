import { useState, useEffect } from 'react';
import { queryAvailableModels, getAvailableModels, getIsLoadingModels } from '../services/ollamaService';

export const useOllamaModels = () => {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize models
  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const availableModels = await queryAvailableModels();
        setModels(availableModels);
      } catch (err) {
        console.error('Failed to load models:', err);
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        setIsLoading(false);
      }
    };

    // Check if models are already loaded
    const cachedModels = getAvailableModels();
    const isCurrentlyLoading = getIsLoadingModels();

    if (cachedModels.length > 0) {
      setModels(cachedModels);
    } else if (!isCurrentlyLoading) {
      loadModels();
    } else {
      setIsLoading(true);
      // Poll for loading completion
      const interval = setInterval(() => {
        const loadingState = getIsLoadingModels();
        if (!loadingState) {
          clearInterval(interval);
          setIsLoading(false);
          setModels(getAvailableModels());
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, []);

  const refreshModels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const availableModels = await queryAvailableModels();
      setModels(availableModels);
    } catch (err) {
      console.error('Failed to refresh models:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh models');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    models,
    isLoading,
    error,
    refreshModels,
  };
};
