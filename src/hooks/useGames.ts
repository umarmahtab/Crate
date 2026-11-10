import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import type { LibraryFilters, PlaySession } from '../types';

export function useGames(filters?: Partial<LibraryFilters>) {
  const data = useLiveQuery(
    async () => {
      const allGames = await db.games.toArray();
      const allSessions = await db.playSessions.toArray();

      // Collect unique platforms and genres directly from user database
      const platformSet = new Set<string>();
      const genreSet = new Set<string>();

      for (const g of allGames) {
        if (g.selectedPlatform) platformSet.add(g.selectedPlatform);
        for (const p of g.platforms || []) {
          if (p) platformSet.add(p);
        }
        for (const genre of g.genres || []) {
          if (genre) genreSet.add(genre);
        }
      }

      // Build playtimes lookup
      const playtimes: Record<string, number> = {};
      for (const s of allSessions) {
        playtimes[s.gameId] = (playtimes[s.gameId] || 0) + (s.durationMinutes || 0);
      }

      let filtered = [...allGames];

      if (filters) {
        // Status filter
        if (filters.status && filters.status !== 'all') {
          filtered = filtered.filter((g) => g.status === filters.status);
        }

        // Platform filter
        if (filters.platform && filters.platform !== 'all') {
          filtered = filtered.filter(
            (g) =>
              g.selectedPlatform === filters.platform ||
              g.platforms.includes(filters.platform!)
          );
        }

        // Genre filter
        if (filters.genre && filters.genre !== 'all') {
          filtered = filtered.filter((g) =>
            g.genres.some((genre) => genre.toLowerCase() === filters.genre?.toLowerCase())
          );
        }

        // Search text
        if (filters.search && filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          filtered = filtered.filter(
            (g) =>
              g.title.toLowerCase().includes(q) ||
              (g.developer && g.developer.toLowerCase().includes(q)) ||
              (g.publisher && g.publisher.toLowerCase().includes(q)) ||
              g.genres.some((genre) => genre.toLowerCase().includes(q)) ||
              g.platforms.some((platform) => platform.toLowerCase().includes(q))
          );
        }

        // Sorting
        const sortBy = filters.sortBy || 'recent-added';
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'title-asc':
              return a.title.localeCompare(b.title);
            case 'title-desc':
              return b.title.localeCompare(a.title);
            case 'recent-added':
              return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
            case 'rating-desc':
              return (b.rating ?? -1) - (a.rating ?? -1);
            case 'playtime-desc':
              return (playtimes[b.id] || 0) - (playtimes[a.id] || 0);
            case 'release-desc': {
              const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
              const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
              return dateB - dateA;
            }
            default:
              return 0;
          }
        });
      }

      return {
        games: filtered,
        totalCount: allGames.length,
        playtimes,
        allSessions,
        userPlatforms: Array.from(platformSet).sort(),
        userGenres: Array.from(genreSet).sort(),
      };
    },
    [
      filters?.search,
      filters?.status,
      filters?.platform,
      filters?.genre,
      filters?.sortBy,
    ]
  );

  return {
    games: data?.games || [],
    totalCount: data?.totalCount || 0,
    playtimes: data?.playtimes || {},
    allSessions: data?.allSessions || [],
    userPlatforms: data?.userPlatforms || [],
    userGenres: data?.userGenres || [],
    isLoading: data === undefined,
  };
}

export function useGameDetails(gameId?: string) {
  const result = useLiveQuery(
    async () => {
      if (!gameId) return null;
      const game = await db.games.get(gameId);
      if (!game) return null;

      const sessions = await db.playSessions
        .where('gameId')
        .equals(gameId)
        .toArray();

      // Sort sessions descending by date
      sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const totalPlaytimeMinutes = sessions.reduce(
        (sum: number, s: PlaySession) => sum + (s.durationMinutes || 0),
        0
      );

      return {
        game,
        sessions,
        totalPlaytimeMinutes,
      };
    },
    [gameId]
  );

  return {
    game: result?.game,
    sessions: result?.sessions || [],
    totalPlaytimeMinutes: result?.totalPlaytimeMinutes || 0,
    isLoading: result === undefined,
    notFound: result === null && Boolean(gameId),
  };
}
