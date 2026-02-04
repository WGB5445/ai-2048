/**
 * Parse Pan gesture into direction (left/right/up/down) and invoke callback on swipe end
 */

import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { Direction } from '../game/types';

const MIN_DISTANCE = 20;
const MIN_VELOCITY = 300;

export function useSwipeGesture(onSwipe: (direction: Direction) => void) {
  const handleEnd = useCallback(
    (x: number, y: number, vx: number, vy: number) => {
      const absX = Math.abs(x);
      const absY = Math.abs(y);
      const absVx = Math.abs(vx);
      const absVy = Math.abs(vy);
      const useVelocity = absVx > MIN_VELOCITY || absVy > MIN_VELOCITY;
      if (useVelocity) {
        if (absVx >= absVy) {
          onSwipe(vx > 0 ? 'right' : 'left');
        } else {
          onSwipe(vy > 0 ? 'down' : 'up');
        }
        return;
      }
      if (absX < MIN_DISTANCE && absY < MIN_DISTANCE) return;
      if (absX >= absY) {
        onSwipe(x > 0 ? 'right' : 'left');
      } else {
        onSwipe(y > 0 ? 'down' : 'up');
      }
    },
    [onSwipe],
  );

  const panGesture = Gesture.Pan()
    .minDistance(10)
    .onEnd((e) => {
      runOnJS(handleEnd)(
        e.translationX,
        e.translationY,
        e.velocityX,
        e.velocityY,
      );
    });

  return panGesture;
}
