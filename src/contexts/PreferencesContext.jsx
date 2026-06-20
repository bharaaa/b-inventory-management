import { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  // Refraction State
  const [enableRefraction, setEnableRefraction] = useState(() => {
    const saved = localStorage.getItem('crate-prefs-refraction');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleRefraction = () => {
    setEnableRefraction(prev => !prev);
  };

  // Refraction Effect
  useEffect(() => {
    localStorage.setItem('crate-prefs-refraction', JSON.stringify(enableRefraction));
    if (!enableRefraction) {
      document.body.classList.add('disable-refraction');
    } else {
      document.body.classList.remove('disable-refraction');
    }
  }, [enableRefraction]);

  // Permanently enforce dark mode on html tag (if any straggling CSS depends on it)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <PreferencesContext.Provider value={{ enableRefraction, toggleRefraction }}>
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
