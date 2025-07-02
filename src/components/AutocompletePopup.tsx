import React from 'react';

interface AutocompletePopupProps {
  suggestions: string[];
  activeIndex: number;
  onSelect: (suggestion: string) => void;
}

export const AutocompletePopup: React.FC<AutocompletePopupProps> = ({ suggestions, activeIndex, onSelect }) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full mb-2 w-[calc(100%-6rem)] bg-slate-600 border border-slate-500 rounded-lg shadow-xl z-50 overflow-hidden">
      <ul className="max-h-40 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <li
            key={suggestion}
            className={`px-4 py-2 cursor-pointer text-slate-200 text-sm ${
              index === activeIndex ? 'bg-sky-600' : 'hover:bg-slate-500'
            }`}
            onMouseDown={(e) => { // Usar onMouseDown para evitar que el textarea pierda el foco antes de que el clic se registre
              e.preventDefault();
              onSelect(suggestion);
            }}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};
