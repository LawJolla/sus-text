import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.js';
import { cn } from '../utils.js';

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  isLoading = false,
  placeholder = 'Select a model...',
  className,
}) => {
  return <div>ModelSelector</div>;
  return (
    <Select value={selectedModel} onValueChange={onModelChange} disabled={isLoading}>
      <SelectTrigger className={cn('w-[180px]', className)}>
        <SelectValue placeholder={isLoading ? 'Loading models...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {models.length === 0 ? (
          <SelectItem value="" disabled>
            {isLoading ? 'Loading...' : 'No models available'}
          </SelectItem>
        ) : (
          models.map(model => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
