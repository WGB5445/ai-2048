/**
 * Unit tests for 2048 game logic (core.ts)
 */

import {
  addRandomTile,
  canMove,
  createEmptyBoard,
  createInitialBoard,
  getEmptyCells,
  hasWon,
  isGameOver,
  mergeLine,
  moveBoard,
  TARGET_TILE,
} from '../../src/game/core';

describe('mergeLine', () => {
  it('slides non-zero to the left and merges equal adjacent', () => {
    const { merged, scoreDelta } = mergeLine([2, 2, 0, 0]);
    expect(merged).toEqual([4, 0, 0, 0]);
    expect(scoreDelta).toBe(4);
  });

  it('merges only once per pair', () => {
    const { merged, scoreDelta } = mergeLine([2, 2, 2, 2]);
    expect(merged).toEqual([4, 4, 0, 0]);
    expect(scoreDelta).toBe(8);
  });

  it('does not merge different values', () => {
    const { merged, scoreDelta } = mergeLine([2, 4, 8, 16]);
    expect(merged).toEqual([2, 4, 8, 16]);
    expect(scoreDelta).toBe(0);
  });

  it('returns same line when no change', () => {
    const line = [2, 4, 8, 0];
    const { merged } = mergeLine(line);
    expect(merged).toEqual([2, 4, 8, 0]);
  });
});

describe('moveBoard', () => {
  it('moves left and merges', () => {
    const board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = moveBoard(board, 'left');
    expect(result).not.toBeNull();
    expect(result?.board[0]).toEqual([4, 0, 0, 0]);
    expect(result?.scoreDelta).toBe(4);
  });

  it('moves right', () => {
    const board = [
      [0, 0, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = moveBoard(board, 'right');
    expect(result).not.toBeNull();
    expect(result?.board[0]).toEqual([0, 0, 0, 4]);
  });

  it('moves up', () => {
    const board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = moveBoard(board, 'up');
    expect(result).not.toBeNull();
    expect(result?.board[0][0]).toBe(4);
    expect(result?.board[1][0]).toBe(0);
  });

  it('moves down', () => {
    const board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
    ];
    const result = moveBoard(board, 'down');
    expect(result).not.toBeNull();
    expect(result?.board[3][0]).toBe(4);
    expect(result?.board[2][0]).toBe(0);
  });

  it('returns null when no move possible', () => {
    const board = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = moveBoard(board, 'left');
    expect(result).toBeNull(); // row 0 already packed left, no merge
    const fullBoard = [
      [2, 4, 8, 16],
      [16, 8, 4, 2],
      [2, 4, 8, 16],
      [16, 8, 4, 2],
    ];
    const noMove = moveBoard(fullBoard, 'left');
    expect(noMove).toBeNull();
  });
});

describe('getEmptyCells', () => {
  it('returns all positions for empty board', () => {
    const board = createEmptyBoard();
    const empty = getEmptyCells(board);
    expect(empty).toHaveLength(16);
  });

  it('returns 14 positions when 2 cells filled', () => {
    const board = createEmptyBoard();
    board[0][0] = 2;
    board[1][1] = 4;
    const empty = getEmptyCells(board);
    expect(empty).toHaveLength(14);
  });
});

describe('addRandomTile', () => {
  it('adds one tile to empty board', () => {
    const board = createEmptyBoard();
    const next = addRandomTile(board);
    expect(next).not.toBeNull();
    const empty = next ? getEmptyCells(next) : [];
    expect(empty).toHaveLength(15);
  });

  it('returns null when board full', () => {
    const board = [
      [2, 4, 8, 16],
      [16, 8, 4, 2],
      [2, 4, 8, 16],
      [16, 8, 4, 2],
    ];
    const next = addRandomTile(board);
    expect(next).toBeNull();
  });
});

describe('createInitialBoard', () => {
  it('has exactly two non-zero tiles', () => {
    const board = createInitialBoard();
    let count = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] !== 0) count++;
      }
    }
    expect(count).toBe(2);
  });
});

describe('canMove', () => {
  it('returns true when empty cells exist', () => {
    const board = createEmptyBoard();
    board[0][0] = 2;
    expect(canMove(board)).toBe(true);
  });

  it('returns true when adjacent equal values exist', () => {
    const board = [
      [2, 2, 4, 8],
      [8, 4, 2, 2],
      [4, 8, 4, 8],
      [2, 4, 8, 4],
    ];
    expect(canMove(board)).toBe(true);
  });

  it('returns false when full and no merge possible', () => {
    const board = [
      [2, 4, 8, 16],
      [16, 8, 4, 2],
      [2, 4, 8, 16],
      [16, 8, 4, 2],
    ];
    expect(canMove(board)).toBe(false);
  });
});

describe('isGameOver', () => {
  it('returns false when moves available', () => {
    const board = createInitialBoard();
    expect(isGameOver(board)).toBe(false);
  });

  it('returns true when no moves', () => {
    const board = [
      [2, 4, 8, 16],
      [16, 8, 4, 2],
      [2, 4, 8, 16],
      [16, 8, 4, 2],
    ];
    expect(isGameOver(board)).toBe(true);
  });
});

describe('hasWon', () => {
  it('returns true when 2048 present', () => {
    const board = createEmptyBoard();
    board[0][0] = TARGET_TILE;
    expect(hasWon(board)).toBe(true);
  });

  it('returns false when 2048 not present', () => {
    const board = createInitialBoard();
    expect(hasWon(board)).toBe(false);
  });
});
