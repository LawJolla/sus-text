import React from 'react';
import { PersonaSelect } from './PersonaSelect.js';
import { ModelSelect } from './ModelSelect.js';
import { MoreVerticalIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu.js';

interface MoreMenuProps {
  selectedPersona: string;
  selectedModel: string;
  onPersonaChange: (personaId: string) => void;
  onModelChange: (modelId: string) => void;
  models: string[];
  isLoadingModels: boolean;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({
  selectedPersona,
  selectedModel,
  onPersonaChange,
  onModelChange,
  models,
  isLoadingModels,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="
            px-2 py-1 
            text-xs 
            font-google-sans cursor-pointer 
            transition-colors duration-200 
            outline-none 
            flex items-center gap-1
        -mr-2
          ">
          <MoreVerticalIcon className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="
          bg-white border border-google-gray-300 rounded-lg 
          shadow-lg min-w-[200px] 
          font-google-sans text-sm p-0
        ">
        {/* Persona section */}
        <div className="p-3 border-b border-google-gray-200">
          <PersonaSelect value={selectedPersona} onChange={onPersonaChange} />
        </div>

        {/* Model section */}
        <div className="p-3">
          <ModelSelect value={selectedModel} onChange={onModelChange} models={models} isLoading={isLoadingModels} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
