import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@extension/ui';

interface ModelSelectProps {
  value: string;
  onChange: (modelId: string) => void;
  models: string[];
  isLoading: boolean;
  disabled?: boolean;
}

export const ModelSelect: React.FC<ModelSelectProps> = ({ value, onChange, models, isLoading, disabled }) => {
  const isSelectDisabled = disabled || isLoading || models.length === 0;

  return (
    <div>
      <div className="font-medium text-google-gray-600 text-xs uppercase tracking-wider mb-1.5">Model</div>
      <Select value={value} onValueChange={onChange} disabled={isSelectDisabled}>
        <SelectTrigger className="w-full px-1.5 py-1 border border-google-gray-300 rounded text-xs bg-white text-google-gray-700 focus:outline-none focus:ring-1 focus:ring-google-blue focus:border-google-blue">
          <SelectValue
            placeholder={
              isLoading ? 'Loading models...' : models.length === 0 ? 'No models available' : 'Select a model'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading models...
            </SelectItem>
          ) : models.length === 0 ? (
            <SelectItem value="no-models" disabled>
              No models available
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
    </div>
  );
};
