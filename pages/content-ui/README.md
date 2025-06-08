# Sus Text Content UI

This directory contains the refactored React components for the Sus Text AI Discussion feature, previously implemented as a single large content script.

## Architecture

The code has been refactored into a modular React architecture with the following structure:

### Components (`src/components/`)
- **`AiDiscussionToggle`** - Main toggle component that orchestrates the entire UI
- **`StatusIndicator`** - Visual indicator showing AI state (off/idle/processing)
- **`MoreMenu`** - Dropdown menu containing persona and model selection
- **`PersonaSelect`** - Dropdown for selecting AI personas
- **`ModelSelect`** - Dropdown for selecting Ollama models

### Services (`src/services/`)
- **`conversationService`** - Manages conversation state and persistence
- **`ollamaService`** - Handles communication with Ollama API via background script
- **`messageService`** - Handles Google Voice message parsing and posting
- **`messageProcessor`** - Processes new messages and triggers AI responses

### Hooks (`src/hooks/`)
- **`useConversationState`** - Manages conversation state and provides actions
- **`useOllamaModels`** - Manages Ollama model loading and caching
- **`useMessageMonitor`** - Monitors DOM for new messages and triggers processing

### Types (`src/types/`)
- Comprehensive TypeScript interfaces for all data structures

### Constants (`src/constants/`)
- **`personas`** - AI persona definitions and utilities

## Key Features

1. **Modular Architecture** - Each component has a single responsibility
2. **React Hooks** - Custom hooks manage complex state and side effects
3. **TypeScript** - Full type safety throughout the codebase
4. **Service Layer** - Clean separation between UI and business logic
5. **State Management** - Centralized conversation state with persistence
6. **Real-time Monitoring** - Automatic detection of new messages
7. **Error Handling** - Comprehensive error handling and user notifications

## How It Works

1. **Initialization** - The `App` component detects Google Voice conversations and shows the toggle
2. **State Management** - `useConversationState` manages per-conversation state
3. **Model Loading** - `useOllamaModels` loads available models from Ollama
4. **Message Monitoring** - `useMessageMonitor` watches for new messages in the DOM
5. **AI Processing** - When activated, new messages trigger AI responses via the message processor
6. **Response Generation** - The Ollama service generates responses using selected persona and model
7. **Message Posting** - Responses are posted back to Google Voice with realistic typing delays

## Migration from Content Script

The original content script (`pages/content/src/index.ts`) has been completely refactored into this React-based architecture. Key improvements:

- **Better Separation of Concerns** - UI, state, and business logic are clearly separated
- **Improved Testability** - Each component and service can be tested independently
- **Enhanced Maintainability** - Modular structure makes it easier to modify and extend
- **Type Safety** - Full TypeScript coverage prevents runtime errors
- **React Benefits** - Leverages React's component lifecycle and state management

## Usage

The content UI is automatically injected into Google Voice pages when a conversation is detected. Users can:

1. Toggle AI Discussion on/off
2. Select different AI personas
3. Choose from available Ollama models
4. Monitor AI status via the status indicator

The UI integrates seamlessly with Google Voice's existing interface and maintains the same functionality as the original content script while providing a much cleaner and more maintainable codebase. 