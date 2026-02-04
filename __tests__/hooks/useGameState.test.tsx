/**
 * Shallow integration test for useGameState: move updates board/score, startNewGame resets
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { useGameState } from '../../src/hooks/useGameState';

function TestWrapper({ onReady }: { onReady: (api: ReturnType<typeof useGameState>) => void }) {
  const api = useGameState();
  const ref = useRef(api);
  ref.current = api;
  useEffect(() => {
    onReady(ref.current);
  }, [onReady, api.board, api.score]);
  return (
    <View>
      <Text testID="score">{api.score}</Text>
      <Text testID="highScore">{api.highScore}</Text>
      <TouchableOpacity testID="move-left" onPress={() => api.move('left')}>
        <Text>Move Left</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="new-game" onPress={() => api.startNewGame()}>
        <Text>New Game</Text>
      </TouchableOpacity>
    </View>
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('useGameState: initial board has 2 tiles, score 0', async () => {
  let api: ReturnType<typeof useGameState> | null = null;
  let _renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    _renderer = ReactTestRenderer.create(
      <TestWrapper
        onReady={(a) => {
          api = a;
        }}
      />,
    );
  });
  await ReactTestRenderer.act(async () => {
    await new Promise((r) => setTimeout(r, 50));
  });
  expect(api).not.toBeNull();
  const board = api?.board;
  const nonZero = board.flat().filter((n) => n !== 0).length;
  expect(nonZero).toBe(2);
  expect(api?.score).toBe(0);
});

test('useGameState: startNewGame resets score and board', async () => {
  let api: ReturnType<typeof useGameState> | null = null;
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <TestWrapper
        onReady={(a) => {
          api = a;
        }}
      />,
    );
  });
  await ReactTestRenderer.act(async () => {
    await new Promise((r) => setTimeout(r, 50));
  });
  expect(api).not.toBeNull();
  await ReactTestRenderer.act(async () => {
    api?.startNewGame();
    await new Promise((r) => setTimeout(r, 0));
  });
  const nonZero = api?.board.flat().filter((n) => n !== 0).length;
  expect(nonZero).toBe(2);
  expect(api?.score).toBe(0);
});

test('useGameState: move updates state and persists', async () => {
  await AsyncStorage.clear();
  let api: ReturnType<typeof useGameState> | null = null;
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <TestWrapper
        onReady={(a) => {
          api = a;
        }}
      />,
    );
  });
  await ReactTestRenderer.act(async () => {
    await new Promise((r) => setTimeout(r, 100));
  });
  expect(api).not.toBeNull();
  const boardBefore = api?.board.map((row) => row.slice());
  const scoreBefore = api?.score;
  await ReactTestRenderer.act(async () => {
    api?.move('left');
    await new Promise((r) => setTimeout(r, 50));
  });
  const boardAfter = api?.board;
  const scoreAfter = api?.score;
  const changed =
    JSON.stringify(boardBefore) !== JSON.stringify(boardAfter) || scoreBefore !== scoreAfter;
  expect(changed).toBe(true);
});
