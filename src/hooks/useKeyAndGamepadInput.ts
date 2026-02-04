/**
 * Subscribe to hardware keyboard and gamepad (D-pad) and map to game direction.
 * Uses only onKeyUp: iOS RNKeyEvent supports onKeyUp only; Android sends keyCode on keyUp too.
 * Android: keyCode 19/20/21/22 (DPAD_UP/DOWN/LEFT/RIGHT). iOS: pressedKey (arrow keys + w/a/s/d).
 */

import { useEffect } from 'react';
import KeyEvent from 'react-native-keyevent';
import type { Direction } from '../game/types';

const ANDROID_DPAD_UP = 19;
const ANDROID_DPAD_DOWN = 20;
const ANDROID_DPAD_LEFT = 21;
const ANDROID_DPAD_RIGHT = 22;

interface KeyEventPayload {
  keyCode?: number;
  pressedKey?: string;
  repeatcount?: number;
}

function keyEventToDirection(event: KeyEventPayload): Direction | null {
  if (event.keyCode !== undefined) {
    switch (event.keyCode) {
      case ANDROID_DPAD_UP:
        return 'up';
      case ANDROID_DPAD_DOWN:
        return 'down';
      case ANDROID_DPAD_LEFT:
        return 'left';
      case ANDROID_DPAD_RIGHT:
        return 'right';
      default:
        break;
    }
  }
  const p = (event.pressedKey ?? '').toLowerCase();
  switch (p) {
    case 'w':
      return 'up';
    case 's':
      return 'down';
    case 'a':
      return 'left';
    case 'd':
      return 'right';
    default:
      break;
  }
  // iOS arrow keys (UIKeyCommand may send these strings or Unicode)
  const key = event.pressedKey ?? '';
  if (key === 'Up Arrow' || key === '\uF700' || key === 'UIKeyInputUpArrow') return 'up';
  if (key === 'Down Arrow' || key === '\uF701' || key === 'UIKeyInputDownArrow') return 'down';
  if (key === 'Left Arrow' || key === '\uF702' || key === 'UIKeyInputLeftArrow') return 'left';
  if (key === 'Right Arrow' || key === '\uF703' || key === 'UIKeyInputRightArrow') return 'right';
  return null;
}

/** Human-readable label for debugging (e.g. "W", "↑", "keyCode: 19") */
export function keyEventToDisplayLabel(event: KeyEventPayload): string {
  if (event.keyCode !== undefined) {
    switch (event.keyCode) {
      case ANDROID_DPAD_UP:
        return '↑';
      case ANDROID_DPAD_DOWN:
        return '↓';
      case ANDROID_DPAD_LEFT:
        return '←';
      case ANDROID_DPAD_RIGHT:
        return '→';
      default:
        return `keyCode: ${event.keyCode}`;
    }
  }
  const p = (event.pressedKey ?? '').trim();
  if (!p) return '(empty)';
  const lower = p.toLowerCase();
  if (lower === 'w') return 'W';
  if (lower === 'a') return 'A';
  if (lower === 's') return 'S';
  if (lower === 'd') return 'D';
  if (p === 'Up Arrow' || p === '\uF700' || p === 'UIKeyInputUpArrow') return '↑';
  if (p === 'Down Arrow' || p === '\uF701' || p === 'UIKeyInputDownArrow') return '↓';
  if (p === 'Left Arrow' || p === '\uF702' || p === 'UIKeyInputLeftArrow') return '←';
  if (p === 'Right Arrow' || p === '\uF703' || p === 'UIKeyInputRightArrow') return '→';
  return p;
}

export interface UseKeyAndGamepadInputOptions {
  onDirection: (direction: Direction) => void;
  /** Optional: called on every key up with a display label (for debug overlay) */
  onKeyDisplay?: (label: string) => void;
}

export function useKeyAndGamepadInput(
  onDirectionOrOptions: ((direction: Direction) => void) | UseKeyAndGamepadInputOptions,
): void {
  const onDirection =
    typeof onDirectionOrOptions === 'function'
      ? onDirectionOrOptions
      : onDirectionOrOptions.onDirection;
  const onKeyDisplay =
    typeof onDirectionOrOptions === 'function' ? undefined : onDirectionOrOptions.onKeyDisplay;

  useEffect(() => {
    const handleKeyUp = (event: KeyEventPayload) => {
      const label = keyEventToDisplayLabel(event);
      onKeyDisplay?.(label);
      const direction = keyEventToDirection(event);
      if (direction) onDirection(direction);
    };

    KeyEvent.onKeyUpListener(handleKeyUp);

    return () => {
      KeyEvent.removeKeyUpListener();
    };
  }, [onDirection, onKeyDisplay]);
}
