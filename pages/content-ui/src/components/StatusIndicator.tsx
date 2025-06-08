import React from 'react';
import { AIState } from '../types';

interface StatusIndicatorProps {
  state: AIState;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state, className }) => {
  const getStatusColor = () => {
    switch (state) {
      case AIState.OFF:
        return 'bg-google-red'; // #ea4335
      case AIState.IDLE:
        return 'bg-google-green'; // #34a853
      case AIState.PROCESSING:
        return 'bg-google-blue'; // #1a73e8
      default:
        return 'bg-google-red';
    }
  };

  const getStatusClasses = () => {
    const baseClasses = 'w-1.5 h-1.5 rounded-full shrink-0';
    const colorClass = getStatusColor();

    if (state === AIState.PROCESSING) {
      return `${baseClasses} ${colorClass} animate-ai-pulse`;
    }

    return `${baseClasses} ${colorClass}`;
  };

  return (
    <div
      className={`${getStatusClasses()} ${state === AIState.PROCESSING ? 'ai-pulse' : ''} ${className || ''}`}
      title={`AI Status: ${state.toUpperCase()}`}
    />
  );
};
