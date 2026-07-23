import React, { createContext, useContext, useEffect, useState } from 'react';

const AppSettingsContext = createContext(null);

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

const STORAGE_KEY = 'hideBottomNavOnScroll';

export function AppSettingsProvider({ children }) {
  const [hideBottomNavOnScroll, setHideBottomNavOnScroll] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, hideBottomNavOnScroll ? 'true' : 'false');
    } catch {
      // ignore localStorage failures
    }
  }, [hideBottomNavOnScroll]);

  return (
    <AppSettingsContext.Provider value={{ hideBottomNavOnScroll, setHideBottomNavOnScroll }}>
      {children}
    </AppSettingsContext.Provider>
  );
}
