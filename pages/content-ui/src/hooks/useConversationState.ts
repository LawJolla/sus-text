import { useState, useEffect, useCallback } from 'react';
import type { ConversationState } from '../types';
import { AIState } from '../types';
import {
  getCurrentConversationId,
  getConversationState,
  updateConversationState,
  persistPersonaChoice,
  persistModelChoice,
  loadPersistedPersonaChoice,
  loadPersistedModelChoice,
} from '../services/conversationService';
import { initializeConversationContext } from '../services/messageProcessor';
import { getPersonaById, getDefaultPersona } from '../constants/personas';

export const useConversationState = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [state, setState] = useState<ConversationState | null>(null);

  // Initialize conversation state
  useEffect(() => {
    const currentId = getCurrentConversationId();
    setConversationId(currentId);

    if (currentId) {
      const currentState = getConversationState(currentId);
      setState(currentState);

      // Load persisted choices
      const persistedPersona = loadPersistedPersonaChoice(currentId);
      const persistedModel = loadPersistedModelChoice(currentId);

      if (persistedPersona && getPersonaById(persistedPersona)) {
        currentState.selectedPersona = persistedPersona;
      }

      if (persistedModel) {
        currentState.selectedModel = persistedModel;
      }

      setState({ ...currentState });
    }
  }, []);

  // Monitor URL changes for conversation switching
  useEffect(() => {
    const handleUrlChange = () => {
      const newId = getCurrentConversationId();
      if (newId !== conversationId) {
        setConversationId(newId);
        if (newId) {
          const newState = getConversationState(newId);
          setState(newState);
        } else {
          setState(null);
        }
      }
    };

    const interval = setInterval(handleUrlChange, 1000);
    return () => clearInterval(interval);
  }, [conversationId]);

  // Update state helper
  const updateState = useCallback(
    (updates: Partial<ConversationState>) => {
      if (!conversationId) return;

      const updatedState = updateConversationState(conversationId, updates);
      setState({ ...updatedState });
    },
    [conversationId],
  );

  // Toggle AI activation
  const toggleActive = useCallback(async () => {
    if (!state || !conversationId) return;

    const newActiveState = !state.isActive;
    updateState({ isActive: newActiveState });

    if (newActiveState) {
      console.log('🟢 AI Discussion activated for conversation:', conversationId);
      // Initialize conversation context and check for immediate response
      await initializeConversationContext(conversationId);
    } else {
      console.log('🔴 AI Discussion deactivated for conversation:', conversationId);
    }
  }, [state, conversationId, updateState]);

  // Update selected persona
  const updatePersona = useCallback(
    (personaId: string) => {
      if (!conversationId) return;

      updateState({ selectedPersona: personaId });
      persistPersonaChoice(conversationId, personaId);
    },
    [conversationId, updateState],
  );

  // Update selected model
  const updateModel = useCallback(
    (modelId: string) => {
      if (!conversationId) return;

      updateState({ selectedModel: modelId });
      persistModelChoice(conversationId, modelId);
    },
    [conversationId, updateState],
  );

  // Get current AI state
  const getAIState = useCallback((): AIState => {
    if (!state) return AIState.OFF;

    if (!state.isActive) {
      return AIState.OFF;
    } else if (state.isProcessingMessage) {
      return AIState.PROCESSING;
    } else {
      return AIState.IDLE;
    }
  }, [state]);

  return {
    conversationId,
    state,
    updateState,
    toggleActive,
    updatePersona,
    updateModel,
    getAIState,
  };
};
