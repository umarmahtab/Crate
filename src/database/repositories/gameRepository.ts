import { db } from '../db';
import type { Game, GameStatus } from '../../types';
import { generateId } from '../../utils/uuid';

export interface IGameRepository {
  getAll(): Promise<Game[]>;
  getById(id: string): Promise<Game | undefined>;
  getByExternalId(externalId: number): Promise<Game | undefined>;
  create(gameData: Omit<Game, 'id' | 'dateAdded' | 'dateUpdated'>): Promise<Game>;
  update(id: string, updates: Partial<Omit<Game, 'id' | 'dateAdded'>>): Promise<void>;
  updateStatus(id: string, status: GameStatus): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  bulkAdd(games: Game[]): Promise<void>;
  clearAll(): Promise<void>;
}

export class DexieGameRepository implements IGameRepository {
  async getAll(): Promise<Game[]> {
    return await db.games.toArray();
  }

  async getById(id: string): Promise<Game | undefined> {
    return await db.games.get(id);
  }

  async getByExternalId(externalId: number): Promise<Game | undefined> {
    return await db.games.where('externalId').equals(externalId).first();
  }

  async create(gameData: Omit<Game, 'id' | 'dateAdded' | 'dateUpdated'>): Promise<Game> {
    const now = new Date().toISOString();
    const newGame: Game = {
      ...gameData,
      id: generateId(),
      dateAdded: now,
      dateUpdated: now,
    };

    await db.games.add(newGame);
    return newGame;
  }

  async update(id: string, updates: Partial<Omit<Game, 'id' | 'dateAdded'>>): Promise<void> {
    await db.games.update(id, {
      ...updates,
      dateUpdated: new Date().toISOString(),
    });
  }

  async updateStatus(id: string, status: GameStatus): Promise<void> {
    await this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.games, db.playSessions, async () => {
      // Cascade delete play sessions
      await db.playSessions.where('gameId').equals(id).delete();
      await db.games.delete(id);
    });
  }

  async count(): Promise<number> {
    return await db.games.count();
  }

  async bulkAdd(games: Game[]): Promise<void> {
    await db.games.bulkPut(games);
  }

  async clearAll(): Promise<void> {
    await db.games.clear();
  }
}

export const gameRepository = new DexieGameRepository();
