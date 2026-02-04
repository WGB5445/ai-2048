/**
 * Responsive dimensions from useWindowDimensions (board size, cell size, fonts)
 */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const BOARD_RATIO = 0.85;
const CELL_GAP = 4;
const BOARD_SIZE = 4;

export interface ResponsiveLayout {
  width: number;
  height: number;
  boardSize: number;
  cellSize: number;
  cellGap: number;
  tileFontSize: number;
  scoreFontSize: number;
}

export function useResponsive(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const minSide = Math.min(width, height);
    const boardSize = Math.floor(minSide * BOARD_RATIO);
    const cellGap = CELL_GAP;
    const cellSize = Math.floor((boardSize - (BOARD_SIZE + 1) * cellGap) / BOARD_SIZE);
    const tileFontSize = Math.max(14, Math.floor(cellSize * 0.35));
    const scoreFontSize = Math.max(16, Math.floor(minSide * 0.05));
    return {
      width,
      height,
      boardSize,
      cellSize,
      cellGap,
      tileFontSize,
      scoreFontSize,
    };
  }, [width, height]);
}
