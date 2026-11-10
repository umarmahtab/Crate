import React, { useState, useEffect } from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AppLayout } from './components/layout/AppLayout';
import type { NavigationTab } from './components/layout/Sidebar';
import { HomePage } from './pages/Home/HomePage';
import { LibraryPage } from './pages/Library/LibraryPage';
import { WishlistPage } from './pages/Wishlist/WishlistPage';
import { StatisticsPage } from './pages/Statistics/StatisticsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { GameDetailPage } from './pages/GameDetails/GameDetailPage';
import { AddGameModal } from './components/games/AddGameModal';
import type { GameStatus } from './types';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [lastTab, setLastTab] = useState<NavigationTab>('home');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [libraryStatusFilter, setLibraryStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultStatus, setAddModalDefaultStatus] = useState<GameStatus>('backlog');

  // Handle URL hash changes for easy bookmarking and browser back/forward buttons
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash.startsWith('game/')) {
        const id = hash.replace('game/', '');
        setSelectedGameId(id);
      } else if (['home', 'library', 'wishlist', 'statistics', 'settings'].includes(hash)) {
        setCurrentTab(hash as NavigationTab);
        setLastTab(hash as NavigationTab);
        setSelectedGameId(null);
      } else if (!hash) {
        setCurrentTab('home');
        setLastTab('home');
        setSelectedGameId(null);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToTab = (tab: NavigationTab) => {
    setSelectedGameId(null);
    setCurrentTab(tab);
    setLastTab(tab);
    window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    window.location.hash = `#/game/${gameId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedGameId(null);
    const targetTab = lastTab || 'home';
    setCurrentTab(targetTab);
    window.location.hash = `#/${targetTab}`;
  };

  const handleOpenAddModal = (status: GameStatus = 'backlog') => {
    if (currentTab === 'wishlist') {
      setAddModalDefaultStatus('wishlist');
    } else {
      setAddModalDefaultStatus(status);
    }
    setIsAddModalOpen(true);
  };

  const handleNavigateToLibraryWithFilter = (statusFilter = 'all') => {
    setLibraryStatusFilter(statusFilter);
    navigateToTab('library');
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onNavigate={navigateToTab}
      onOpenAddModal={() => handleOpenAddModal()}
    >
      {selectedGameId ? (
        <GameDetailPage
          gameId={selectedGameId}
          onBack={handleBackFromDetail}
          onGameDeleted={() => {
            setSelectedGameId(null);
            window.location.hash = `#/${lastTab || 'home'}`;
          }}
        />
      ) : (
        <>
          {currentTab === 'home' && (
            <HomePage
              onSelectGame={handleSelectGame}
              onOpenAddModal={() => handleOpenAddModal('playing')}
              onNavigateToLibrary={handleNavigateToLibraryWithFilter}
            />
          )}

          {currentTab === 'library' && (
            <LibraryPage
              onSelectGame={handleSelectGame}
              onOpenAddModal={() => handleOpenAddModal('backlog')}
              initialStatusFilter={libraryStatusFilter}
            />
          )}

          {currentTab === 'wishlist' && (
            <WishlistPage
              onSelectGame={handleSelectGame}
              onOpenAddModal={() => handleOpenAddModal('wishlist')}
            />
          )}

          {currentTab === 'statistics' && (
            <StatisticsPage
              onSelectGame={handleSelectGame}
              onOpenAddModal={() => handleOpenAddModal('playing')}
            />
          )}

          {currentTab === 'settings' && <SettingsPage />}
        </>
      )}

      {/* Global Add Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultStatus={addModalDefaultStatus}
        onGameSaved={(_game) => {
          // If in detail view, stay or open
        }}
      />
    </AppLayout>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </SettingsProvider>
  );
}
