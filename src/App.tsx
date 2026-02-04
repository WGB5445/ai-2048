/**
 * App root: SafeArea + GameScreen
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameScreen } from './screens/GameScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <GameScreen />
    </SafeAreaProvider>
  );
}
