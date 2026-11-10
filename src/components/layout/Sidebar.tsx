import React from 'react';
import { Home, Library, Heart, BarChart3, Settings, Plus, ChevronLeft, ChevronRight, Gamepad2, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSettings } from '../../contexts/SettingsContext';

export type NavigationTab = 'home' | 'library' | 'wishlist' | 'statistics' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  onOpenAddModal,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { settings, updateTheme } = useSettings();
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5 shrink-0" /> },
    { id: 'library', label: 'My Library', icon: <Library className="w-5 h-5 shrink-0" /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-5 h-5 shrink-0" /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="w-5 h-5 shrink-0" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen sticky top-0 glass-strong border-r border-slate-200 dark:border-neutral-800 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Logo */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-neutral-800/80">
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-sm group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="brand-focus font-black text-base text-slate-900 dark:text-neutral-100 tracking-tight">
                  Cr<span className="brand-focus-accent">ate</span>
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-neutral-400 -mt-1 font-mono uppercase tracking-wider">
                  Game Tracker
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-slate-400 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Add Game Button */}
        <div className="p-4">
          <Button
            variant="primary"
            onClick={onOpenAddModal}
            className={`w-full ${isCollapsed ? 'px-0 justify-center' : ''}`}
            icon={<Plus className="w-4 h-4" />}
            title="Add new game"
          >
            {!isCollapsed && <span>Add Game</span>}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-98 ${
                  isActive
                    ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 shadow-sm'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800/80'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Theme Quick Switcher in Sidebar */}
      <div className="px-3 py-2 border-t border-slate-200 dark:border-neutral-800">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-1 rounded-2xl bg-slate-100 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => updateTheme('light')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all ${
                settings.theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => updateTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all ${
                settings.theme === 'dark'
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Dark</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => updateTheme(settings.theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--accent)]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-500 dark:text-neutral-400">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-neutral-300">Crate</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 font-mono text-slate-500 dark:text-neutral-400">v1.0</span>
          </div>
        ) : (
          <div className="text-center text-[10px] text-slate-400 dark:text-neutral-500 font-mono">v1.0</div>
        )}
      </div>
    </aside>
  );
};
