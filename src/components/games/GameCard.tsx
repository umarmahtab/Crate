import React from 'react';
import type { Game } from '../../types';
import { GameCoverImage } from '../common/GameCoverImage';
import { StatusBadge, PlatformBadge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';
import { Clock, Plus, ExternalLink } from 'lucide-react';
import { formatPlaytime } from '../../utils/format';

interface GameCardProps {
  game: Game;
  playtimeMinutes?: number;
  onClick: () => void;
  onLogTime?: (e: React.MouseEvent, game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  playtimeMinutes = 0,
  onClick,
  onLogTime,
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
      className="group relative flex flex-col frosted-card rounded-2xl overflow-hidden cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative overflow-hidden">
        <GameCoverImage
          src={game.coverUrl}
          alt={game.title}
          aspectRatio="vertical"
          className="group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Ambient top & bottom gradient scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15 opacity-60 group-hover:opacity-45 transition-opacity pointer-events-none" />

        {/* Status overlay badge (top-left) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <StatusBadge status={game.status} size="xs" glow />
        </div>

        {/* Rating overlay badge if rated (top-right) */}
        {game.rating && game.rating > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10 backdrop-blur-md bg-black/75 border border-[var(--accent)]/40 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
            <RatingStars value={game.rating} readOnly size="sm" />
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-2 bottom-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-all duration-200 flex items-center justify-between gap-1.5 transform translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0">
          {onLogTime && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLogTime(e, game);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--accent)] hover:brightness-110 active:brightness-95 text-neutral-950 font-bold text-xs flex items-center gap-1 shadow-lg transition-transform active:scale-95"
              title="Log session"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Time</span>
            </button>
          )}

          <div className="ml-auto p-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg">
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-white/60 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-neutral-100 group-hover:text-[var(--accent)] transition-colors line-clamp-1 leading-snug">
            {game.title}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <PlatformBadge platform={game.selectedPlatform} size="sm" />
            {game.releaseDate && (
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                {game.releaseDate.split('-')[0]}
              </span>
            )}
          </div>
        </div>

        {/* Footer with Playtime */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            {playtimeMinutes > 0 ? (
              <span className="font-bold text-slate-700 dark:text-neutral-200">
                {formatPlaytime(playtimeMinutes)}
              </span>
            ) : (
              <span className="font-medium text-slate-400 dark:text-neutral-500">0m logged</span>
            )}
          </span>

          {game.genres && game.genres.length > 0 && (
            <span className="text-[10px] text-slate-400 dark:text-neutral-400 font-semibold truncate max-w-[90px] uppercase tracking-wider">
              {game.genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
