/**
 * 2048 game logic (pure functions, testable)
 */

import { BOARD_SIZE, type Board, type Direction } from './types';

/** Deep clone a board */
function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

/** Merge a single line toward the "start" (left or top). Non-zero cells slide and equal adjacent merge. */
export function mergeLine(line: number[]): { merged: number[]; scoreDelta: number } {
  const filtered = line.filter((n) => n !== 0);
  const merged: number[] = [];
  let scoreDelta = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const value = filtered[i] * 2;
      merged.push(value);
      scoreDelta += value;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }
  while (merged.length < line.length) {
    merged.push(0);
  }
  return { merged, scoreDelta };
}

/** Get row at index */
function getRow(board: Board, rowIndex: number): number[] {
  return [...board[rowIndex]];
}

/** Get column at index */
function getColumn(board: Board, colIndex: number): number[] {
  return board.map((row) => row[colIndex]);
}

/** Set row at index (returns new board) */
function setRow(board: Board, rowIndex: number, row: number[]): void {
  for (let c = 0; c < BOARD_SIZE; c++) {
    board[rowIndex][c] = row[c];
  }
}

/** Set column at index */
function setColumn(board: Board, colIndex: number, col: number[]): void {
  for (let r = 0; r < BOARD_SIZE; r++) {
    board[r][colIndex] = col[r];
  }
}

/** Reverse a line (for right/down) */
function reverseLine(line: number[]): number[] {
  return [...line].reverse();
}

/**
 * Apply move in direction. Returns new board and score delta, or null if no change.
 */
export function moveBoard(
  board: Board,
  direction: Direction,
): { board: Board; scoreDelta: number } | null {
  const next = cloneBoard(board);
  let totalDelta = 0;
  let changed = false;

  if (direction === 'left') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row = getRow(next, r);
      const { merged, scoreDelta } = mergeLine(row);
      if (JSON.stringify(row) !== JSON.stringify(merged)) changed = true;
      totalDelta += scoreDelta;
      setRow(next, r, merged);
    }
  } else if (direction === 'right') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row = reverseLine(getRow(next, r));
      const { merged, scoreDelta } = mergeLine(row);
      const result = reverseLine(merged);
      if (JSON.stringify(getRow(next, r)) !== JSON.stringify(result)) changed = true;
      totalDelta += scoreDelta;
      setRow(next, r, result);
    }
  } else if (direction === 'up') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col = getColumn(next, c);
      const { merged, scoreDelta } = mergeLine(col);
      if (JSON.stringify(col) !== JSON.stringify(merged)) changed = true;
      totalDelta += scoreDelta;
      setColumn(next, c, merged);
    }
  } else {
    // down
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col = reverseLine(getColumn(next, c));
      const { merged, scoreDelta } = mergeLine(col);
      const result = reverseLine(merged);
      if (JSON.stringify(getColumn(next, c)) !== JSON.stringify(result)) changed = true;
      totalDelta += scoreDelta;
      setColumn(next, c, result);
    }
  }

  if (!changed) return null;
  return { board: next, scoreDelta: totalDelta };
}

/** Get list of empty cell positions [row, col] */
export function getEmptyCells(board: Board): [number, number][] {
  const empty: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  return empty;
}

/** Add a 2 or 4 in a random empty cell. Returns new board or null if no empty cell. */
export function addRandomTile(board: Board): Board | null {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return null;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = cloneBoard(board);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

/** Create empty 4x4 board */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

/** Create initial board with two random tiles (2 or 4) */
export function createInitialBoard(): Board {
  let board = addRandomTile(createEmptyBoard());
  if (!board) return createEmptyBoard();
  board = addRandomTile(board);
  return board ?? createEmptyBoard();
}

/** Check if any move is possible */
export function canMove(board: Board): boolean {
  if (getEmptyCells(board).length > 0) return true;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const v = board[r][c];
      if (c + 1 < BOARD_SIZE && board[r][c + 1] === v) return true;
      if (r + 1 < BOARD_SIZE && board[r + 1][c] === v) return true;
    }
  }
  return false;
}

/** Check if game is over (no empty cell and no merge possible) */
export function isGameOver(board: Board): boolean {
  return !canMove(board);
}

/** Check if 2048 tile exists (win condition) */
export const TARGET_TILE = 2048;

export function hasWon(board: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === TARGET_TILE) return true;
    }
  }
  return false;
}
