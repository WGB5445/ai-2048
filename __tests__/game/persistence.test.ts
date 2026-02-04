/**
 * Integration-style tests for persistence (AsyncStorage mock, real persistence API)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearGameState,
  loadGameState,
  loadHighScore,
  saveGameState,
  saveHighScore,
} from '../../src/game/persistence';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('loadHighScore / saveHighScore', () => {
  it('returns 0 when no high score saved', async () => {
    const score = await loadHighScore();
    expect(score).toBe(0);
  });

  it('saves and loads high score', async () => {
    await saveHighScore(100);
    const loaded = await loadHighScore();
    expect(loaded).toBe(100);
  });

  it('overwrites high score', async () => {
    await saveHighScore(50);
    await saveHighScore(200);
    const loaded = await loadHighScore();
    expect(loaded).toBe(200);
  });
});

describe('loadGameState / saveGameState', () => {
  const validBoard = [
    [2, 0, 0, 0],
    [0, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  it('returns null when no game state saved', async () => {
    const loaded = await loadGameState();
    expect(loaded).toBeNull();
  });

  it('saves and loads game state', async () => {
    await saveGameState(validBoard, 42);
    const loaded = await loadGameState();
    expect(loaded).not.toBeNull();
    expect(loaded?.board).toEqual(validBoard);
    expect(loaded?.score).toBe(42);
  });

  it('returns null for invalid stored data', async () => {
    await AsyncStorage.setItem('@2048/gameState', 'not json');
    const loaded = await loadGameState();
    expect(loaded).toBeNull();
  });

  it('returns null for invalid board shape', async () => {
    await AsyncStorage.setItem('@2048/gameState', JSON.stringify({ board: [[1, 2]], score: 0 }));
    const loaded = await loadGameState();
    expect(loaded).toBeNull();
  });

  it('returns null for negative score', async () => {
    await AsyncStorage.setItem('@2048/gameState', JSON.stringify({ board: validBoard, score: -1 }));
    const loaded = await loadGameState();
    expect(loaded).toBeNull();
  });
});

describe('clearGameState', () => {
  it('removes saved game state', async () => {
    const board = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    await saveGameState(board, 10);
    await clearGameState();
    const loaded = await loadGameState();
    expect(loaded).toBeNull();
  });
});
