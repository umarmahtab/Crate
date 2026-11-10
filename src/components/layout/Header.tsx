import React from 'react';
import { Settings, Sun, Moon, Gamepad2, Plus } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import type { NavigationTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenAddModal,
}) => {
  const { settings, updateTheme } = useSettings();

  const getPageTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'Dashboard';
      case 'library':
        return 'Game Library';
      case 'wishlist':
        return 'My Wishlist';
      case 'statistics':
        return 'Gaming Statistics';
      case 'settings':
        return 'Application Settings';
      default:
        return 'Crate';
    }
  };

  return (
    <header className="h-16 px-4 sm:px-8 glass-strong sticky top-0 z-20 flex items-center justify-between transition-colors">
      {/* Left: Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile brand icon */}
        <div
          onClick={() => onNavigate('home')}
          className="md:hidden flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <span className="brand-focus font-black text-sm text-slate-900 dark:text-neutral-100 tracking-tight">
            Cr<span className="brand-focus-accent">ate</span>
          </span>
        </div>

        {/* Desktop Breadcrumb/Title */}
        <h1 className="hidden md:block font-bold text-lg text-slate-900 dark:text-neutral-100 tracking-tight">
          <span className="brand-focus">{getPageTitle()}</span>
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add Button (desktop & mobile) */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent)] hover:brightness-110 active:brightness-95 text-neutral-950 font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Game</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => updateTheme(settings.theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800/80 transition-colors"
          title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[var(--accent)]" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={`p-2 rounded-xl transition-colors ${
            currentTab === 'settings'
              ? 'bg-[var(--accent)]/20 text-[var(--accent)] font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800/80'
          }`}
          title="Open Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
