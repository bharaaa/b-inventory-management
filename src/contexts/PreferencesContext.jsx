import { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  // Refraction State
  const [enableRefraction, setEnableRefraction] = useState(() => {
    const saved = localStorage.getItem('crate-prefs-refraction');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Theme State (default to 'dark' to preserve current aesthetic)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('crate-prefs-theme');
    return savedTheme ? savedTheme : 'dark';
  });

  const toggleRefraction = () => {
    setEnableRefraction(prev => !prev);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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

  // Theme Effect
  useEffect(() => {
    localStorage.setItem('crate-prefs-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <PreferencesContext.Provider value={{ enableRefraction, toggleRefraction, theme, toggleTheme }}>
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
