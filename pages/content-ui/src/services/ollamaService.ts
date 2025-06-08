import type { NotificationType } from '../types';
import { getPersonaById, getDefaultPersona } from '../constants/personas';

// Global state for available models
let availableModels: string[] = [];
let isLoadingModels = false;

// Test background script connection
export const testBackgroundConnection = async (): Promise<boolean> => {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CONNECTION_TEST' });
    console.log('✅ Background script connection successful');
    return true;
  } catch (error: unknown) {
    console.error('❌ Background script connection failed:', error);

    // Check for extension context invalidation
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('Extension context invalidated') ||
      chrome.runtime.lastError?.message?.includes('context invalidated') ||
      errorMessage.includes('Could not establish connection')
    ) {
      console.error('🔄 Extension context invalidated - extension was likely reloaded');
      showUserNotification('Extension was reloaded. Refreshing page to reconnect...', 'warning');

      // Auto-refresh after a short delay to allow user to see the message
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      return false;
    }

    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
    }
    return false;
  }
};

// Show user notification
export const showUserNotification = (message: string, type: NotificationType = 'info') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'Google Sans', Roboto, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    background: ${type === 'error' ? '#ea4335' : type === 'warning' ? '#fbbc04' : '#34a853'};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 300px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;

  notification.textContent = message;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
};

// Query available models from Ollama
export const queryAvailableModels = async (): Promise<string[]> => {
  if (isLoadingModels) {
    console.log('⏳ Already loading models, returning cached result:', availableModels);
    return availableModels;
  }

  isLoadingModels = true;

  try {
    console.log('🔍 Querying available models from Ollama...');

    const response = await chrome.runtime.sendMessage({
      type: 'OLLAMA_API_REQUEST',
      url: 'http://localhost:11434/api/ps',
      options: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    console.log('📡 Raw Ollama API response:', response);

    if (response && response.success && response.data) {
      console.log('📊 Response data structure:', response.data);

      if (response.data.models) {
        const models = response.data.models.map((model: any) => {
          console.log('🏷️ Processing model:', model);
          return model.name;
        });
        availableModels = models;
        console.log('✅ Available models loaded:', models);
        return models;
      } else {
        console.warn('⚠️ No models array in response data:', response.data);
        availableModels = [];
        return [];
      }
    } else {
      console.error('❌ Failed to query models. Response:', response);
      availableModels = [];
      return [];
    }
  } catch (error) {
    console.error('❌ Error querying models:', error);
    availableModels = [];
    return [];
  } finally {
    isLoadingModels = false;
    console.log('🏁 Model loading finished. Final availableModels:', availableModels);
  }
};

// Get available models (cached)
export const getAvailableModels = (): string[] => {
  return availableModels;
};

// Check if models are currently loading
export const getIsLoadingModels = (): boolean => {
  return isLoadingModels;
};

// Parse thinking tokens and technical artifacts out of LLM response
export const cleanResponseText = (response: string): string => {
  if (!response) return response;

  // Remove thinking tokens in angle brackets (e.g., <think>...</think>, <token>...</token>)
  let cleaned = response.replace(/<[^>]*>[\s\S]*?<\/[^>]*>/g, '');

  // Also remove any standalone opening/closing tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Remove structured formatting markers like ---, Final Response:, etc.
  cleaned = cleaned.replace(/---+/g, '');
  cleaned = cleaned.replace(/Final Response:\s*/gi, '');
  cleaned = cleaned.replace(/Here's a.*?response.*?:/gi, '');
  cleaned = cleaned.replace(/Certainly!\s*/gi, '');
  cleaned = cleaned.replace(/Sure!\s*/gi, '');

  // Only remove obvious technical prefixes that might slip through
  // (Keep this minimal since we've fixed the prompt)
  cleaned = cleaned.replace(/^Margaret[\s:]+/gi, '');

  // Split by common separators and take the first substantial response
  const lines = cleaned.split(/\n+/);

  // Find the first line that looks like a direct response (not meta-commentary)
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.toLowerCase().includes('response') &&
      !trimmed.toLowerCase().includes('strategy') &&
      !trimmed.toLowerCase().includes('based on') &&
      !trimmed.toLowerCase().includes('structured') &&
      trimmed.length > 3 // Even shorter threshold since we trust the prompt more
    ) {
      return trimmed;
    }
  }

  // Fallback: just clean and return first substantial line
  const fallback = cleaned.trim().split('\n')[0];
  return fallback || cleaned.trim();
};

// Send message to background script for LLM processing
export const sendToLLM = async (
  newMessage: { text: string; author: string },
  context: Array<{ text: string; author: string; timestamp: number }>,
  conversationId: string,
  selectedModel: string,
  selectedPersonaId: string,
): Promise<string | null> => {
  try {
    // Test connection first
    const connectionOk = await testBackgroundConnection();
    if (!connectionOk) {
      console.error('Cannot connect to background script. Extension may not be loaded properly.');

      // If it's a context invalidation, the notification is already shown by testBackgroundConnection
      // For other connection issues, show a different message
      const lastError = chrome.runtime.lastError?.message || '';
      if (!lastError.includes('context invalidated')) {
        showUserNotification(
          'Cannot connect to background script. Make sure Ollama is running and the extension is loaded.',
          'error',
        );
      }

      return null;
    }

    const selectedPersona = getPersonaById(selectedPersonaId) || getDefaultPersona();

    // Prepare conversation history for LLM
    const conversationHistory = context.map(msg => `${msg.author}: ${msg.text}`).join('\n');

    const prompt = `${selectedPersona.prompt}

Conversation so far:
${conversationHistory}

New message: "${newMessage.author}: ${newMessage.text}"

Respond as ${selectedPersona.name} would - just the text message content, no name prefix or labels. Keep it natural and brief like a real text message.`;

    console.log('🚀 Sending LLM request to background script...');
    console.log('🤖 Using model:', selectedModel);
    console.log('🎭 Using persona:', selectedPersona.name, selectedPersona.avatar);

    // Send to background script
    const response = await chrome.runtime.sendMessage({
      type: 'OLLAMA_API_REQUEST',
      url: 'http://localhost:11434/api/generate',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          stream: false,
        }),
      },
    });

    if (response && response.success && response.data && response.data.response) {
      const rawResponse = response.data.response;
      console.log('✅ Raw LLM response received:', rawResponse);

      // Clean thinking tokens and name prefixes from the response
      const cleanedResponse = cleanResponseText(rawResponse);
      console.log('🧹 Cleaned response (thinking tokens and prefixes removed):', cleanedResponse);

      return cleanedResponse.trim();
    } else {
      console.error('❌ LLM request failed:', response);
      showUserNotification('AI response failed. Check if Ollama is running and the model is available.', 'error');
      return null;
    }
  } catch (error: unknown) {
    console.error('❌ Error sending message to LLM:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('Could not establish connection')
    ) {
      // Context invalidation notification and auto-refresh already handled by testBackgroundConnection
      return null;
    }

    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
    }

    showUserNotification('Error communicating with AI service. Please try again.', 'error');
    return null;
  }
};
