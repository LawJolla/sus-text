import type { ConversationState } from '../types';
import { getDefaultPersona } from '../constants/personas';

// Conversation-specific state management
const conversationStates = new Map<string, ConversationState>();

// Get current conversation ID from URL
export const getCurrentConversationId = (): string | null => {
  const url = new URL(window.location.href);
  const itemId = url.searchParams.get('itemId');
  if (itemId) {
    // Clean up the itemId (remove URL encoding)
    return decodeURIComponent(itemId);
  }
  return null;
};

// Get or create conversation state
export const getConversationState = (conversationId: string, availableModels: string[] = []): ConversationState => {
  if (!conversationStates.has(conversationId)) {
    conversationStates.set(conversationId, {
      isActive: false,
      lastProcessedMessageCount: 0,
      conversationContext: [],
      isProcessingMessage: false,
      lastProcessedMessageTimestamp: 0,
      selectedModel: availableModels.length > 0 ? availableModels[1] : 'deepseek-r1:7b',
      selectedPersona: getDefaultPersona().id,
    });
  }
  return conversationStates.get(conversationId)!;
};

// Update conversation state
export const updateConversationState = (
  conversationId: string,
  updates: Partial<ConversationState>,
): ConversationState => {
  const state = getConversationState(conversationId);
  Object.assign(state, updates);
  conversationStates.set(conversationId, state);
  return state;
};

// Get all conversation states (for debugging or cleanup)
export const getAllConversationStates = () => {
  return conversationStates;
};

// Persist persona choice to localStorage
export const persistPersonaChoice = (conversationId: string, personaId: string) => {
  const persistedChoices = JSON.parse(localStorage.getItem('ai-discussion-persona-choices') || '{}');
  persistedChoices[conversationId] = personaId;
  localStorage.setItem('ai-discussion-persona-choices', JSON.stringify(persistedChoices));
};

// Persist model choice to localStorage
export const persistModelChoice = (conversationId: string, modelId: string) => {
  const persistedChoices = JSON.parse(localStorage.getItem('ai-discussion-model-choices') || '{}');
  persistedChoices[conversationId] = modelId;
  localStorage.setItem('ai-discussion-model-choices', JSON.stringify(persistedChoices));
};

// Load persisted persona choice
export const loadPersistedPersonaChoice = (conversationId: string): string | null => {
  const persistedChoices = JSON.parse(localStorage.getItem('ai-discussion-persona-choices') || '{}');
  return persistedChoices[conversationId] || null;
};

// Load persisted model choice
export const loadPersistedModelChoice = (conversationId: string): string | null => {
  const persistedChoices = JSON.parse(localStorage.getItem('ai-discussion-model-choices') || '{}');
  return persistedChoices[conversationId] || null;
};
