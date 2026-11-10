import React, { useState, useMemo } from 'react';
import type { Game, GameStatus, SortOption, ViewMode } from '../../types';
import { useGames } from '../../hooks/useGames';
import { useSettings } from '../../contexts/SettingsContext';
import { GameCard } from '../../components/games/GameCard';
import { GameListItem } from '../../components/games/GameListItem';
import { PlaySessionModal } from '../../components/games/PlaySessionModal';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ALL_STATUSES, STATUS_CONFIGS, COMMON_PLATFORMS } from '../../utils/status';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Plus,
  Gamepad2,
  X,
  ArrowUpDown,
} from 'lucide-react';

interface LibraryPageProps {
  onSelectGame: (gameId: string) => void;
  onOpenAddModal: () => void;
  initialStatusFilter?: string;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onSelectGame,
  onOpenAddModal,
  initialStatusFilter = 'all',
}) => {
  const { settings, updateDefaultView } = useSettings();

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GameStatus>(
    (initialStatusFilter as 'all' | GameStatus) || 'all'
  );
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>(settings.defaultSort || 'recent-added');
  const [viewMode, setViewMode] = useState<ViewMode>(settings.defaultView || 'grid');
  const [sessionModalGame, setSessionModalGame] = useState<Game | null>(null);

  // Query games with filters
  const { games, totalCount, playtimes, userPlatforms, isLoading } = useGames({
    search,
    status: statusFilter,
    platform: platformFilter,
    sortBy,
  });

  // Combine dynamic platforms from database with common ones
  const availablePlatforms = useMemo(() => {
    const list = new Set<string>();
    userPlatforms.forEach((p) => list.add(p));
    COMMON_PLATFORMS.forEach((p) => list.add(p));
    return Array.from(list);
  }, [userPlatforms]);

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all' || platformFilter !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPlatformFilter('all');
  };

  const handleToggleView = (mode: ViewMode) => {
    setViewMode(mode);
    updateDefaultView(mode);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Controls: Search, View Toggle, Add Game */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, developers, genres..."
            className="w-full frosted-pill rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-4 h-4 absolute left-3 pointer-events-none text-slate-400 dark:text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="frosted-pill rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 cursor-pointer appearance-none shadow-sm"
            >
              <option value="recent-added">Recently Added</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="playtime-desc">Most Playtime</option>
              <option value="release-desc">Release Date</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center frosted-pill rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleToggleView('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-bold shadow-sm'
                  : 'text-slate-400 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleToggleView('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-bold shadow-sm'
                  : 'text-slate-400 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onOpenAddModal}
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            Add Game
          </Button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-200/80 dark:border-white/10">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              statusFilter === 'all'
                ? 'bg-[var(--accent)] text-neutral-950 font-black shadow-sm'
                : 'frosted-pill text-slate-700 dark:text-neutral-300 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            All Games ({totalCount})
          </button>

          {ALL_STATUSES.map((status) => {
            const config = STATUS_CONFIGS[status];
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={isSelected ? { boxShadow: `0 0 12px ${config.glowColor}` } : {}}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm ${
                  isSelected
                    ? `${config.badgeBg} ${config.badgeText} ${config.badgeBorder} border`
                    : 'frosted-pill text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                <span>{config.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Platform Dropdown Filter & Clear Filters */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="relative">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="frosted-pill rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 cursor-pointer shadow-sm"
            >
              <option value="all">All Platforms</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Library Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="aspect-[3/4] bg-slate-200 dark:bg-neutral-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : games.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={<Filter className="w-6 h-6 text-amber-500" />}
            title="No matching games found"
            description="No games matched your current search and filter criteria. Try clearing some filters or searching for something else."
            actionLabel="Reset Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <EmptyState
            icon={<Gamepad2 className="w-7 h-7 text-amber-500" />}
            title="Your library is currently empty"
            description="Search the game database to add games you own, or enter them manually."
            actionLabel="Add a Game"
            onAction={onOpenAddModal}
          />
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              playtimeMinutes={playtimes[game.id] || 0}
              onClick={() => onSelectGame(game.id)}
              onLogTime={(_, g) => setSessionModalGame(g)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {games.map((game) => (
            <GameListItem
              key={game.id}
              game={game}
              playtimeMinutes={playtimes[game.id] || 0}
              onClick={() => onSelectGame(game.id)}
            />
          ))}
        </div>
      )}

      {/* Quick Play Session Modal from Card Action */}
      {sessionModalGame && (
        <PlaySessionModal
          isOpen={Boolean(sessionModalGame)}
          onClose={() => setSessionModalGame(null)}
          gameId={sessionModalGame.id}
          gameTitle={sessionModalGame.title}
        />
      )}
    </div>
  );
};
