import { useState, useEffect } from 'react';

const RECENT_COMMANDS_KEY = 'crate_recent_commands';

export function useRecentItems() {
  const [recentCommandIds, setRecentCommandIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
      if (stored) {
        setRecentCommandIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to parse recent commands', error);
    }
  }, []);

  const addRecentCommand = (id: string) => {
    setRecentCommandIds(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(item => item !== id);
      const updated = [id, ...filtered].slice(0, 5); // Keep top 5
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentCommands = () => {
    setRecentCommandIds([]);
    localStorage.removeItem(RECENT_COMMANDS_KEY);
  };

  return {
    recentCommandIds,
    addRecentCommand,
    clearRecentCommands
  };
}
