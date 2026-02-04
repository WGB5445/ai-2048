/**
 * Theme colors (size-independent)
 */

export const colors = {
  background: '#faf8ef',
  boardBg: '#bbada0',
  emptyCell: 'rgba(238, 228, 218, 0.35)',
  tile: {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
    super: '#3c3a32',
  },
  text: {
    light: '#776e65',
    dark: '#f9f6f2',
  },
  overlay: 'rgba(238, 228, 218, 0.73)',
} as const;

export function getTileBackground(value: number): string {
  if (value <= 2048 && value in colors.tile) {
    return colors.tile[value as keyof typeof colors.tile];
  }
  return colors.tile.super;
}

export function getTileTextColor(value: number): string {
  return value <= 4 ? colors.text.light : colors.text.dark;
}
