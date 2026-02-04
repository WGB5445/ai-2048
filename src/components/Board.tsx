/**
 * 4x4 board: grid of cells, each cell shows Tile or empty background
 */

import { StyleSheet, View } from 'react-native';
import type { Board } from '../game/types';
import { colors } from '../theme/colors';
import { Tile } from './Tile';

interface GameBoardProps {
  board: Board;
  cellSize: number;
  cellGap: number;
  tileFontSize: number;
}

export function GameBoard({ board, cellSize, cellGap, tileFontSize }: GameBoardProps) {
  return (
    <View style={[styles.container, { padding: cellGap, gap: cellGap }]}>
      {board.map((row, r) => (
        <View key={`row-${r}`} style={[styles.row, { gap: cellGap }]} aria-label={`row-${r}`}>
          {row.map((value, c) => (
            <View
              key={`cell-${r}-${c}`}
              aria-label={`cell-${r}-${c}`}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                },
              ]}
            >
              <Tile value={value} size={cellSize} fontSize={tileFontSize} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.boardBg,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    backgroundColor: colors.emptyCell,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
