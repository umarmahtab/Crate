import { db } from '../database/db';
import type { Game, PlaySession } from '../types';

export interface ExportData {
  version: number;
  exportDate: string;
  appName: string;
  games: Game[];
  playSessions: PlaySession[];
}

/**
 * Exports all user data (games and play sessions) as a formatted JSON string.
 */
export async function exportUserData(): Promise<string> {
  const games = await db.games.toArray();
  const playSessions = await db.playSessions.toArray();

  const payload: ExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    appName: 'Crate',
    games,
    playSessions,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Triggers a browser download of the exported JSON file.
 */
export async function downloadUserDataBackup(): Promise<void> {
  const json = await exportUserData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `crate-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates and imports user data from a JSON string.
 * Supports both Crate and legacy SavePoint backup files.
 * @param jsonString The raw JSON string from a file.
 * @param mode 'merge' adds/updates records; 'replace' clears existing data first.
 */
export async function importUserData(
  jsonString: string,
  mode: 'merge' | 'replace' = 'merge'
): Promise<{ importedGames: number; importedSessions: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format. Please select a valid Crate backup file.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid backup file structure.');
  }

  const data = parsed as Partial<ExportData>;

  if (!Array.isArray(data.games)) {
    throw new Error('Backup file must contain a valid "games" array.');
  }

  // Validate games
  const validGames: Game[] = [];
  const validGameIdSet = new Set<string>();

  for (const g of data.games) {
    if (!g || typeof g !== 'object' || !g.id || !g.title || !g.status) {
      continue;
    }
    const id = String(g.id);
    validGameIdSet.add(id);

    validGames.push({
      id,
      externalId: typeof g.externalId === 'number' ? g.externalId : null,
      title: String(g.title),
      description: g.description ? String(g.description) : undefined,
      coverUrl: g.coverUrl ? String(g.coverUrl) : undefined,
      releaseDate: g.releaseDate ? String(g.releaseDate) : undefined,
      genres: Array.isArray(g.genres) ? g.genres.map(String) : [],
      platforms: Array.isArray(g.platforms) ? g.platforms.map(String) : [],
      developer: g.developer ? String(g.developer) : undefined,
      publisher: g.publisher ? String(g.publisher) : undefined,
      selectedPlatform: g.selectedPlatform ? String(g.selectedPlatform) : 'PC',
      status: g.status,
      rating: typeof g.rating === 'number' ? g.rating : null,
      notes: g.notes ? String(g.notes) : undefined,
      dateAdded: g.dateAdded || new Date().toISOString(),
      dateUpdated: g.dateUpdated || new Date().toISOString(),
    });
  }

  // If merging, also retrieve existing game IDs from database
  if (mode === 'merge') {
    const existingGames = await db.games.toArray();
    for (const eg of existingGames) {
      validGameIdSet.add(eg.id);
    }
  }

  // Validate sessions & prevent orphan sessions
  const validSessions: PlaySession[] = [];
  if (Array.isArray(data.playSessions)) {
    for (const s of data.playSessions) {
      if (!s || typeof s !== 'object' || !s.id || !s.gameId || typeof s.durationMinutes !== 'number') {
        continue;
      }
      const gameId = String(s.gameId);
      // Ensure the game actually exists in this dataset or existing DB
      if (!validGameIdSet.has(gameId)) {
        continue;
      }
      validSessions.push({
        id: String(s.id),
        gameId,
        date: s.date || new Date().toISOString().split('T')[0],
        durationMinutes: Math.max(0, s.durationMinutes),
        notes: s.notes ? String(s.notes) : undefined,
      });
    }
  }

  await db.transaction('rw', db.games, db.playSessions, async () => {
    if (mode === 'replace') {
      await db.games.clear();
      await db.playSessions.clear();
    }
    if (validGames.length > 0) {
      await db.games.bulkPut(validGames);
    }
    if (validSessions.length > 0) {
      await db.playSessions.bulkPut(validSessions);
    }
  });

  return {
    importedGames: validGames.length,
    importedSessions: validSessions.length,
  };
}
