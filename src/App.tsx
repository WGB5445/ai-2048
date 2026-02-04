/**
 * App root: SafeArea + GameScreen + Petra Deep Link listener
 */

import { useEffect } from 'react';
import { Alert, Linking, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  handleConnectCallback,
  handleSignAndSubmitCallback,
  setOnConnectResult,
  setOnSubmitResult,
} from './aptos/petraDeepLink';
import { GameScreen } from './screens/GameScreen';

function parseQuery(url: string): { response: string | null; data: string | null } {
  const i = url.indexOf('?');
  if (i < 0) return { response: null, data: null };
  const q = url.slice(i + 1);
  const params: Record<string, string> = {};
  for (const part of q.split('&')) {
    const [k, v] = part.split('=');
    if (k && v != null) params[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return { response: params.response ?? null, data: params.data ?? null };
}

function handleUrl(url: string | null): void {
  if (!url || !url.startsWith('ai2048://')) return;
  try {
    const path = url.replace('ai2048://', '').split('?')[0] ?? '';
    const { response, data } = parseQuery(url);
    if (path.includes('connect')) {
      handleConnectCallback(response, data);
    } else if (path.includes('response')) {
      handleSignAndSubmitCallback(response, data);
    }
  } catch {
    // ignore parse errors
  }
}

export default function App() {
  useEffect(() => {
    setOnConnectResult((approved) => {
      Alert.alert(
        approved ? 'Connected' : 'Rejected',
        approved ? 'Petra wallet connected.' : 'Connection was rejected.',
      );
    });
    setOnSubmitResult((success, message) => {
      Alert.alert(
        success ? 'Score submitted' : 'Upload failed',
        success
          ? 'Your score was submitted on-chain.'
          : (message ?? 'Transaction was rejected or failed.'),
      );
    });
    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => {
      sub.remove();
      setOnConnectResult(null);
      setOnSubmitResult(null);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <GameScreen />
    </SafeAreaProvider>
  );
}
