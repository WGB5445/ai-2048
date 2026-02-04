/**
 * Jest setup: mock native modules that are not available in Jest env
 */
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Gesture = {
    Pan: () => ({
      minDistance: () => ({
        onEnd: () => ({}),
      }),
    }),
  };
  return {
    Gesture,
    GestureDetector: ({ children }) => React.createElement(View, null, children),
    GestureHandlerRootView: View,
  };
});

jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  const identity = (x) => x;
  return {
    useSharedValue: (init) => ({ value: init }),
    useAnimatedStyle: (fn) => fn?.() ?? {},
    withSpring: identity,
    withTiming: identity,
    withSequence: identity,
    runOnJS: (fn) => fn,
    Easing: { linear: identity },
    default: {
      View,
      Text,
      createAnimatedComponent: (C) => C,
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-keyevent', () => ({
  default: {
    onKeyDownListener: () => {},
    onKeyUpListener: () => {},
    removeKeyDownListener: () => {},
    removeKeyUpListener: () => {},
  },
}));
