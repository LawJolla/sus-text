import React from 'react';
import { StatusIndicator } from './StatusIndicator.js';
import { MoreMenu } from './MoreMenu.js';
import { useConversationState } from '../hooks/useConversationState.js';
import { useOllamaModels } from '../hooks/useOllamaModels.js';

export const AiDiscussionToggle: React.FC = () => {
  const { conversationId, state, toggleActive, updatePersona, updateModel, getAIState } = useConversationState();

  const { models, isLoading: isLoadingModels } = useOllamaModels();

  if (!conversationId || !state) {
    return null;
  }

  const aiState = getAIState();

  return (
    <div
      className="
      flex items-center gap-3 
      px-3 py-1.5 
      bg-white border border-google-gray-200 rounded-2xl 
      font-google-sans text-sm whitespace-nowrap 
      shadow-sm
    ">
      {/* Toggle section */}
      <label
        className="
        flex items-center gap-1.5 
        cursor-pointer select-none m-0
      ">
        <input
          type="checkbox"
          checked={state.isActive}
          onChange={toggleActive}
          className="
            w-3.5 h-3.5 m-0 cursor-pointer 
            accent-google-blue 
            focus:ring-1 focus:ring-google-blue
          "
        />
        <span className="font-medium text-google-blue text-sm">Sus Text</span>
      </label>

      {/* Status indicator */}
      <StatusIndicator state={aiState} />

      {/* More menu */}
      <MoreMenu
        selectedPersona={state.selectedPersona}
        selectedModel={state.selectedModel}
        onPersonaChange={updatePersona}
        onModelChange={updateModel}
        models={models}
        isLoadingModels={isLoadingModels}
      />
    </div>
  );
};
