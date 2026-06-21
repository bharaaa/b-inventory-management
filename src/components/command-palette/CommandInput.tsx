import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
}

export function CommandInput({ value, onChange, isOpen }: CommandInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when palette opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small timeout to ensure transition doesn't steal focus
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <div className="flex items-center px-4 py-4 border-b border-[var(--border)]">
      <Search size={20} className="text-[var(--text-tertiary)] mr-3 flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search products, pages, or commands... (e.g. 'low stock')"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-lg"
        autoComplete="off"
        spellCheck="false"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-xs font-medium px-2 py-1 rounded bg-black/5 dark:bg-white/5"
        >
          Clear
        </button>
      )}
    </div>
  );
}
