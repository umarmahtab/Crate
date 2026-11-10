import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppSettings, SortOption, ViewMode } from '../types';
import { RawgService } from '../services/rawg/rawgClient';

const SETTINGS_STORAGE_KEY = 'crate_settings';
const LEGACY_SETTINGS_STORAGE_KEY = 'savepoint_settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultView: 'grid',
  defaultSort: 'recent-added',
  rawgApiKey: '',
  accentColor: '#f59e0b',
  backgroundColor: undefined,
};

interface SettingsContextValue {
  settings: AppSettings;
  updateTheme: (theme: 'dark' | 'light') => void;
  updateDefaultView: (view: ViewMode) => void;
  updateDefaultSort: (sort: SortOption) => void;
  updateRawgApiKey: (key: string) => void;
  updateAccentColor: (color: string) => void;
  updateBackgroundColor: (color: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored =
        localStorage.getItem(SETTINGS_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          rawgApiKey: RawgService.getApiKey(),
        };
      }
    } catch {
      // Fallback
    }
    return {
      ...DEFAULT_SETTINGS,
      rawgApiKey: RawgService.getApiKey(),
    };
  });

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    root.style.setProperty('--accent', settings.accentColor || DEFAULT_SETTINGS.accentColor!);
    root.style.setProperty(
      '--bg-custom',
      settings.backgroundColor || (settings.theme === 'dark' ? '#0b0d13' : '#f8fafc')
    );
  }, [settings.theme, settings.accentColor, settings.backgroundColor]);

  // Persist settings changes
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      const payload = JSON.stringify({
        theme: newSettings.theme,
        defaultView: newSettings.defaultView,
        defaultSort: newSettings.defaultSort,
        accentColor: newSettings.accentColor,
        backgroundColor: newSettings.backgroundColor,
      });
      localStorage.setItem(SETTINGS_STORAGE_KEY, payload);
      localStorage.setItem(LEGACY_SETTINGS_STORAGE_KEY, payload);
    } catch {
      // Ignore local storage errors
    }
  };

  const updateTheme = (theme: 'dark' | 'light') => {
    saveSettings({ ...settings, theme });
  };

  const updateDefaultView = (defaultView: ViewMode) => {
    saveSettings({ ...settings, defaultView });
  };

  const updateDefaultSort = (defaultSort: SortOption) => {
    saveSettings({ ...settings, defaultSort });
  };

  const updateRawgApiKey = (key: string) => {
    RawgService.setApiKey(key);
    saveSettings({ ...settings, rawgApiKey: key.trim() });
  };

  const updateAccentColor = (accentColor: string) => {
    saveSettings({ ...settings, accentColor });
  };

  const updateBackgroundColor = (backgroundColor: string) => {
    saveSettings({ ...settings, backgroundColor });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateTheme,
        updateDefaultView,
        updateDefaultSort,
        updateRawgApiKey,
        updateAccentColor,
        updateBackgroundColor,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
