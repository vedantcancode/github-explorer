import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';

export function SearchBar({ value, onChange, onSuggestionClick }) {
  const [localQuery, setLocalQuery] = useState(value);

  // Sync internal state with prop (e.g. when suggestions are clicked or query reset)
  useEffect(() => {
    setLocalQuery(value);
  }, [value]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalQuery(val);
    onChange(val);
  };

  const handleClear = () => {
    setLocalQuery('');
    onChange('');
  };

  const suggestions = [
    { label: 'facebook/react', icon: '⚛️' },
    { label: 'tailwindlabs/tailwindcss', icon: '🎨' },
    { label: 'vercel/next.js', icon: '🚀' },
    { label: 'google/zx', icon: '🐚' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 animate-slide-up">
      {/* Search Input Box */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 group-focus-within:opacity-80"></div>
        
        <div className="relative flex items-center bg-gemini-card/85 border border-gemini-border rounded-full py-2 pl-5 pr-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-purple-500/20 glass-panel">
          <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          
          <input
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            placeholder="Enter a repository name or 'owner/repo'..."
            className="w-full bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 text-[15px] sm:text-base pr-4"
          />

          {localQuery && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-200 transition-colors mr-1"
              title="Clear search"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            className={`p-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${
              localQuery.trim()
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-purple-500/20 hover:scale-105'
                : 'bg-gray-800 text-gray-500'
            }`}
            disabled={!localQuery.trim()}
            title="Search"
            type="button"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1.5">
        <span className="text-[13px] text-gray-500 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Try exploring:
        </span>
        {suggestions.map((sug) => (
          <button
            key={sug.label}
            onClick={() => onSuggestionClick(sug.label)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-800/80 bg-gray-900/20 hover:bg-gray-900/60 hover:border-gray-700/80 hover:text-white text-[13px] text-gray-400 transition-all duration-200 hover:-translate-y-0.5"
            type="button"
          >
            <span>{sug.icon}</span>
            <span>{sug.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
