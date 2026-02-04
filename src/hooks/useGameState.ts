/**
 * Game state: board, score, high score, move, new game, restore
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addRandomTile,
  moveBoard as coreMoveBoard,
  createInitialBoard,
  hasWon,
  isGameOver,
} from '../game/core';
import {
  clearGameState,
  loadGameState,
  loadHighScore,
  saveGameState,
  saveHighScore,
} from '../game/persistence';
import type { Board, Direction } from '../game/types';

export interface GameStatus {
  gameOver: boolean;
  won: boolean;
}

export function useGameState() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);
  const [savedStateAvailable, setSavedStateAvailable] = useState<boolean | null>(null);
  const wonAcknowledged = useRef(false);

  const persistState = useCallback((b: Board, s: number) => {
    saveGameState(b, s);
  }, []);

  const loadInitial = useCallback(async () => {
    const [h, saved] = await Promise.all([loadHighScore(), loadGameState()]);
    setHighScore(h);
    if (saved?.board && saved.score >= 0) {
      setSavedStateAvailable(true);
    } else {
      setSavedStateAvailable(false);
      setHasRestored(true);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const restoreGame = useCallback(async () => {
    const saved = await loadGameState();
    if (saved) {
      setBoard(saved.board);
      setScore(saved.score);
      const alreadyOver = isGameOver(saved.board);
      setGameOver(alreadyOver);
      setWon(hasWon(saved.board));
      setHasRestored(true);
    }
    setSavedStateAvailable(false);
  }, []);

  const startNewGame = useCallback(async () => {
    await clearGameState();
    setBoard(createInitialBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
    wonAcknowledged.current = false;
    setHasRestored(true);
    setSavedStateAvailable(false);
  }, []);

  const move = useCallback(
    (direction: Direction) => {
      if (gameOver) return;
      const result = coreMoveBoard(board, direction);
      if (!result) return;
      const nextBoard = addRandomTile(result.board);
      if (!nextBoard) return;
      const newScore = score + result.scoreDelta;
      setBoard(nextBoard);
      setScore(newScore);
      persistState(nextBoard, newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
      }
      if (hasWon(nextBoard) && !wonAcknowledged.current) {
        setWon(true);
      }
      if (isGameOver(nextBoard)) {
        setGameOver(true);
      }
    },
    [board, score, gameOver, highScore, persistState],
  );

  const acknowledgeWin = useCallback(() => {
    wonAcknowledged.current = true;
    setWon(false);
  }, []);

  return {
    board,
    score,
    highScore,
    gameOver,
    won,
    hasRestored,
    savedStateAvailable,
    restoreGame,
    startNewGame,
    move,
    acknowledgeWin,
  };
}
