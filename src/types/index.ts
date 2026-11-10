export type GameStatus =
  | 'playing'
  | 'backlog'
  | 'completed'
  | 'onhold'
  | 'dropped'
  | 'wishlist';

export interface Game {
  id: string; // Local UUID
  externalId?: number | null; // RAWG API ID
  title: string;
  description?: string;
  coverUrl?: string;
  releaseDate?: string;
  genres: string[];
  platforms: string[];
  developer?: string;
  publisher?: string;
  selectedPlatform: string;
  status: GameStatus;
  rating?: number | null; // e.g. 1-10 or 1-5
  notes?: string;
  dateAdded: string; // ISO 8601
  dateUpdated: string; // ISO 8601
}

export interface PlaySession {
  id: string; // UUID
  gameId: string; // References Game.id
  date: string; // ISO string (YYYY-MM-DD or full ISO)
  durationMinutes: number;
  notes?: string;
}

export type ViewMode = 'grid' | 'list';

export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'recent-added'
  | 'rating-desc'
  | 'playtime-desc'
  | 'release-desc';

export interface LibraryFilters {
  search: string;
  status: 'all' | GameStatus;
  platform: string;
  genre: string;
  sortBy: SortOption;
}

export interface GameStats {
  totalGames: number;
  completedGames: number;
  currentlyPlaying: number;
  totalPlaytimeMinutes: number;
  averageRating: number | null;
  mostPlayedGame: {
    game: Game;
    minutes: number;
  } | null;
  topPlayedGames: {
    game: Game;
    minutes: number;
  }[];
  statusDistribution: Record<GameStatus, number>;
  platformDistribution: { platform: string; count: number }[];
  genreDistribution: { genre: string; count: number }[];
  playtimeByMonth: { month: string; minutes: number }[];
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  defaultView: ViewMode;
  defaultSort: SortOption;
  rawgApiKey?: string;
  accentColor?: string;
  backgroundColor?: string;
}
