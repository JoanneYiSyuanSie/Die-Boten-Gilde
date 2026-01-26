
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "---", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger - styled to match the original select input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="custom-select-trigger w-full text-left p-2 md:p-3 bg-white/20 border-b-2 border-[#2c1810] outline-none font-body text-base md:text-lg focus:border-[#8a1c1c] transition-all cursor-pointer flex justify-between items-center group"
      >
        <span className={`${!selectedOption ? "opacity-50" : ""} truncate mr-2 text-[#2c1810]`}>
            {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icons.ChevronDown className={`w-4 h-4 text-[#2c1810] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} opacity-60 group-hover:opacity-100`} />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="custom-select-dropdown absolute top-full left-0 w-full z-50 bg-[#f3e5ab] border-x-2 border-b-2 border-t-0 border-[#2c1810] shadow-[0_10px_20px_rgba(0,0,0,0.3)] max-h-60 overflow-y-auto rounded-b-sm animate-in fade-in zoom-in-95 duration-100 scrollbar-hide">
          {options.length === 0 ? (
              <div className="p-4 opacity-50 italic text-sm text-[#2c1810] text-center">No options</div>
          ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left p-3 text-sm md:text-base transition-colors flex items-center justify-between
                    custom-select-option border-b border-[#2c1810]/10 last:border-0 text-[#2c1810]
                    ${option.value === value ? 'selected font-bold bg-[#2c1810]/5' : ''}
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                      <Icons.Check className="w-4 h-4 shrink-0 ml-2" />
                  )}
                </button>
              ))
          )}
        </div>
      )}
    </div>
  );
};
