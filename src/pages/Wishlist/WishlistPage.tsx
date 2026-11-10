import React, { useState } from 'react';
import type { Game } from '../../types';
import { useGames } from '../../hooks/useGames';
import { gameRepository } from '../../database/repositories/gameRepository';
import { useToast } from '../../contexts/ToastContext';
import { GameCard } from '../../components/games/GameCard';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Heart, Plus, Play, BookmarkCheck, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WishlistPageProps {
  onSelectGame: (gameId: string) => void;
  onOpenAddModal: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onSelectGame,
  onOpenAddModal,
}) => {
  const { games, isLoading } = useGames({ status: 'wishlist' });
  const { success, error } = useToast();

  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);

  const handleMoveToBacklog = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    try {
      await gameRepository.updateStatus(game.id, 'backlog');
      success(`Moved "${game.title}" to Backlog.`);
    } catch {
      error('Failed to move game.');
    }
  };

  const handleStartPlaying = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    try {
      await gameRepository.updateStatus(game.id, 'playing');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      success(`Started playing "${game.title}"!`);
    } catch {
      error('Failed to move game.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!gameToDelete) return;
    try {
      await gameRepository.delete(gameToDelete.id);
      success(`Removed "${gameToDelete.title}" from Wishlist.`);
    } catch {
      error('Failed to remove game.');
    } finally {
      setGameToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs tracking-wider uppercase">
            <Heart className="w-4 h-4 fill-purple-500/20" />
            <span>Future Adventures</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight mt-1">
            Gaming Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
            Games you're planning to buy, download, or play down the road.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onOpenAddModal}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          Add to Wishlist
        </Button>
      </div>

      {/* Grid or Empty */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[3/4] bg-slate-200 dark:bg-neutral-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-7 h-7 text-purple-500" />}
          title="Your wishlist is empty"
          description="Find upcoming releases or classic games you wish to play in the future and save them here."
          actionLabel="Add a Game to Wishlist"
          onAction={onOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {games.map((game) => (
            <div key={game.id} className="relative group/card flex flex-col">
              <GameCard
                game={game}
                playtimeMinutes={0}
                onClick={() => onSelectGame(game.id)}
              />

              {/* Quick Action Overlay Controls on card hover */}
              <div className="mt-2 flex items-center justify-between gap-1.5 px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleMoveToBacklog(e, game)}
                    className="p-1.5 rounded-xl frosted-pill hover:bg-blue-500/15 text-slate-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[11px] font-bold flex items-center gap-1 shadow-sm"
                    title="Move to Backlog"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span className="hidden sm:inline">Backlog</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleStartPlaying(e, game)}
                    className="p-1.5 rounded-xl frosted-pill hover:bg-emerald-500/15 text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-[11px] font-bold flex items-center gap-1 shadow-sm"
                    title="Start Playing"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Play</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGameToDelete(game);
                  }}
                  className="p-1.5 rounded-xl frosted-pill hover:bg-rose-500/15 text-slate-400 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-sm"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(gameToDelete)}
        onClose={() => setGameToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove from Wishlist"
        message={`Are you sure you want to remove "${gameToDelete?.title}" from your wishlist?`}
        confirmLabel="Remove"
        isDestructive={true}
      />
    </div>
  );
};
