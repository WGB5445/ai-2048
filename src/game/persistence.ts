/**
 * Persist high score and game state via AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Board } from './types';

const KEY_HIGH_SCORE = '@2048/highScore';
const KEY_GAME_STATE = '@2048/gameState';

export interface PersistedGameState {
  board: number[][];
  score: number;
}

function isValidBoard(board: unknown): board is number[][] {
  if (!Array.isArray(board) || board.length !== 4) return false;
  for (const row of board) {
    if (!Array.isArray(row) || row.length !== 4) return false;
    for (const cell of row) {
      if (typeof cell !== 'number' || cell < 0) return false;
    }
  }
  return true;
}

function isValidGameState(data: unknown): data is PersistedGameState {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  if (typeof o.score !== 'number' || o.score < 0) return false;
  return isValidBoard(o.board);
}

/** Load high score. Returns 0 on error or missing. */
export async function loadHighScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY_HIGH_SCORE);
    if (raw == null) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
}

/** Save high score. Only call when score > current high score. */
export async function saveHighScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_HIGH_SCORE, String(score));
  } catch {
    // ignore
  }
}

/** Load saved game state. Returns null on error or missing. */
export async function loadGameState(): Promise<PersistedGameState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_GAME_STATE);
    if (raw == null) return null;
    const data = JSON.parse(raw) as unknown;
    if (!isValidGameState(data)) return null;
    return data;
  } catch {
    return null;
  }
}

/** Save game state (board + score). Call after each valid move. */
export async function saveGameState(board: Board, score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEY_GAME_STATE,
      JSON.stringify({ board: [...board.map((row) => [...row])], score }),
    );
  } catch {
    // ignore
  }
}

/** Clear saved game state (e.g. when starting new game). */
export async function clearGameState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_GAME_STATE);
  } catch {
    // ignore
  }
}
