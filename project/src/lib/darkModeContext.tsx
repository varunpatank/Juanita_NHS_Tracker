import React, { createContext, useContext, useEffect } from 'react';

/**
 * The site is dark-only. This context is kept so the many `darkMode ? a : b`
 * expressions across the pages keep working - it just always answers true.
 */
type DarkModeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    localStorage.removeItem('darkMode');
  }, []);

  return (
    <DarkModeContext.Provider value={{ darkMode: true, toggleDarkMode: () => {} }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
