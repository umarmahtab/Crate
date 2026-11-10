import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import type { Game, GameStats, GameStatus } from '../types';

export function useStats(): { stats: GameStats | null; isLoading: boolean } {
  const stats = useLiveQuery(async (): Promise<GameStats> => {
    const games = await db.games.toArray();
    const sessions = await db.playSessions.toArray();

    const statusDistribution: Record<GameStatus, number> = {
      playing: 0,
      backlog: 0,
      completed: 0,
      onhold: 0,
      dropped: 0,
      wishlist: 0,
    };

    const platformCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    let ratingsSum = 0;
    let ratedCount = 0;

    for (const game of games) {
      if (statusDistribution[game.status] !== undefined) {
        statusDistribution[game.status]++;
      }

      const platform = game.selectedPlatform || 'Other';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;

      for (const genre of game.genres || []) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }

      if (typeof game.rating === 'number' && game.rating > 0) {
        ratingsSum += game.rating;
        ratedCount++;
      }
    }

    // Playtimes per game
    const gamePlaytimes: Record<string, number> = {};
    let totalPlaytimeMinutes = 0;
    const monthlyMinutes: Record<string, number> = {};

    for (const session of sessions) {
      const minutes = session.durationMinutes || 0;
      totalPlaytimeMinutes += minutes;
      gamePlaytimes[session.gameId] = (gamePlaytimes[session.gameId] || 0) + minutes;

      // Group by YYYY-MM
      try {
        const d = new Date(session.date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthlyMinutes[key] = (monthlyMinutes[key] || 0) + minutes;
        }
      } catch {
        // Skip invalid date
      }
    }

    // Determine top 3 most played games
    const gamesMap = new Map(games.map((g) => [g.id, g]));
    const topPlayedGames = Object.entries(gamePlaytimes)
      .map(([gameId, minutes]) => ({
        game: gamesMap.get(gameId),
        minutes,
      }))
      .filter((item): item is { game: Game; minutes: number } => item.game !== undefined && item.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 3);

    const mostPlayedGame = topPlayedGames.length > 0 ? topPlayedGames[0] : null;

    // Sort platform distribution
    const platformDistribution = Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);

    // Sort genre distribution
    const genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 genres

    // Format playtime by month (last 6-12 months sorted chronologically)
    const sortedMonths = Object.keys(monthlyMinutes).sort();
    const playtimeByMonth = sortedMonths.map((monthKey) => {
      const [year, month] = monthKey.split('-');
      const date = new Date(Number(year), Number(month) - 1);
      const label = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      return {
        month: label,
        minutes: monthlyMinutes[monthKey],
      };
    });

    return {
      totalGames: games.length,
      completedGames: statusDistribution.completed,
      currentlyPlaying: statusDistribution.playing,
      totalPlaytimeMinutes,
      averageRating: ratedCount > 0 ? Number((ratingsSum / ratedCount).toFixed(1)) : null,
      mostPlayedGame,
      topPlayedGames,
      statusDistribution,
      platformDistribution,
      genreDistribution,
      playtimeByMonth,
    };
  }, []);

  return {
    stats: stats ?? null,
    isLoading: stats === undefined,
  };
}
