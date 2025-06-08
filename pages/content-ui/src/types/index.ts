// Types for AI Discussion
export interface Persona {
  id: string;
  name: string;
  avatar: string;
  prompt: string;
}

export interface ConversationState {
  isActive: boolean;
  lastProcessedMessageCount: number;
  conversationContext: Array<{ text: string; author: string; timestamp: number }>;
  isProcessingMessage: boolean;
  lastProcessedMessageTimestamp: number;
  selectedModel: string;
  selectedPersona: string;
}

export enum AIState {
  OFF = 'off',
  IDLE = 'idle',
  PROCESSING = 'processing',
}

export interface VoiceMessage {
  id: string;
  text: string;
  timestamp: number;
  read: boolean;
  deleted: boolean;
  author: string;
}

export interface VoiceData {
  number: string;
  messages: VoiceMessage[];
}

export type NotificationType = 'info' | 'warning' | 'error';
