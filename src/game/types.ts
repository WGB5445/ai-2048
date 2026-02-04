/**
 * 2048 game types
 */

export const BOARD_SIZE = 4;

/** 4x4 board: row-major, 0 = empty cell */
export type Board = number[][];

export type Direction = 'left' | 'right' | 'up' | 'down';

export interface GameState {
  board: Board;
  score: number;
}

export interface PersistedGameState {
  board: number[][];
  score: number;
}
