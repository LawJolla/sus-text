import React from 'react';
import { personas, getPersonaById } from '../constants/personas';

interface PersonaSelectProps {
  value: string;
  onChange: (personaId: string) => void;
  disabled?: boolean;
}

export const PersonaSelect: React.FC<PersonaSelectProps> = ({ value, onChange, disabled }) => {
  const selectedPersona = getPersonaById(value);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div>
      <div className="font-medium text-google-gray-600 text-xs uppercase tracking-wider mb-1.5">Persona</div>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`
          w-full px-1.5 py-1 
          border border-google-gray-300 rounded 
          text-xs bg-white text-google-gray-700 
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-1 focus:ring-google-blue focus:border-google-blue
        `}>
        {personas.map(persona => (
          <option key={persona.id} value={persona.id}>
            {persona.avatar} {persona.name}
          </option>
        ))}
      </select>
    </div>
  );
};
