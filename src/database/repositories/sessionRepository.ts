import { db } from '../db';
import type { PlaySession } from '../../types';
import { generateId } from '../../utils/uuid';

export interface ISessionRepository {
  getAll(): Promise<PlaySession[]>;
  getByGameId(gameId: string): Promise<PlaySession[]>;
  getById(id: string): Promise<PlaySession | undefined>;
  create(sessionData: Omit<PlaySession, 'id'>): Promise<PlaySession>;
  update(id: string, updates: Partial<Omit<PlaySession, 'id' | 'gameId'>>): Promise<void>;
  delete(id: string): Promise<void>;
  getTotalPlaytimeForGame(gameId: string): Promise<number>;
  getAllPlaytimesGroupedByGame(): Promise<Record<string, number>>;
  bulkAdd(sessions: PlaySession[]): Promise<void>;
  clearAll(): Promise<void>;
}

export class DexieSessionRepository implements ISessionRepository {
  async getAll(): Promise<PlaySession[]> {
    return await db.playSessions.toArray();
  }

  async getByGameId(gameId: string): Promise<PlaySession[]> {
    return await db.playSessions
      .where('gameId')
      .equals(gameId)
      .reverse()
      .sortBy('date');
  }

  async getById(id: string): Promise<PlaySession | undefined> {
    return await db.playSessions.get(id);
  }

  async create(sessionData: Omit<PlaySession, 'id'>): Promise<PlaySession> {
    const newSession: PlaySession = {
      ...sessionData,
      id: generateId(),
    };
    await db.playSessions.add(newSession);
    return newSession;
  }

  async update(id: string, updates: Partial<Omit<PlaySession, 'id' | 'gameId'>>): Promise<void> {
    await db.playSessions.update(id, updates);
  }

  async delete(id: string): Promise<void> {
    await db.playSessions.delete(id);
  }

  async getTotalPlaytimeForGame(gameId: string): Promise<number> {
    const sessions = await db.playSessions.where('gameId').equals(gameId).toArray();
    return sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }

  async getAllPlaytimesGroupedByGame(): Promise<Record<string, number>> {
    const sessions = await db.playSessions.toArray();
    const result: Record<string, number> = {};
    for (const session of sessions) {
      result[session.gameId] = (result[session.gameId] || 0) + (session.durationMinutes || 0);
    }
    return result;
  }

  async bulkAdd(sessions: PlaySession[]): Promise<void> {
    await db.playSessions.bulkPut(sessions);
  }

  async clearAll(): Promise<void> {
    await db.playSessions.clear();
  }
}

export const sessionRepository = new DexieSessionRepository();
