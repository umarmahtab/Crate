import React, { useMemo, useState } from 'react';
import type { Game, PlaySession } from '../../types';
import { useGames } from '../../hooks/useGames';
import { GameCard } from '../../components/games/GameCard';
import { GameCoverImage } from '../../components/common/GameCoverImage';
import { PlaySessionModal } from '../../components/games/PlaySessionModal';
import { PlatformBadge } from '../../components/ui/Badge';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';
import { RankIcon } from '../../components/common/RankIcon';
import { formatPlaytime, formatRelativeTime, getGamerRank } from '../../utils/format';
import { gameRepository } from '../../database/repositories/gameRepository';
import { useToast } from '../../contexts/ToastContext';
import {
  Gamepad2,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  Trophy,
  History,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomePageProps {
  onSelectGame: (gameId: string) => void;
  onOpenAddModal: () => void;
  onNavigateToLibrary: (statusFilter?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectGame,
  onOpenAddModal,
  onNavigateToLibrary,
}) => {
  const { games, playtimes, allSessions, isLoading } = useGames();
  const { success, error } = useToast();

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [sessionModalGame, setSessionModalGame] = useState<Game | null>(null);

  // Summary stats
  const totalGames = games.length;
  const currentlyPlayingGames = useMemo(
    () => games.filter((g) => g.status === 'playing'),
    [games]
  );
  const completedGames = useMemo(
    () => games.filter((g) => g.status === 'completed'),
    [games]
  );
  const backlogGames = useMemo(
    () => games.filter((g) => g.status === 'backlog'),
    [games]
  );

  const totalPlaytimeMinutes = useMemo(
    () => Object.values(playtimes).reduce((sum, m) => sum + m, 0),
    [playtimes]
  );

  // Gamer Rank calculation
  const gamerRank = useMemo(
    () => getGamerRank(totalPlaytimeMinutes, completedGames.length),
    [totalPlaytimeMinutes, completedGames.length]
  );

  // Completion rate percentage
  const completionRate = totalGames > 0 ? Math.round((completedGames.length / totalGames) * 100) : 0;

  // Selected hero game
  const heroGame = currentlyPlayingGames[activeHeroIndex] || currentlyPlayingGames[0] || games[0] || null;

  // Recently added (up to 4)
  const recentlyAddedGames = useMemo(() => {
    return [...games]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 4);
  }, [games]);

  // Recent play sessions with corresponding game metadata
  const recentSessionsWithGame = useMemo(() => {
    if (!allSessions || allSessions.length === 0) return [];
    const gamesMap = new Map(games.map((g) => [g.id, g]));
    const sorted = [...allSessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sorted
      .slice(0, 6)
      .map((s) => ({
        session: s,
        game: gamesMap.get(s.gameId),
      }))
      .filter((item): item is { session: PlaySession; game: Game } => item.game !== undefined);
  }, [allSessions, games]);

  // Handle quick complete from hero banner
  const handleHeroComplete = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    try {
      await gameRepository.updateStatus(game.id, 'completed');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      success(`Congratulations! "${game.title}" marked as Completed!`);
    } catch {
      error('Failed to update status.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-72 bg-slate-200 dark:bg-neutral-900 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-neutral-900 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* SECTION 1: HERO SPOTLIGHT (Cinematic Gaming Marquee) */}
      {heroGame ? (
        <div className="relative overflow-hidden rounded-3xl frosted-card text-slate-900 dark:text-white shadow-xl group">
          {/* Ambient blurred backdrop artwork */}
          {heroGame.coverUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15 dark:opacity-30 blur-2xl scale-110 pointer-events-none transition-all duration-700 group-hover:scale-115 group-hover:opacity-25 dark:group-hover:opacity-35"
              style={{ backgroundImage: `url(${heroGame.coverUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent dark:from-neutral-950 dark:via-neutral-950/85 dark:to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-neutral-950 dark:via-transparent dark:to-transparent pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left: Box Art & Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 max-w-2xl">
              <div
                onClick={() => onSelectGame(heroGame.id)}
                className="w-28 sm:w-36 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-neutral-700/80 shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <GameCoverImage src={heroGame.coverUrl} alt={heroGame.title} aspectRatio="vertical" />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                    <span>CURRENTLY PLAYING</span>
                  </span>
                  <PlatformBadge platform={heroGame.selectedPlatform} />
                </div>

                <h1
                  onClick={() => onSelectGame(heroGame.id)}
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  {heroGame.title}
                </h1>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-neutral-300 font-medium flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-[var(--accent)] font-mono">
                    <Clock className="w-4 h-4" />
                    <span>{formatPlaytime(playtimes[heroGame.id] || 0)} Logged</span>
                  </span>

                  {heroGame.rating && (
                    <div className="flex items-center gap-1">
                      <RatingStars value={heroGame.rating} readOnly size="sm" />
                    </div>
                  )}

                  {heroGame.genres && heroGame.genres.length > 0 && (
                    <span className="text-slate-400 dark:text-neutral-400 font-normal">
                      • {heroGame.genres.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>

                {/* Hero Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setSessionModalGame(heroGame)}
                    icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                  >
                    Log Play Session
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={(e) => handleHeroComplete(e, heroGame)}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
                  >
                    Mark Completed
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Multiple Playing Games Switcher */}
            {currentlyPlayingGames.length > 1 && (
              <div className="flex md:flex-col gap-2 items-center frosted-pill p-2 rounded-2xl self-stretch md:self-auto justify-center shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 px-1 hidden md:block">
                  Active ({currentlyPlayingGames.length})
                </span>
                <div className="flex md:flex-col gap-2">
                  {currentlyPlayingGames.map((g, idx) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActiveHeroIndex(idx)}
                      className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        idx === activeHeroIndex
                          ? 'border-[var(--accent)] scale-105 shadow-sm'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title={g.title}
                    >
                      <GameCoverImage src={g.coverUrl} alt={g.title} aspectRatio="square" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Intro Banner when no game is active */
        <div className="relative overflow-hidden rounded-3xl frosted-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Crate Ready</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight">
                Your Personal Video Game Headquarters
              </h1>
              <p className="text-sm text-slate-600 dark:text-neutral-400 max-w-lg">
                Track every game, log your playtime, and keep your entire gaming library offline-first and private.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onOpenAddModal}
              icon={<Plus className="w-5 h-5 stroke-[2.5]" />}
            >
              Add First Game
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 2: GAMER PROFILE & SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gamer Rank Card */}
        <div className="p-5 rounded-3xl frosted-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Gamer Rank</span>
              </span>
              <div className="w-7 h-7 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-sm">
                <RankIcon iconKey={gamerRank.iconKey} size="sm" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-neutral-100 mt-2 tracking-tight">
              Level {gamerRank.level}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-neutral-300 block">{gamerRank.title}</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-neutral-400 mb-1">
              <span>Next Rank</span>
              <span className="font-bold text-[var(--accent)] font-mono">{gamerRank.progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                style={{ width: `${gamerRank.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Playtime */}
        <div className="p-5 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              Recorded Time
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 mt-2 font-mono">
              {formatPlaytime(totalPlaytimeMinutes)}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 block">
              Across {allSessions.length} recorded session{allSessions.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Library Completion Meter */}
        <div
          onClick={() => onNavigateToLibrary('completed')}
          className="p-5 rounded-3xl frosted-card hover:border-[var(--accent)]/50 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 mt-2 font-mono">
              {completionRate}%
            </div>
            <span className="text-[11px] text-[var(--accent)] mt-1 block font-semibold">
              {completedGames.length} of {totalGames} games finished
            </span>
          </div>
        </div>

        {/* Backlog Count */}
        <div
          onClick={() => onNavigateToLibrary('backlog')}
          className="p-5 rounded-3xl frosted-card hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              Backlog Queue
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 mt-2 font-mono">
              {backlogGames.length}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400/80 mt-1 block font-semibold">Games awaiting playthrough</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: RECENT ACTIVITY LOG */}
      {recentSessionsWithGame.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">Recent Activity</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToLibrary('all')}
              className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSessionsWithGame.map(({ session, game }) => (
              <div
                key={session.id}
                onClick={() => onSelectGame(game.id)}
                className="p-3.5 frosted-card rounded-2xl cursor-pointer flex items-center gap-3.5 group"
              >
                <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-white/10 shadow-sm">
                  <GameCoverImage src={game.coverUrl} alt={game.title} aspectRatio="vertical" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100 truncate group-hover:text-[var(--accent)] transition-colors">
                    {game.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-bold text-[var(--accent)] font-mono">
                      +{formatPlaytime(session.durationMinutes)}
                    </span>
                    <span className="text-slate-300 dark:text-neutral-600">•</span>
                    <span className="text-slate-500 dark:text-neutral-400 text-[11px]">
                      {formatRelativeTime(session.date)}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-1 italic">
                      "{session.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: CURRENTLY PLAYING GRID */}
      {currentlyPlayingGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">Active Playthroughs</h2>
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                ({currentlyPlayingGames.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToLibrary('playing')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {currentlyPlayingGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                playtimeMinutes={playtimes[game.id] || 0}
                onClick={() => onSelectGame(game.id)}
                onLogTime={(_, g) => setSessionModalGame(g)}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: RECENTLY ADDED */}
      {recentlyAddedGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">Recently Added to Library</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToLibrary('all')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Browse catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {recentlyAddedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                playtimeMinutes={playtimes[game.id] || 0}
                onClick={() => onSelectGame(game.id)}
                onLogTime={(_, g) => setSessionModalGame(g)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Session Logger Modal */}
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
