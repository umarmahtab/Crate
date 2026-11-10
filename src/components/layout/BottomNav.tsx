import React from 'react';
import { Home, Library, Heart, BarChart3, Plus } from 'lucide-react';
import type { NavigationTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenAddModal,
}) => {
  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'library', label: 'Library', icon: <Library className="w-5 h-5" /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-5 h-5" /> },
    { id: 'statistics', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-slate-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom)] shadow-lg transition-colors">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                isActive ? 'text-[var(--accent)] font-bold' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-semibold">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-sm mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Floating Mobile Add Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="absolute -top-5 right-6 w-12 h-12 bg-[var(--accent)] hover:brightness-110 active:scale-95 text-neutral-950 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-neutral-900 transition-transform"
          aria-label="Add Game"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
