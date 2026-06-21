import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CommandItemProps {
  id: string;
  title: string;
  icon?: React.ElementType;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'default';
  };
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
}

export function CommandItem({ id, title, icon: Icon, subtitle, badge, isActive, onSelect, onHover }: CommandItemProps) {
  const itemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll into view if active
  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isActive]);

  return (
    <button
      ref={itemRef}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 ${
        isActive 
          ? 'bg-[var(--accent)]/10 text-[var(--accent)] dark:bg-[var(--accent)]/20' 
          : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
      }`}
      role="option"
      aria-selected={isActive}
    >
      {Icon && (
        <div className={`flex-shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}>
          <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
        </div>
      )}
      
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-sm truncate ${isActive ? 'font-medium text-[var(--text-primary)]' : 'font-medium'}`}>
          {title}
        </span>
        {subtitle && (
          <span className={`text-xs truncate ${isActive ? 'text-[var(--accent)]/70' : 'text-[var(--text-tertiary)]'}`}>
            {subtitle}
          </span>
        )}
      </div>

      {badge && (
        <div className="flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            badge.variant === 'success' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
            badge.variant === 'error' ? 'bg-[var(--error)]/10 text-[var(--error)]' :
            badge.variant === 'warning' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' :
            'bg-black/5 dark:bg-white/5 text-[var(--text-tertiary)]'
          }`}>
            {badge.text}
          </span>
        </div>
      )}

      {/* Render Enter key hint if active */}
      {isActive && (
        <div className="flex-shrink-0 ml-2 hidden sm:block">
          <kbd className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-sans font-medium text-[var(--accent)] bg-[var(--accent)]/10 rounded-md">
            ↵
          </kbd>
        </div>
      )}
    </button>
  );
}
