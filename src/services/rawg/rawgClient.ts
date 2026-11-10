import type { RawgGameDetails, RawgGameSearchResult, RawgSearchResponse } from './types';

const BASE_URL = 'https://api.rawg.io/api';
const API_KEY_STORAGE_KEY = 'crate_rawg_api_key';
const LEGACY_API_KEY_STORAGE_KEY = 'savepoint_rawg_api_key';

// In-memory cache for fast responsiveness and avoiding redundant API calls
const searchCache = new Map<string, RawgGameSearchResult[]>();
const detailsCache = new Map<number, RawgGameDetails>();

// Curated popular starter database for offline / zero-config demonstration
const OFFLINE_SAMPLE_GAMES: RawgGameDetails[] = [
  {
    id: 3498,
    name: 'Grand Theft Auto V',
    slug: 'grand-theft-auto-v',
    background_image: 'https://media.rawg.io/media/games/20a/20aa58474e73893f35c2582271b62d3e.jpg',
    released: '2013-09-17',
    rating: 4.47,
    ratings_count: 7000,
    description_raw: 'Los Santos is a sprawling sun-soaked metropolis full of self-help gurus, starlets, and fading celebrities, once the envy of the Western world.',
    developers: [{ id: 1, name: 'Rockstar North' }],
    publishers: [{ id: 1, name: 'Rockstar Games' }],
    genres: [{ id: 4, name: 'Action', slug: 'action' }, { id: 3, name: 'Adventure', slug: 'adventure' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
      { platform: { id: 1, name: 'Xbox One', slug: 'xbox-one' } }
    ]
  },
  {
    id: 3328,
    name: 'The Witcher 3: Wild Hunt',
    slug: 'the-witcher-3-wild-hunt',
    background_image: 'https://media.rawg.io/media/games/618/618c2031a0709366923eab2072b185ea.jpg',
    released: '2015-05-18',
    rating: 4.65,
    ratings_count: 6500,
    description_raw: 'The Witcher: Wild Hunt is a story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe full of meaningful choices and impactful consequences.',
    developers: [{ id: 9023, name: 'CD PROJEKT RED' }],
    publishers: [{ id: 9023, name: 'CD PROJEKT RED' }],
    genres: [{ id: 5, name: 'RPG', slug: 'role-playing-games-rpg' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } }
    ]
  },
  {
    id: 4200,
    name: 'Portal 2',
    slug: 'portal-2',
    background_image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d85e0f0683.jpg',
    released: '2011-04-18',
    rating: 4.61,
    ratings_count: 4200,
    description_raw: 'The "Perpetual Testing Initiative" has been expanded to allow you to design co-op puzzles for you and your friends!',
    developers: [{ id: 108, name: 'Valve' }],
    publishers: [{ id: 108, name: 'Valve' }],
    genres: [{ id: 7, name: 'Puzzle', slug: 'puzzle' }, { id: 2, name: 'Shooter', slug: 'shooter' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } }
    ]
  },
  {
    id: 28,
    name: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    background_image: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
    released: '2018-10-26',
    rating: 4.58,
    ratings_count: 5300,
    description_raw: 'America, 1899. The end of the wild west era has begun as lawmen hunt down the last remaining outlaw gangs. Those who will not surrender or succumb are killed.',
    developers: [{ id: 1, name: 'Rockstar Games' }],
    publishers: [{ id: 1, name: 'Rockstar Games' }],
    genres: [{ id: 4, name: 'Action', slug: 'action' }, { id: 3, name: 'Adventure', slug: 'adventure' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 18, name: 'PlayStation 4', slug: 'playstation4' } },
      { platform: { id: 1, name: 'Xbox One', slug: 'xbox-one' } }
    ]
  },
  {
    id: 58175,
    name: 'God of War (2018)',
    slug: 'god-of-war-2',
    background_image: 'https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be59.jpg',
    released: '2018-04-20',
    rating: 4.57,
    ratings_count: 4900,
    description_raw: 'His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters.',
    developers: [{ id: 10, name: 'Sony Interactive Entertainment' }],
    publishers: [{ id: 10, name: 'PlayStation Studios' }],
    genres: [{ id: 4, name: 'Action', slug: 'action' }, { id: 3, name: 'Adventure', slug: 'adventure' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
      { platform: { id: 18, name: 'PlayStation 4', slug: 'playstation4' } }
    ]
  },
  {
    id: 22509,
    name: 'Minecraft',
    slug: 'minecraft',
    background_image: 'https://media.rawg.io/media/games/b4e/b4e4c73d5aa4ec66bbf75375c4847a2b.jpg',
    released: '2009-05-17',
    rating: 4.43,
    ratings_count: 3800,
    description_raw: 'Minecraft is a sandbox game created by Swedish game developer Markus Persson. The game focuses on allowing the player to explore, interact with, and modify a dynamically-generated map.',
    developers: [{ id: 15, name: 'Mojang Studios' }],
    publishers: [{ id: 16, name: 'Xbox Game Studios' }],
    genres: [{ id: 11, name: 'Arcade', slug: 'arcade' }, { id: 51, name: 'Indie', slug: 'indie' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } }
    ]
  },
  {
    id: 3272,
    name: 'Rocket League',
    slug: 'rocket-league',
    background_image: 'https://media.rawg.io/media/games/8cc/8cce7c0e99dce234e2968588200d3199.jpg',
    released: '2015-07-07',
    rating: 3.96,
    ratings_count: 2400,
    description_raw: 'Rocket League is a vehicular soccer video game developed and published by Psyonix.',
    developers: [{ id: 243, name: 'Psyonix' }],
    publishers: [{ id: 243, name: 'Psyonix' }],
    genres: [{ id: 15, name: 'Sports', slug: 'sports' }, { id: 1, name: 'Racing', slug: 'racing' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } }
    ]
  },
  {
    id: 2454,
    name: 'DOOM (2016)',
    slug: 'doom',
    background_image: 'https://media.rawg.io/media/games/c4b/c4b0cab189e73432de3a250d8cf1c84e.jpg',
    released: '2016-05-13',
    rating: 4.38,
    ratings_count: 3600,
    description_raw: 'Now with all three premium DLC packs (Unto the Evil, Hell Followed, and Bloodfall), maps, modes, and weapons, plus all feature updates.',
    developers: [{ id: 124, name: 'id Software' }],
    publishers: [{ id: 339, name: 'Bethesda Softworks' }],
    genres: [{ id: 2, name: 'Shooter', slug: 'shooter' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 18, name: 'PlayStation 4', slug: 'playstation4' } },
      { platform: { id: 1, name: 'Xbox One', slug: 'xbox-one' } }
    ]
  },
  {
    id: 3070,
    name: 'Fallout 4',
    slug: 'fallout-4',
    background_image: 'https://media.rawg.io/media/games/d82/d82363905c7d079d1d0f6610022369fc.jpg',
    released: '2015-11-09',
    rating: 3.79,
    ratings_count: 3400,
    description_raw: 'Bethesda Game Studios, the award-winning creators of Fallout 3 and The Elder Scrolls V: Skyrim, welcome you to the world of Fallout 4 - their most ambitious game ever.',
    developers: [{ id: 339, name: 'Bethesda Game Studios' }],
    publishers: [{ id: 339, name: 'Bethesda Softworks' }],
    genres: [{ id: 5, name: 'RPG', slug: 'role-playing-games-rpg' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
      { platform: { id: 186, name: 'Xbox Series S/X', slug: 'xbox-series-x' } }
    ]
  },
  {
    id: 12020,
    name: 'Left 4 Dead 2',
    slug: 'left-4-dead-2',
    background_image: 'https://media.rawg.io/media/games/d58/d588947d4286e7b5e0e12e1bee7a9c44.jpg',
    released: '2009-11-17',
    rating: 4.10,
    ratings_count: 2200,
    description_raw: 'Set in the zombie apocalypse, Left 4 Dead 2 (L4D2) is the highly anticipated sequel to the award-winning Left 4 Dead.',
    developers: [{ id: 108, name: 'Valve' }],
    publishers: [{ id: 108, name: 'Valve' }],
    genres: [{ id: 2, name: 'Shooter', slug: 'shooter' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } }
    ]
  },
  {
    id: 290856,
    name: 'Apex Legends',
    slug: 'apex-legends',
    background_image: 'https://media.rawg.io/media/games/d1a/d1a2e99ade53494c6330a0ed945fe823.jpg',
    released: '2019-02-04',
    rating: 3.65,
    ratings_count: 2700,
    description_raw: 'Conquer with character in Apex Legends, a free-to-play Battle Royale shooter where legendary characters with powerful abilities team up to battle for fame & fortune.',
    developers: [{ id: 366, name: 'Respawn Entertainment' }],
    publishers: [{ id: 354, name: 'Electronic Arts' }],
    genres: [{ id: 2, name: 'Shooter', slug: 'shooter' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } }
    ]
  },
  {
    id: 41494,
    name: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    background_image: 'https://media.rawg.io/media/games/26d/26d44377d59666b35160f238585c2bbe.jpg',
    released: '2020-12-10',
    rating: 4.16,
    ratings_count: 3600,
    description_raw: 'Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
    developers: [{ id: 9023, name: 'CD PROJEKT RED' }],
    publishers: [{ id: 9023, name: 'CD PROJEKT RED' }],
    genres: [{ id: 5, name: 'RPG', slug: 'role-playing-games-rpg' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
      { platform: { id: 186, name: 'Xbox Series S/X', slug: 'xbox-series-x' } }
    ]
  },
  {
    id: 3939,
    name: 'PAYDAY 2',
    slug: 'payday-2',
    background_image: 'https://media.rawg.io/media/games/73e/73eecb8909e0c39fb246f457b5d6500f.jpg',
    released: '2013-08-13',
    rating: 3.51,
    ratings_count: 1700,
    description_raw: 'PAYDAY 2 is an action-packed, four-player co-op shooter that once again lets gamers don the masks of the original PAYDAY crew.',
    developers: [{ id: 361, name: 'OVERKILL Software' }],
    publishers: [{ id: 741, name: '505 Games' }],
    genres: [{ id: 2, name: 'Shooter', slug: 'shooter' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } }
    ]
  },
  {
    id: 278,
    name: 'Horizon Zero Dawn',
    slug: 'horizon-zero-dawn',
    background_image: 'https://media.rawg.io/media/games/b7d/b7d3f1715fa8381a4e780173a197a615.jpg',
    released: '2017-02-28',
    rating: 4.31,
    ratings_count: 3100,
    description_raw: 'Experience Aloy\'s entire legendary quest to unravel the mysteries of a world ruled by deadly Machines.',
    developers: [{ id: 100, name: 'Guerrilla Games' }],
    publishers: [{ id: 10, name: 'Sony Interactive Entertainment' }],
    genres: [{ id: 4, name: 'Action', slug: 'action' }, { id: 5, name: 'RPG', slug: 'role-playing-games-rpg' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 18, name: 'PlayStation 4', slug: 'playstation4' } }
    ]
  },
  {
    id: 5679,
    name: 'The Elder Scrolls V: Skyrim',
    slug: 'the-elder-scrolls-v-skyrim',
    background_image: 'https://media.rawg.io/media/games/7cf/7cfc92f8b5257e05004e40316d25bd18.jpg',
    released: '2011-11-11',
    rating: 4.42,
    ratings_count: 4800,
    description_raw: 'Winner of more than 200 Game of the Year Awards, Skyrim Special Edition brings the epic fantasy to life in stunning detail.',
    developers: [{ id: 339, name: 'Bethesda Game Studios' }],
    publishers: [{ id: 339, name: 'Bethesda Softworks' }],
    genres: [{ id: 5, name: 'RPG', slug: 'role-playing-games-rpg' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } }
    ]
  },
  {
    id: 58134,
    name: 'Marvel\'s Spider-Man',
    slug: 'marvels-spider-man',
    background_image: 'https://media.rawg.io/media/games/9aa/9aa42d16d425fa6f170455123d4eb069.jpg',
    released: '2018-09-07',
    rating: 4.46,
    ratings_count: 2900,
    description_raw: 'Starring one of the world\'s most iconic Super Heroes, Marvel\'s Spider-Man features the acrobatic abilities, improvisation and web-slinging that the wall-crawler is famous for.',
    developers: [{ id: 11, name: 'Insomniac Games' }],
    publishers: [{ id: 10, name: 'Sony Interactive Entertainment' }],
    genres: [{ id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } }
    ]
  },
  {
    id: 13536,
    name: 'Portal',
    slug: 'portal',
    background_image: 'https://media.rawg.io/media/games/7fa/7fa0b586293c5861ee32490e953a4996.jpg',
    released: '2007-10-09',
    rating: 4.51,
    ratings_count: 3200,
    description_raw: 'Portal is a new single player game from Valve. Set in the mysterious Aperture Science Laboratories, Portal has been called one of the most innovative new games on the horizon.',
    developers: [{ id: 108, name: 'Valve' }],
    publishers: [{ id: 108, name: 'Valve' }],
    genres: [{ id: 7, name: 'Puzzle', slug: 'puzzle' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } }
    ]
  },
  {
    id: 4291,
    name: 'Counter-Strike: Global Offensive',
    slug: 'counter-strike-global-offensive',
    background_image: 'https://media.rawg.io/media/games/736/7361901a409dd05d6f3ad2623a2a6b20.jpg',
    released: '2012-08-21',
    rating: 3.57,
    ratings_count: 3700,
    description_raw: 'Counter-Strike: Global Offensive (CS: GO) expands upon the team-based action gameplay that it pioneered when it was launched 19 years ago.',
    developers: [{ id: 108, name: 'Valve' }, { id: 365, name: 'Hidden Path Entertainment' }],
    publishers: [{ id: 108, name: 'Valve' }],
    genres: [{ id: 2, name: 'Shooter', slug: 'shooter' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } }
    ]
  },
  {
    id: 1030,
    name: 'Limbo',
    slug: 'limbo',
    background_image: 'https://media.rawg.io/media/games/942/9424d6bb763dc38d9378b488603c87fa.jpg',
    released: '2010-07-21',
    rating: 4.15,
    ratings_count: 2400,
    description_raw: 'Uncertain of his sister\'s fate, a boy enters LIMBO.',
    developers: [{ id: 400, name: 'Playdead' }],
    publishers: [{ id: 400, name: 'Playdead' }],
    genres: [{ id: 7, name: 'Puzzle', slug: 'puzzle' }, { id: 51, name: 'Indie', slug: 'indie' }, { id: 83, name: 'Platformer', slug: 'platformer' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } },
      { platform: { id: 3, name: 'iOS', slug: 'ios' } },
      { platform: { id: 21, name: 'Android', slug: 'android' } }
    ]
  },
  {
    id: 10061,
    name: 'BioShock Infinite',
    slug: 'bioshock-infinite',
    background_image: 'https://media.rawg.io/media/games/fc1/fc1307a27745037bdda0fedd7ba09e1d.jpg',
    released: '2013-03-26',
    rating: 4.38,
    ratings_count: 3200,
    description_raw: 'Indebted to the wrong people, with his life on the line, veteran of the U.S. Cavalry and now hired gun, Booker DeWitt has only one opportunity to wipe his slate clean.',
    developers: [{ id: 249, name: 'Irrational Games' }],
    publishers: [{ id: 198, name: '2K Games' }],
    genres: [{ id: 2, name: 'Shooter', slug: 'shooter' }, { id: 4, name: 'Action', slug: 'action' }],
    platforms: [
      { platform: { id: 4, name: 'PC', slug: 'pc' } },
      { platform: { id: 18, name: 'PlayStation 4', slug: 'playstation4' } },
      { platform: { id: 7, name: 'Nintendo Switch', slug: 'nintendo-switch' } }
    ]
  }
];

export class RawgService {
  /**
   * Retrieves the configured RAWG API key from storage or environment.
   */
  public static getApiKey(): string {
    const stored =
      localStorage.getItem(API_KEY_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_API_KEY_STORAGE_KEY);
    if (stored && stored.trim()) {
      return stored.trim();
    }
    const envKey = import.meta.env.VITE_RAWG_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim()) {
      return envKey.trim();
    }
    return '';
  }

  /**
   * Updates or clears the stored API key in local storage.
   */
  public static setApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
      localStorage.setItem(LEGACY_API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      localStorage.removeItem(LEGACY_API_KEY_STORAGE_KEY);
    }
  }

  public static isApiKeyConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Tests whether an API key is valid by querying the games endpoint.
   */
  public static async testConnection(keyToTest?: string): Promise<{ success: boolean; message: string }> {
    const key = keyToTest?.trim() || this.getApiKey();
    if (!key) {
      return { success: false, message: 'No API key provided.' };
    }

    try {
      const response = await fetch(`${BASE_URL}/games?key=${key}&page_size=1`, {
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        return { success: true, message: 'Connection to RAWG API successful!' };
      } else if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'Invalid RAWG API key. Please check your credentials.' };
      } else {
        return { success: false, message: `RAWG responded with status: ${response.status} ${response.statusText}` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error or timeout';
      return { success: false, message: `Could not reach RAWG: ${msg}` };
    }
  }

  /**
   * Search for games via RAWG API or fallback to sample library if offline / unconfigured.
   */
  public static async searchGames(
    query: string,
    options: { pageSize?: number; signal?: AbortSignal } = {}
  ): Promise<{ results: RawgGameSearchResult[]; isFallback: boolean }> {
    const cleanQuery = query.trim();
    const pageSize = options.pageSize || 15;

    if (!cleanQuery) {
      // When query is empty, return popular sample games
      return {
        results: OFFLINE_SAMPLE_GAMES.slice(0, pageSize),
        isFallback: !this.isApiKeyConfigured(),
      };
    }

    const cacheKey = `${cleanQuery.toLowerCase()}_${pageSize}`;
    if (searchCache.has(cacheKey)) {
      return { results: searchCache.get(cacheKey)!, isFallback: false };
    }

    const apiKey = this.getApiKey();

    if (!apiKey) {
      // Filter offline sample games by query
      const filtered = OFFLINE_SAMPLE_GAMES.filter((g) =>
        g.name.toLowerCase().includes(cleanQuery.toLowerCase())
      );
      return { results: filtered, isFallback: true };
    }

    try {
      const url = `${BASE_URL}/games?key=${apiKey}&search=${encodeURIComponent(
        cleanQuery
      )}&page_size=${pageSize}&search_precise=true`;

      const response = await fetch(url, {
        signal: options.signal || AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`RAWG API error (${response.status})`);
      }

      const data: RawgSearchResponse = await response.json();
      const results = data.results || [];

      searchCache.set(cacheKey, results);
      return { results, isFallback: false };
    } catch {
      // Graceful offline fallback on network or API failure
      const fallbackFiltered = OFFLINE_SAMPLE_GAMES.filter((g) =>
        g.name.toLowerCase().includes(cleanQuery.toLowerCase())
      );
      return { results: fallbackFiltered, isFallback: true };
    }
  }

  /**
   * Fetches full details for a game from RAWG.
   */
  public static async getGameDetails(
    id: number,
    options: { signal?: AbortSignal } = {}
  ): Promise<RawgGameDetails> {
    if (detailsCache.has(id)) {
      return detailsCache.get(id)!;
    }

    // Check offline samples first
    const sample = OFFLINE_SAMPLE_GAMES.find((g) => g.id === id);
    const apiKey = this.getApiKey();

    if (!apiKey && sample) {
      return sample;
    }

    if (!apiKey) {
      if (sample) return sample;
      throw new Error('RAWG API key is required to load remote game details.');
    }

    try {
      const response = await fetch(`${BASE_URL}/games/${id}?key=${apiKey}`, {
        signal: options.signal || AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        if (sample) return sample;
        throw new Error(`Failed to load game details (${response.status})`);
      }

      const data: RawgGameDetails = await response.json();
      detailsCache.set(id, data);
      return data;
    } catch (err) {
      if (sample) return sample;
      throw err;
    }
  }
}
