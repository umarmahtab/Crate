import React from 'react';
import type { Game } from '../../types';
import { GameCoverImage } from '../common/GameCoverImage';
import { StatusBadge, PlatformBadge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';
import { Clock, ChevronRight } from 'lucide-react';
import { formatPlaytime } from '../../utils/format';

interface GameListItemProps {
  game: Game;
  playtimeMinutes?: number;
  onClick: () => void;
}

export const GameListItem: React.FC<GameListItemProps> = ({
  game,
  playtimeMinutes = 0,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group flex items-center justify-between gap-4 p-3 frosted-card hover:border-[var(--accent)]/50 rounded-2xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 shadow-sm"
    >
      {/* Left: Thumbnail & Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <GameCoverImage
            src={game.coverUrl}
            alt={game.title}
            aspectRatio="vertical"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        <div className="min-w-0">
          <h3 className="font-bold text-sm text-slate-900 dark:text-neutral-100 group-hover:text-[var(--accent)] transition-colors truncate">
            {game.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <PlatformBadge platform={game.selectedPlatform} size="sm" />
            {game.releaseDate && (
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                {game.releaseDate.split('-')[0]}
              </span>
            )}
            {game.genres && game.genres.length > 0 && (
              <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-neutral-400">
                • {game.genres.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Status, Rating, Playtime & Arrow */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="font-bold font-mono">{formatPlaytime(playtimeMinutes)}</span>
          </div>
          {game.rating && game.rating > 0 && (
            <RatingStars value={game.rating} readOnly size="sm" />
          )}
        </div>

        <StatusBadge status={game.status} size="sm" />

        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-neutral-400 group-hover:text-slate-800 dark:group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
};
