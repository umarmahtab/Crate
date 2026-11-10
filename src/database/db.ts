import Dexie, { type Table } from 'dexie';
import type { Game, PlaySession } from '../types';

export class CrateDatabase extends Dexie {
  games!: Table<Game, string>;
  playSessions!: Table<PlaySession, string>;

  constructor() {
    super('SavePointDB');
    
    // Version 1 schema definition
    this.version(1).stores({
      games: 'id, externalId, title, status, selectedPlatform, rating, dateAdded, dateUpdated',
      playSessions: 'id, gameId, date, durationMinutes'
    });
  }
}

export const db = new CrateDatabase();
export { CrateDatabase as SavePointDatabase };
