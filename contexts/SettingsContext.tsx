
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { loadSettings, saveSettings } from '../utils/storageUtils';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  isConfigured: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy init settings
  const [settings, setSettings] = useState<Settings>(() => {
      const loaded = loadSettings();
      return loaded || DEFAULT_SETTINGS;
  });
  
  // Lazy init configuration status based on loaded settings
  const [isConfigured, setIsConfigured] = useState(() => !!settings.apiKey);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
    
    // Update configured state
    if (updated.apiKey) {
      setIsConfigured(true);
    } else {
      setIsConfigured(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
