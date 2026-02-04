/**
 * Main game screen: board, score, high score, swipe gesture, keyboard/gamepad, restore prompt, game over/win overlay
 */

import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signAndSubmitScore } from '../aptos/petraDeepLink';
import { GameBoard } from '../components/Board';
import { GameOver } from '../components/GameOver';
import { useGameState } from '../hooks/useGameState';
import { useKeyAndGamepadInput } from '../hooks/useKeyAndGamepadInput';
import { useResponsive } from '../hooks/useResponsive';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { colors } from '../theme/colors';

export function GameScreen() {
  const layout = useResponsive();
  const {
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
  } = useGameState();

  const panGesture = useSwipeGesture(move);
  const [lastKeyDisplay, setLastKeyDisplay] = useState<string | null>(null);
  useKeyAndGamepadInput({ onDirection: move, onKeyDisplay: setLastKeyDisplay });
  const restorePromptShown = useRef(false);

  useEffect(() => {
    if (savedStateAvailable && !hasRestored && !restorePromptShown.current) {
      restorePromptShown.current = true;
      Alert.alert(
        'Resume game?',
        'You have a saved game. Resume or start new?',
        [
          { text: 'New Game', onPress: () => startNewGame() },
          { text: 'Resume', onPress: () => restoreGame() },
        ],
        { cancelable: false },
      );
    }
  }, [savedStateAvailable, hasRestored, startNewGame, restoreGame]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header} testID="game-header">
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, { fontSize: layout.scoreFontSize * 0.6 }]}>Score</Text>
            <Text style={[styles.scoreValue, { fontSize: layout.scoreFontSize }]}>{score}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, { fontSize: layout.scoreFontSize * 0.6 }]}>Best</Text>
            <Text style={[styles.scoreValue, { fontSize: layout.scoreFontSize }]}>{highScore}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.newGameButton}
          onPress={startNewGame}
          activeOpacity={0.8}
          testID="new-game-button"
        >
          <Text style={styles.newGameText}>New Game</Text>
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <View style={styles.gameArea}>
          <View style={styles.boardWrapper}>
            <GameBoard
              board={board}
              cellSize={layout.cellSize}
              cellGap={layout.cellGap}
              tileFontSize={layout.tileFontSize}
            />
          </View>
        </View>
      </GestureDetector>
      {won && (
        <GameOver
          title="You Win!"
          subtitle="Reached 2048"
          buttonText="Keep Playing"
          onPress={acknowledgeWin}
        />
      )}
      {gameOver && !won && (
        <GameOver
          title="Game Over"
          subtitle={`Score: ${score}`}
          buttonText="Try Again"
          onPress={startNewGame}
          secondaryButtonText="Upload Score with Petra"
          onSecondaryPress={async () => {
            try {
              await signAndSubmitScore(score);
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              let message: string;
              if (msg.includes('Native module not found')) {
                message =
                  '上传功能需要重新构建应用。请执行：cd ios && pod install，然后重新运行应用。';
              } else if (msg.includes('Unable to open') || msg.toLowerCase().includes('petra')) {
                message =
                  '无法打开 Petra。请在此设备上安装 Petra 钱包 App 后再试；模拟器上需先安装 Petra 才能上传分数。';
              } else {
                message = `上传失败：${msg}`;
              }
              Alert.alert('上传分数', message);
            }
          }}
        />
      )}
      {/* Temporary key display for debugging hardware keyboard - always visible at top */}
      <View style={styles.keyDisplay} pointerEvents="none">
        <Text style={styles.keyDisplayLabel}>按键（键盘调试）</Text>
        <Text style={styles.keyDisplayValue}>{lastKeyDisplay ?? '—'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreBox: {
    backgroundColor: colors.boardBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  scoreLabel: {
    color: colors.text.dark,
    fontWeight: '600',
  },
  scoreValue: {
    color: colors.text.dark,
    fontWeight: 'bold',
  },
  newGameButton: {
    backgroundColor: colors.boardBg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  newGameText: {
    color: colors.text.dark,
    fontWeight: 'bold',
    fontSize: 16,
  },
  keyDisplay: {
    position: 'absolute',
    top: 88,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  keyDisplayLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginBottom: 4,
  },
  keyDisplayValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    minHeight: 24,
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
