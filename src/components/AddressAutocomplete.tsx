import { useEffect, useId, useRef, useState } from 'react';
import api from '../lib/api';

export interface AddressSuggestion {
  formatted: string;
  lat?: number;
  lon?: number;
  street?: string;
  district?: string;
  districtCode?: string;
  city?: string;
  cityCode?: string;
  state?: string;
  country?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
}

export const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing an address',
  className = '',
  disabled = false,
  required = false,
  id,
  name,
}: AddressAutocompleteProps) => {
  const generatedId = useId();
  const listId = `${generatedId}-address-options`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const handleOutsidePointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsidePointer);
    return () => document.removeEventListener('mousedown', handleOutsidePointer);
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (!isOpen || query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.get<AddressSuggestion[]>('/locations/autocomplete', {
          params: { q: query },
          signal: controller.signal,
        });
        setSuggestions(Array.isArray(response.data) ? response.data : []);
        setActiveIndex(-1);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('Address suggestions could not be loaded:', error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, value]);

  const chooseSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.formatted);
    onSelect?.(suggestion);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (!suggestions.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => current <= 0 ? suggestions.length - 1 : current - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      chooseSuggestion(suggestions[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen && (suggestions.length > 0 || isLoading)}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {isOpen && value.trim().length >= 3 && (isLoading || suggestions.length > 0) && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-[120] mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
          {isLoading && <li className="px-3 py-2 text-sm text-gray-500">Searching addresses...</li>}
          {!isLoading && suggestions.map((suggestion, index) => (
            <li key={`${suggestion.formatted}-${index}`} id={`${listId}-${index}`} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseSuggestion(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full px-3 py-2 text-left text-sm ${index === activeIndex ? 'bg-orange-50 text-slate-900' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="block">{suggestion.formatted}</span>
                {(suggestion.district || suggestion.city || suggestion.state) && (
                  <span className="mt-0.5 block text-xs text-gray-500">{[suggestion.district, suggestion.city, suggestion.state, suggestion.country].filter(Boolean).join(', ')}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
