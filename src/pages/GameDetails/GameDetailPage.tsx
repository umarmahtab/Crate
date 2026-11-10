import React, { useState, useMemo } from 'react';
import type { GameStatus, PlaySession } from '../../types';
import { useGameDetails } from '../../hooks/useGames';
import { gameRepository } from '../../database/repositories/gameRepository';
import { sessionRepository } from '../../database/repositories/sessionRepository';
import { useToast } from '../../contexts/ToastContext';
import { GameCoverImage } from '../../components/common/GameCoverImage';
import { PlatformBadge } from '../../components/ui/Badge';
import { StatusSelect } from '../../components/ui/StatusSelect';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PlaySessionModal } from '../../components/games/PlaySessionModal';
import { AddGameModal } from '../../components/games/AddGameModal';
import { formatPlaytime, formatDate } from '../../utils/format';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Building,
  Tag,
  FileText,
  Pencil,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameDetailPageProps {
  gameId: string;
  onBack: () => void;
  onGameDeleted?: () => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({
  gameId,
  onBack,
  onGameDeleted,
}) => {
  const { game, sessions, totalPlaytimeMinutes, isLoading, notFound } = useGameDetails(gameId);
  const { success, error } = useToast();

  // Modals state
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<PlaySession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<PlaySession | null>(null);
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [isDeleteGameOpen, setIsDeleteGameOpen] = useState(false);

  // Compute average session length
  const averageSessionMinutes = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.round(totalPlaytimeMinutes / sessions.length);
  }, [sessions, totalPlaytimeMinutes]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 dark:bg-neutral-900 rounded-lg" />
        <div className="h-72 bg-slate-200 dark:bg-neutral-900 rounded-3xl" />
        <div className="h-48 bg-slate-200 dark:bg-neutral-900 rounded-3xl" />
      </div>
    );
  }

  if (notFound || !game) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">Game Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-neutral-400">
          This game entry might have been deleted or the link is invalid.
        </p>
        <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Library
        </Button>
      </div>
    );
  }

  // Handle status update
  const handleStatusChange = async (newStatus: GameStatus) => {
    try {
      await gameRepository.updateStatus(game.id, newStatus);
      if (newStatus === 'completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      success(`Status changed to ${newStatus}`);
    } catch {
      error('Failed to update status.');
    }
  };

  // Handle rating update
  const handleRatingChange = async (newRating: number | null) => {
    try {
      await gameRepository.update(game.id, { rating: newRating });
      success(newRating ? `Rated ${newRating}/5` : 'Rating removed');
    } catch {
      error('Failed to update rating.');
    }
  };

  // Handle delete game
  const handleDeleteGame = async () => {
    try {
      await gameRepository.delete(game.id);
      success(`Deleted "${game.title}" from library.`);
      setIsDeleteGameOpen(false);
      if (onGameDeleted) onGameDeleted();
      else onBack();
    } catch {
      error('Failed to delete game.');
    }
  };

  // Handle delete play session
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await sessionRepository.delete(sessionToDelete.id);
      success('Play session deleted.');
    } catch {
      error('Failed to delete play session.');
    } finally {
      setSessionToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-[var(--accent)] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Return to Library</span>
      </button>

      {/* Hero Overview Card */}
      <div className="relative overflow-hidden rounded-3xl frosted-card text-slate-900 dark:text-white shadow-xl">
        {/* Ambient backdrop image glow */}
        {game.coverUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 dark:opacity-30 blur-2xl pointer-events-none scale-115"
            style={{ backgroundImage: `url(${game.coverUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/50 dark:from-neutral-950 dark:via-neutral-950/80 dark:to-neutral-950/40 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Cover Box Art with drop shadow */}
          <div className="w-36 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-neutral-700/80 shadow-xl mx-auto md:mx-0">
            <GameCoverImage src={game.coverUrl} alt={game.title} aspectRatio="vertical" />
          </div>

          {/* Details */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <PlatformBadge platform={game.selectedPlatform} size="md" />
                  <select
                    value={game.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as any;
                      await handleStatusChange(newStatus);
                    }}
                    className="text-xs font-bold bg-white/70 dark:bg-neutral-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-slate-800 dark:text-neutral-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    title="Change game status"
                  >
                    <option value="playing">Currently Playing</option>
                    <option value="backlog">Backlog</option>
                    <option value="completed">Completed</option>
                    <option value="onhold">On Hold</option>
                    <option value="dropped">Dropped</option>
                    <option value="wishlist">Wishlist</option>
                  </select>
                  {game.releaseDate && (
                    <span className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1 font-mono font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {game.releaseDate.split('-')[0]}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {game.title}
                </h1>

                {game.developer && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                    <span>{game.developer}</span>
                    {game.publisher && <span>• {game.publisher}</span>}
                  </p>
                )}
              </div>

              {/* Actions: Edit & Delete buttons */}
              <div className="flex items-center gap-2 self-end sm:self-start">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditGameOpen(true)}
                  icon={<Edit className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteGameOpen(true)}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  title="Delete game from library"
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Rating & Playtime Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80 dark:border-white/10">
              {/* Personal Rating */}
              <div className="p-3.5 frosted-pill rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
                    Personal Rating
                  </span>
                  <div className="mt-1">
                    <RatingStars
                      value={game.rating}
                      onChange={handleRatingChange}
                      size="md"
                      showNumber
                      showLabel
                    />
                  </div>
                </div>
              </div>

              {/* Total Playtime card */}
              <div className="p-3.5 bg-slate-50 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
                    Recorded Playtime
                  </span>
                  <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block font-mono">
                    {formatPlaytime(totalPlaytimeMinutes)}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSessionToEdit(null);
                    setIsLogSessionOpen(true);
                  }}
                  icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                >
                  Log Time
                </Button>
              </div>
            </div>

            {/* Quick Status Pill Bar */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5 block">
                Update Status
              </span>
              <StatusSelect value={game.status} onChange={handleStatusChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Description & Quest Logbook */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Notes & Play Sessions Timeline */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Notes */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 dark:text-neutral-100 font-bold text-sm">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Player Notes</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditGameOpen(true)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit notes</span>
              </button>
            </div>
            {game.notes ? (
              <p className="text-sm text-slate-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                {game.notes}
              </p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-neutral-500 italic">
                No personal notes added yet. Jot down tips, boss fight strats, or milestone thoughts.
              </p>
            )}
          </div>

          {/* Game Description */}
          {game.description && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-200">About the Game</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                {game.description}
              </p>
            </div>
          )}

          {/* Play Sessions History ("Quest Journal") */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">Quest Logbook</h3>
                <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">({sessions.length} sessions)</span>
              </div>

              {sessions.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                  Average session: <span className="font-bold text-slate-800 dark:text-neutral-200 font-mono">{formatPlaytime(averageSessionMinutes)}</span>
                </div>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-neutral-500 space-y-2">
                <p>No play sessions recorded yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSessionToEdit(null);
                    setIsLogSessionOpen(true);
                  }}
                  className="text-amber-500 hover:text-amber-600 dark:text-amber-400 font-bold"
                >
                  Log your first gameplay session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="p-3.5 bg-slate-50 dark:bg-neutral-850 hover:bg-slate-100 dark:hover:bg-neutral-800/80 rounded-2xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-mono text-xs font-bold shrink-0 mt-0.5">
                        #{sessions.length - index}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-neutral-100 font-mono">
                            {formatPlaytime(session.durationMinutes)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-neutral-400">
                            • {formatDate(session.date)}
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-xs text-slate-600 dark:text-neutral-300 mt-1 line-clamp-2 italic">
                            "{session.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSessionToEdit(session);
                          setIsLogSessionOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit session"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSessionToDelete(session)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Game Metadata Specs */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-4 text-xs shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-neutral-100 pb-2 border-b border-slate-100 dark:border-neutral-800">
              Game Specs
            </h3>

            {/* Platform */}
            <div>
              <span className="text-slate-500 dark:text-neutral-400 block font-bold">Active Platform</span>
              <div className="mt-1">
                <PlatformBadge platform={game.selectedPlatform} size="md" />
              </div>
            </div>

            {/* Release Date */}
            {game.releaseDate && (
              <div>
                <span className="text-slate-500 dark:text-neutral-400 block font-bold">Release Date</span>
                <span className="font-bold text-slate-800 dark:text-neutral-200 mt-0.5 block font-mono">
                  {formatDate(game.releaseDate)}
                </span>
              </div>
            )}

            {/* Developer */}
            {game.developer && (
              <div>
                <span className="text-slate-500 dark:text-neutral-400 block font-bold">Developer</span>
                <span className="font-bold text-slate-800 dark:text-neutral-200 mt-0.5 block">
                  {game.developer}
                </span>
              </div>
            )}

            {/* Publisher */}
            {game.publisher && (
              <div>
                <span className="text-slate-500 dark:text-neutral-400 block font-bold">Publisher</span>
                <span className="font-bold text-slate-800 dark:text-neutral-200 mt-0.5 block">
                  {game.publisher}
                </span>
              </div>
            )}

            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div>
                <span className="text-slate-500 dark:text-neutral-400 block font-bold mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Genres</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {game.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-[11px] font-bold border border-slate-200 dark:border-neutral-700/60"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date Added */}
            <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
              <span className="text-slate-400 dark:text-neutral-500 block font-semibold">Added to Crate</span>
              <span className="text-slate-500 dark:text-neutral-400 mt-0.5 block font-mono text-[11px]">
                {formatDate(game.dateAdded)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Log / Edit Play Session Modal */}
      <PlaySessionModal
        isOpen={isLogSessionOpen}
        onClose={() => setIsLogSessionOpen(false)}
        gameId={game.id}
        gameTitle={game.title}
        sessionToEdit={sessionToEdit}
      />

      {/* Edit Game Modal */}
      <AddGameModal
        isOpen={isEditGameOpen}
        onClose={() => setIsEditGameOpen(false)}
        gameToEdit={game}
      />

      {/* Delete Game Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteGameOpen}
        onClose={() => setIsDeleteGameOpen(false)}
        onConfirm={handleDeleteGame}
        title="Delete Game"
        message={`Are you sure you want to delete "${game.title}"? All recorded play sessions for this game will be permanently removed.`}
        confirmLabel="Delete Game"
        isDestructive={true}
      />

      {/* Delete Session Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDeleteSession}
        title="Delete Session"
        message="Are you sure you want to delete this recorded play session?"
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
