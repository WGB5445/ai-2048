/**
 * Single tile (value 2, 4, ...) with Reanimated spawn and merge-pop animations
 */

import { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { getTileBackground, getTileTextColor } from '../theme/colors';

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

interface TileProps {
  value: number;
  size: number;
  fontSize: number;
}

export function Tile({ value, size, fontSize }: TileProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const prevValue = useRef(0);

  useEffect(() => {
    if (value === 0) {
      prevValue.current = 0;
      return;
    }
    if (prevValue.current === 0) {
      scale.value = 0.5;
      opacity.value = 0;
      scale.value = withSpring(1, SPRING_CONFIG);
      opacity.value = withTiming(1, { duration: 120 });
    } else if (value > prevValue.current) {
      scale.value = withSpring(1.15, SPRING_CONFIG);
      scale.value = withSpring(1, SPRING_CONFIG);
    }
    prevValue.current = value;
  }, [value, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (value === 0) return null;
  const backgroundColor = getTileBackground(value);
  const color = getTileTextColor(value);
  return (
    <Animated.View
      style={[styles.tile, { width: size, height: size, backgroundColor }, animatedStyle]}
    >
      <Text style={[styles.text, { fontSize, color }]} numberOfLines={1}>
        {value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
});
