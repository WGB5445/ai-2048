/**
 * Game over / Win overlay with message and action button
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

interface GameOverProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  onPress: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
}

export function GameOver({
  title,
  subtitle,
  buttonText,
  onPress,
  secondaryButtonText,
  onSecondaryPress,
}: GameOverProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        {subtitle != null && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={styles.buttons}>
          {secondaryButtonText != null && onSecondaryPress != null && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onSecondaryPress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{secondaryButtonText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.light,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.light,
    marginBottom: 16,
  },
  buttons: {
    gap: 12,
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.boardBg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    minWidth: 160,
  },
  secondaryButton: {
    backgroundColor: colors.emptyCell,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
});
