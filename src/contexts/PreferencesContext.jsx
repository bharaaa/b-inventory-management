import { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  // Enforce light mode or respect user preference later
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <PreferencesContext.Provider value={{}}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
