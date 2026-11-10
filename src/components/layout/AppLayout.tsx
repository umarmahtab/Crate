import React, { useState } from 'react';
import { Sidebar, type NavigationTab } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onNavigate,
  onOpenAddModal,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="app-shell min-h-screen flex bg-transparent text-slate-900 dark:text-neutral-100 selection:bg-amber-500 selection:text-neutral-950 transition-colors duration-150">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={onNavigate}
        onOpenAddModal={onOpenAddModal}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
        <Header
          currentTab={currentTab}
          onNavigate={onNavigate}
          onOpenAddModal={onOpenAddModal}
        />
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={onNavigate}
        onOpenAddModal={onOpenAddModal}
      />
    </div>
  );
};
